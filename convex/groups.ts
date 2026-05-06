import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getInternal = internalQuery({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const ensureDefault = mutation({
  args: { name: v.string(), timezone: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("groups").first();
    if (existing) return existing._id;
    return await ctx.db.insert("groups", {
      name: args.name,
      timezone: args.timezone,
      createdAt: Date.now(),
    });
  },
});

export const get = query({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const first = query({
  args: {},
  handler: async (ctx) => ctx.db.query("groups").first(),
});
