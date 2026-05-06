import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) =>
    ctx.db
      .query("conversations")
      .withIndex("by_group_lastMessage", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(50),
});

export const messagesIn = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) =>
    ctx.db
      .query("messages")
      .withIndex("by_conversation_sentAt", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect(),
});

export const upsertWithCustomer = internalMutation({
  args: {
    groupId: v.id("groups"),
    customerId: v.id("customers"),
    channel: v.string(),
    aiHandled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .filter((q) => q.eq(q.field("channel"), args.channel))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("conversations", {
      groupId: args.groupId,
      customerId: args.customerId,
      channel: args.channel,
      lastMessageAt: Date.now(),
      aiHandled: args.aiHandled,
      needsHuman: false,
    });
  },
});

export const appendMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    direction: v.string(),
    sender: v.string(),
    body: v.string(),
    waMessageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("messages", {
      ...args,
      sentAt: Date.now(),
    });
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });
    return id;
  },
});

export const flagNeedsHuman = mutation({
  args: { id: v.id("conversations"), needs: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { needsHuman: args.needs });
  },
});
