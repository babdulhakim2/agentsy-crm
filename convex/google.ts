// Google Business Profile integration — actions only (node module).
// OAuth state CRUD lives in convex/oauthState.ts; site lookups in convex/sites.ts.

"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPES = ["https://www.googleapis.com/auth/business.manage", "openid", "email"];

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: "Bearer";
  scope: string;
  obtained_at: number;
}

interface ConnectionConfig {
  tokens: GoogleTokens;
  accountId?: string;
  locationId?: string;
  email?: string;
}

function env(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} not set in Convex environment.`);
  return val;
}

/**
 * Build the OAuth consent URL. The browser is expected to navigate here.
 */
export const startOAuth = action({
  args: {
    groupId: v.id("groups"),
    siteId: v.optional(v.id("sites")),
    redirectAfter: v.string(),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const { state } = await ctx.runMutation(internal.oauthState.start, {
      groupId: args.groupId,
      siteId: args.siteId,
      provider: "google_business",
      redirectAfter: args.redirectAfter,
    });

    const params = new URLSearchParams({
      client_id: env("GOOGLE_CLIENT_ID"),
      redirect_uri: env("GOOGLE_REDIRECT_URI"),
      response_type: "code",
      scope: SCOPES.join(" "),
      access_type: "offline",
      prompt: "consent",
      state,
    });
    return { url: `${AUTH_URL}?${params.toString()}` };
  },
});

export const handleCallback = internalAction({
  args: { code: v.string(), state: v.string() },
  handler: async (ctx, args): Promise<{ redirectAfter: string }> => {
    const stateRow = await ctx.runQuery(internal.oauthState.read, { state: args.state });
    if (!stateRow) throw new Error("Unknown or expired OAuth state.");
    if (stateRow.expiresAt < Date.now()) throw new Error("OAuth state expired.");

    const body = new URLSearchParams({
      code: args.code,
      client_id: env("GOOGLE_CLIENT_ID"),
      client_secret: env("GOOGLE_CLIENT_SECRET"),
      redirect_uri: env("GOOGLE_REDIRECT_URI"),
      grant_type: "authorization_code",
    });
    const tokRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!tokRes.ok) throw new Error(`Token exchange failed: ${await tokRes.text()}`);
    const tokens: Omit<GoogleTokens, "obtained_at"> = await tokRes.json();
    const stored: GoogleTokens = { ...tokens, obtained_at: Date.now() };
    const config: ConnectionConfig = { tokens: stored };

    await ctx.runMutation(internal.connections.upsert, {
      groupId: stateRow.groupId,
      siteId: stateRow.siteId,
      provider: "google_business",
      status: "green",
      config: JSON.stringify(config),
      lastSyncAt: Date.now(),
    });

    await ctx.runMutation(internal.oauthState.del, { id: stateRow._id });
    return { redirectAfter: stateRow.redirectAfter };
  },
});

async function refreshIfNeeded(config: ConnectionConfig): Promise<ConnectionConfig> {
  const expiresAt = config.tokens.obtained_at + (config.tokens.expires_in - 60) * 1000;
  if (Date.now() < expiresAt) return config;
  if (!config.tokens.refresh_token) throw new Error("No refresh token; reconnect required.");

  const body = new URLSearchParams({
    refresh_token: config.tokens.refresh_token,
    client_id: env("GOOGLE_CLIENT_ID"),
    client_secret: env("GOOGLE_CLIENT_SECRET"),
    grant_type: "refresh_token",
  });
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) throw new Error(`Refresh failed: ${await r.text()}`);
  const newTokens = await r.json();
  return {
    ...config,
    tokens: {
      ...config.tokens,
      access_token: newTokens.access_token,
      expires_in: newTokens.expires_in,
      obtained_at: Date.now(),
    },
  };
}

async function gbpFetch(path: string, accessToken: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : `https://mybusiness.googleapis.com/v4/${path}`;
  const r = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!r.ok) throw new Error(`GBP ${r.status}: ${await r.text()}`);
  return r.json();
}

export const syncReviews = action({
  args: { groupId: v.id("groups"), siteId: v.id("sites") },
  handler: async (ctx, args): Promise<{ count: number }> => {
    const site = await ctx.runQuery(internal.sites.getInternal, { id: args.siteId });
    if (!site) throw new Error("Site not found");
    if (!site.gbpLocationId) throw new Error("Site has no Google Business Profile location set.");

    const conn = await ctx.runMutation(internal.connections.getInternal, {
      groupId: args.groupId,
      provider: "google_business",
      siteId: args.siteId,
    });
    if (!conn) throw new Error("Google Business not connected for this site.");

    let config: ConnectionConfig = JSON.parse(conn.config);
    config = await refreshIfNeeded(config);

    await ctx.runMutation(internal.connections.upsert, {
      groupId: args.groupId,
      siteId: args.siteId,
      provider: "google_business",
      status: "green",
      config: JSON.stringify(config),
      lastSyncAt: Date.now(),
    });

    const accountId = config.accountId;
    if (!accountId) throw new Error("Connection missing GBP accountId; reconnect.");
    const path = `accounts/${accountId}/locations/${site.gbpLocationId}/reviews`;
    const json = (await gbpFetch(path, config.tokens.access_token)) as {
      reviews?: Array<{
        name: string;
        reviewer: { displayName?: string };
        starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
        comment?: string;
        createTime: string;
      }>;
    };

    const STAR_MAP = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 } as const;
    let count = 0;
    for (const r of json.reviews ?? []) {
      await ctx.runMutation(internal.reviews.upsert, {
        groupId: args.groupId,
        siteId: args.siteId,
        externalId: r.name,
        author: r.reviewer.displayName ?? "Anonymous",
        stars: STAR_MAP[r.starRating],
        text: r.comment ?? "",
        createdAt: new Date(r.createTime).getTime(),
      });
      count += 1;
    }
    return { count };
  },
});

export const postReviewReply = internalAction({
  args: { reviewId: v.id("reviews"), replyText: v.string() },
  handler: async (ctx, args): Promise<void> => {
    const review = await ctx.runQuery(internal.reviews.getInternal, { id: args.reviewId });
    if (!review) throw new Error("Review not found");

    const conn = await ctx.runMutation(internal.connections.getInternal, {
      groupId: review.groupId,
      provider: "google_business",
      siteId: review.siteId,
    });
    if (!conn) throw new Error("Google Business not connected.");

    let config: ConnectionConfig = JSON.parse(conn.config);
    config = await refreshIfNeeded(config);

    await gbpFetch(`${review.externalId}/reply`, config.tokens.access_token, {
      method: "PUT",
      body: JSON.stringify({ comment: args.replyText }),
    });

    await ctx.runMutation(internal.connections.upsert, {
      groupId: review.groupId,
      siteId: review.siteId,
      provider: "google_business",
      status: "green",
      config: JSON.stringify(config),
      lastSyncAt: Date.now(),
    });
  },
});
