import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getInternal = internalQuery({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) =>
    ctx.db
      .query("brandVoice")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .unique(),
});

export const get = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brandVoice")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .unique();
  },
});

export const setSummary = mutation({
  args: {
    groupId: v.id("groups"),
    summary: v.string(),
    rules: v.array(v.string()),
    bannedWords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("brandVoice")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        summary: args.summary,
        rules: args.rules,
        bannedWords: args.bannedWords,
      });
      return existing._id;
    }
    return await ctx.db.insert("brandVoice", {
      ...args,
      examplesCount: 0,
      lastTrainedAt: Date.now(),
    });
  },
});
