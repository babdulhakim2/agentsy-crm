// Reviews — list, draft via OpenRouter Gemini, post reply via GBP.

import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const getInternal = internalQuery({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const list = query({
  args: { groupId: v.id("groups"), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("reviews")
      .withIndex("by_group_status", (q) =>
        args.status
          ? q.eq("groupId", args.groupId).eq("status", args.status)
          : q.eq("groupId", args.groupId)
      )
      .order("desc")
      .take(50);
    return rows;
  },
});

export const upsert = internalMutation({
  args: {
    groupId: v.id("groups"),
    siteId: v.id("sites"),
    externalId: v.string(),
    author: v.string(),
    stars: v.number(),
    text: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_external", (q) => q.eq("source", "gbp").eq("externalId", args.externalId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        stars: args.stars,
        text: args.text,
      });
      return existing._id;
    }
    return await ctx.db.insert("reviews", {
      ...args,
      source: "gbp",
      flagged: args.stars <= 3,
      status: "needs_reply",
    });
  },
});

export const setDraft = mutation({
  args: { id: v.id("reviews"), draft: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      draft: args.draft,
      draftedAt: Date.now(),
      status: "drafted",
    });
  },
});

export const skip = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "skipped" });
  },
});

export const markSent = internalMutation({
  args: { id: v.id("reviews"), replyText: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      replyText: args.replyText,
      repliedAt: Date.now(),
      status: "sent",
    });
  },
});

/**
 * Generate an AI draft reply via OpenRouter → Gemini.
 * Public action — call from the client when the owner taps Refresh draft.
 */
export const draft = action({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args): Promise<string> => {
    const draft: string = await ctx.runAction(internal.ai.draftReviewReply, {
      reviewId: args.reviewId,
    });
    await ctx.runMutation(internal.reviews._setDraftFromAction, {
      id: args.reviewId,
      draft,
    });
    return draft;
  },
});

export const _setDraftFromAction = internalMutation({
  args: { id: v.id("reviews"), draft: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      draft: args.draft,
      draftedAt: Date.now(),
      status: "drafted",
    });
  },
});

/**
 * Approve & post — sends the reply to GBP and marks sent.
 */
export const approveAndPost = action({
  args: { reviewId: v.id("reviews"), text: v.string() },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    await ctx.runAction(internal.google.postReviewReply, {
      reviewId: args.reviewId,
      replyText: args.text,
    });
    await ctx.runMutation(internal.reviews.markSent, {
      id: args.reviewId,
      replyText: args.text,
    });
    return { ok: true };
  },
});
