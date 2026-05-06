// Trustpilot integration — actions only (node module).
// Trustpilot offers a B2B Reviews API. Auth is OAuth 2.0 (client credentials).
// We mirror the google.ts shape so connect/sync behaves the same way.

"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const API_BASE = "https://api.trustpilot.com/v1";

interface TrustpilotConfig {
  apiKey: string;
  apiSecret: string;
  businessUnitId: string; // Trustpilot's identifier for the location
  accessToken?: string;
  obtainedAt?: number;
  expiresIn?: number;
}

function env(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} not set in Convex environment.`);
  return val;
}

async function getAccessToken(config: TrustpilotConfig): Promise<TrustpilotConfig> {
  const fresh =
    config.accessToken &&
    config.obtainedAt &&
    Date.now() < config.obtainedAt + (config.expiresIn ?? 0) * 1000 - 60_000;
  if (fresh) return config;

  // Trustpilot's client-credentials grant.
  const body = new URLSearchParams({
    grant_type: "client_credentials",
  });
  const r = await fetch(`${API_BASE}/oauth/oauth-business-users-for-applications/accesstoken`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!r.ok) throw new Error(`Trustpilot token failed: ${await r.text()}`);
  const json = (await r.json()) as { access_token: string; expires_in: number };
  return {
    ...config,
    accessToken: json.access_token,
    obtainedAt: Date.now(),
    expiresIn: json.expires_in,
  };
}

/**
 * Stub OAuth start — Trustpilot is API-key based, so we just persist the
 * key/secret/businessUnitId pair the operator provides.
 */
export const connect = action({
  args: {
    groupId: v.id("groups"),
    siteId: v.id("sites"),
    apiKey: v.string(),
    apiSecret: v.string(),
    businessUnitId: v.string(),
  },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const config: TrustpilotConfig = {
      apiKey: args.apiKey,
      apiSecret: args.apiSecret,
      businessUnitId: args.businessUnitId,
    };
    // Verify by fetching a token immediately.
    await getAccessToken(config);

    await ctx.runMutation(internal.connections.upsert, {
      groupId: args.groupId,
      siteId: args.siteId,
      provider: "trustpilot",
      status: "green",
      config: JSON.stringify(config),
      lastSyncAt: Date.now(),
    });
    return { ok: true };
  },
});

/**
 * Pull recent reviews for a site. Idempotent on (source, externalId) via reviews.upsert.
 */
export const syncReviews = action({
  args: { groupId: v.id("groups"), siteId: v.id("sites") },
  handler: async (ctx, args): Promise<{ count: number }> => {
    const conn = await ctx.runMutation(internal.connections.getInternal, {
      groupId: args.groupId,
      provider: "trustpilot",
      siteId: args.siteId,
    });
    if (!conn) throw new Error("Trustpilot not connected for this site.");

    let config: TrustpilotConfig = JSON.parse(conn.config);
    config = await getAccessToken(config);

    const r = await fetch(
      `${API_BASE}/business-units/${config.businessUnitId}/reviews?perPage=50`,
      {
        headers: {
          apiKey: config.apiKey,
          Authorization: `Bearer ${config.accessToken}`,
        },
      }
    );
    if (!r.ok) throw new Error(`Trustpilot fetch failed: ${await r.text()}`);
    const json = (await r.json()) as {
      reviews?: Array<{
        id: string;
        consumer: { displayName?: string };
        stars: number;
        text?: string;
        createdAt: string;
      }>;
    };

    let count = 0;
    for (const r of json.reviews ?? []) {
      await ctx.runMutation(internal.reviews.upsert, {
        groupId: args.groupId,
        siteId: args.siteId,
        externalId: `trustpilot:${r.id}`,
        author: r.consumer.displayName ?? "Anonymous",
        stars: r.stars,
        text: r.text ?? "",
        createdAt: new Date(r.createdAt).getTime(),
      });
      count += 1;
    }

    await ctx.runMutation(internal.connections.upsert, {
      groupId: args.groupId,
      siteId: args.siteId,
      provider: "trustpilot",
      status: "green",
      config: JSON.stringify(config),
      lastSyncAt: Date.now(),
    });
    return { count };
  },
});

/**
 * Post a reply to a Trustpilot review. Used by reviews.approveAndPost when source is trustpilot.
 */
export const postReply = internalAction({
  args: { reviewId: v.id("reviews"), replyText: v.string() },
  handler: async (ctx, args): Promise<void> => {
    const review = await ctx.runQuery(internal.reviews.getInternal, { id: args.reviewId });
    if (!review) throw new Error("Review not found");

    const conn = await ctx.runMutation(internal.connections.getInternal, {
      groupId: review.groupId,
      provider: "trustpilot",
      siteId: review.siteId,
    });
    if (!conn) throw new Error("Trustpilot not connected.");

    let config: TrustpilotConfig = JSON.parse(conn.config);
    config = await getAccessToken(config);

    const tpId = review.externalId.replace(/^trustpilot:/, "");
    const r = await fetch(
      `${API_BASE}/private/reviews/${tpId}/reply`,
      {
        method: "POST",
        headers: {
          apiKey: config.apiKey,
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: args.replyText }),
      }
    );
    if (!r.ok) throw new Error(`Trustpilot reply failed: ${await r.text()}`);
  },
});
