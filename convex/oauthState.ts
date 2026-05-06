// OAuth-state CRUD lives outside node-mode Convex files so queries/mutations are valid.

import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a fresh OAuth state row. Internal — only the google.startOAuth action calls this.
 */
export const start = internalMutation({
  args: {
    groupId: v.id("groups"),
    siteId: v.optional(v.id("sites")),
    provider: v.string(),
    redirectAfter: v.string(),
  },
  handler: async (ctx, args) => {
    const state = crypto.randomUUID();
    await ctx.db.insert("oauthState", {
      state,
      groupId: args.groupId,
      siteId: args.siteId,
      provider: args.provider,
      redirectAfter: args.redirectAfter,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    return { state };
  },
});

export const read = internalQuery({
  args: { state: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("oauthState")
      .withIndex("by_state", (q) => q.eq("state", args.state))
      .unique(),
});

export const del = internalMutation({
  args: { id: v.id("oauthState") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
