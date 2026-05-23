import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const enquiryNeed = v.union(
  v.literal("catering"),
  v.literal("order"),
  v.literal("booking"),
  v.literal("review"),
  v.literal("other")
);
const enquiryStage = v.union(
  v.literal("new"),
  v.literal("quoted"),
  v.literal("confirmed"),
  v.literal("lost"),
  v.literal("review_requested")
);

type AnyCtx = QueryCtx | MutationCtx;

async function requireMembership(ctx: AnyCtx, groupId: Id<"groups">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated.");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found.");

  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_group_user", (q) => q.eq("groupId", groupId).eq("userId", user._id))
    .unique();
  if (!membership || membership.status !== "active") throw new Error("No active membership for this restaurant.");
  return { user, membership };
}

async function firstCurrentMembership(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
  if (!user) return null;
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .first();
  if (!membership || membership.status !== "active") return null;
  return { user, membership };
}

function clean(value?: string) {
  const next = value?.trim();
  return next ? next : undefined;
}

export const listCurrent = query({
  args: { siteId: v.optional(v.id("sites")) },
  handler: async (ctx, args) => {
    const current = await firstCurrentMembership(ctx);
    if (!current) return null;
    const all = await ctx.db
      .query("whatsappEnquiries")
      .withIndex("by_group_receivedAt", (q) => q.eq("groupId", current.membership.groupId))
      .order("desc")
      .take(100);
    return args.siteId ? all.filter((row) => row.siteId === args.siteId) : all;
  },
});

export const listForGroup = query({
  args: { groupId: v.id("groups"), siteId: v.optional(v.id("sites")) },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.groupId);
    const all = await ctx.db
      .query("whatsappEnquiries")
      .withIndex("by_group_receivedAt", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(100);
    return args.siteId ? all.filter((row) => row.siteId === args.siteId) : all;
  },
});

export const log = mutation({
  args: {
    groupId: v.id("groups"),
    siteId: v.optional(v.id("sites")),
    whatsappAccountId: v.optional(v.id("whatsappAccounts")),
    customerId: v.optional(v.id("customers")),
    customerName: v.string(),
    phone: v.optional(v.string()),
    source: v.string(),
    need: enquiryNeed,
    stage: v.optional(enquiryStage),
    valueCents: v.optional(v.number()),
    notes: v.optional(v.string()),
    receivedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.groupId);
    const now = Date.now();
    if (args.siteId) {
      const site = await ctx.db.get(args.siteId);
      if (!site || site.groupId !== args.groupId) throw new Error("Site does not belong to this restaurant.");
    }
    return await ctx.db.insert("whatsappEnquiries", {
      groupId: args.groupId,
      siteId: args.siteId,
      whatsappAccountId: args.whatsappAccountId,
      customerId: args.customerId,
      customerName: args.customerName.trim() || "WhatsApp lead",
      phone: clean(args.phone),
      source: args.source,
      need: args.need,
      stage: args.stage ?? "new",
      valueCents: args.valueCents,
      notes: clean(args.notes),
      receivedAt: args.receivedAt ?? now,
      updatedAt: now,
    });
  },
});

export const updateStage = mutation({
  args: {
    id: v.id("whatsappEnquiries"),
    stage: enquiryStage,
    valueCents: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error("Enquiry not found.");
    await requireMembership(ctx, row.groupId);
    await ctx.db.patch(args.id, {
      stage: args.stage,
      valueCents: args.valueCents ?? row.valueCents,
      notes: clean(args.notes) ?? row.notes,
      updatedAt: Date.now(),
    });
  },
});
