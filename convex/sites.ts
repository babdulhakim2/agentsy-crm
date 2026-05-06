import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getInternal = internalQuery({
  args: { id: v.id("sites") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const list = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) =>
    ctx.db
      .query("sites")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect(),
});

export const create = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    postcode: v.optional(v.string()),
    coversToday: v.optional(v.number()),
    gbpLocationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("sites", args),
});

// Semantic alias — what the UI calls "Add a branch".
export const addBranch = create;

export const setGbpLocation = mutation({
  args: { siteId: v.id("sites"), gbpLocationId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.siteId, { gbpLocationId: args.gbpLocationId });
  },
});
