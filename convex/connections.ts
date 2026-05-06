// Connections — provider tokens + status. Internal mutations write secrets;
// public queries return only safe metadata.

import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("connections")
      .withIndex("by_group_provider", (q) => q.eq("groupId", args.groupId))
      .collect();
    return rows.map((r) => ({
      _id: r._id,
      provider: r.provider,
      status: r.status,
      siteId: r.siteId,
      lastSyncAt: r.lastSyncAt,
      lastError: r.lastError,
    }));
  },
});

export const upsert = internalMutation({
  args: {
    groupId: v.id("groups"),
    siteId: v.optional(v.id("sites")),
    provider: v.string(),
    status: v.string(),
    config: v.string(),
    lastSyncAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("connections")
      .withIndex("by_group_provider", (q) =>
        q.eq("groupId", args.groupId).eq("provider", args.provider)
      )
      .filter((q) =>
        args.siteId ? q.eq(q.field("siteId"), args.siteId) : q.eq(q.field("siteId"), undefined)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        config: args.config,
        lastSyncAt: args.lastSyncAt,
        lastError: args.lastError,
      });
      return existing._id;
    }
    return await ctx.db.insert("connections", args);
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("connections"),
    status: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      lastError: args.error,
    });
  },
});

// Internal: read tokens for backend actions only — never call from the client.
export const getInternal = internalMutation({
  args: { groupId: v.id("groups"), provider: v.string(), siteId: v.optional(v.id("sites")) },
  handler: async (ctx, args) => {
    const conn = await ctx.db
      .query("connections")
      .withIndex("by_group_provider", (q) =>
        q.eq("groupId", args.groupId).eq("provider", args.provider)
      )
      .filter((q) =>
        args.siteId ? q.eq(q.field("siteId"), args.siteId) : q.eq(q.field("siteId"), undefined)
      )
      .unique();
    return conn;
  },
});
