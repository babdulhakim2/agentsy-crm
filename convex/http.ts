// HTTP routes — OAuth callbacks + WhatsApp webhook.
// Next.js calls Convex; Convex's HTTP router exposes these endpoints publicly.

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Google OAuth callback.
 * Google redirects here with ?code=...&state=...
 * We exchange the code, store tokens, then bounce the user back to redirectAfter.
 */
http.route({
  path: "/oauth/google/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(`Google declined: ${error}`, { status: 400 });
    }
    if (!code || !state) {
      return new Response("Missing code or state.", { status: 400 });
    }

    try {
      const result = await ctx.runAction(internal.google.handleCallback, { code, state });
      return Response.redirect(result.redirectAfter, 302);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return new Response(`OAuth callback failed: ${msg}`, { status: 500 });
    }
  }),
});

/**
 * WhatsApp webhook — Meta calls us here for inbound messages and status callbacks.
 * GET = verification handshake.
 * POST = message events.
 */
http.route({
  path: "/webhooks/whatsapp",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token && expected && token === expected) {
      return new Response(challenge ?? "", { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }),
});

http.route({
  path: "/webhooks/whatsapp",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.json();
    const groupIdEnv = process.env.DEFAULT_GROUP_ID;
    // payload.entry[].changes[].value.messages[]
    try {
      const entries = (payload.entry ?? []) as Array<{
        changes?: Array<{
          value?: {
            metadata?: {
              phone_number_id?: string;
              display_phone_number?: string;
            };
            messages?: Array<{
              from: string;
              id: string;
              text?: { body?: string };
              type: string;
            }>;
            contacts?: Array<{ profile?: { name?: string } }>;
          };
        }>;
      }>;
      for (const entry of entries) {
        for (const change of entry.changes ?? []) {
          const value = change.value;
          if (!value?.messages) continue;
          for (const msg of value.messages) {
            if (msg.type !== "text" || !msg.text?.body) continue;
            const senderName = value.contacts?.[0]?.profile?.name;
            const inbound: {
              groupId?: any;
              phoneNumberId?: string;
              fromPhone: string;
              body: string;
              waMessageId: string;
              senderName?: string;
            } = {
              phoneNumberId: value.metadata?.phone_number_id,
              fromPhone: "+" + msg.from,
              body: msg.text.body,
              waMessageId: msg.id,
              senderName,
            };
            if (groupIdEnv) inbound.groupId = groupIdEnv;
            await ctx.runAction(internal.whatsapp.processInbound, inbound);
          }
        }
      }
    } catch (err) {
      console.error("WA webhook error", err);
    }
    // Always 200 to Meta to prevent retry storms.
    return new Response("OK", { status: 200 });
  }),
});

export default http;
