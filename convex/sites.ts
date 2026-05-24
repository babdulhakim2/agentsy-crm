import { mutation, query, internalQuery } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

function clean(value?: string): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

function normalizeEmail(email?: string): string | undefined {
  const next = email?.trim().toLowerCase();
  return next || undefined;
}

async function requireGroupMember(ctx: MutationCtx, groupId: Id<"groups">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated.");
  const email = normalizeEmail(identity.email);
  const user =
    (await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique()) ??
    (email
      ? await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .unique()
      : null);
  if (!user) throw new Error("User is not synced yet.");
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_group_user", (q) => q.eq("groupId", groupId).eq("userId", user._id))
    .unique();
  if (!membership || membership.status !== "active") throw new Error("Not a member of this restaurant.");
  return membership;
}

export const getInternal = internalQuery({
  args: { id: v.id("sites") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const list = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) =>
    (await ctx.db
      .query("sites")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect()).filter((site) => site.status !== "archived"),
});

export const create = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    phone: v.optional(v.string()),
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

export const updateVisitReward = mutation({
  args: {
    siteId: v.id("sites"),
    visitsRequired: v.number(),
    rewardLabel: v.string(),
  },
  handler: async (ctx, args) => {
    const site = await ctx.db.get(args.siteId);
    if (!site) throw new Error("Site not found.");
    await requireGroupMember(ctx, site.groupId);
    const visitsRequired = Math.max(1, Math.min(20, Math.round(args.visitsRequired)));
    const rewardLabel = args.rewardLabel.trim().slice(0, 80);
    if (!rewardLabel) throw new Error("Reward label is required.");
    await ctx.db.patch(args.siteId, {
      visitRewardVisits: visitsRequired,
      visitRewardLabel: rewardLabel,
    });
    return { siteId: args.siteId, visitsRequired, rewardLabel };
  },
});

export const createForCurrentUser = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    visitRewardVisits: v.optional(v.number()),
    visitRewardLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const membership = await requireGroupMember(ctx, args.groupId);
    const name = clean(args.name);
    if (!name) throw new Error("Site name is required.");
    const siteId = await ctx.db.insert("sites", {
      groupId: args.groupId,
      name,
      phone: clean(args.phone),
      address: clean(args.address),
      coversToday: 0,
      status: "active",
      visitRewardVisits: args.visitRewardVisits,
      visitRewardLabel: clean(args.visitRewardLabel),
      createdAt: Date.now(),
    });
    if (membership.siteIds.length > 0) {
      await ctx.db.patch(membership._id, {
        siteIds: [...membership.siteIds, siteId],
        updatedAt: Date.now(),
      });
    }
    return siteId;
  },
});

export const updateDetails = mutation({
  args: {
    siteId: v.id("sites"),
    name: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    visitRewardVisits: v.optional(v.number()),
    visitRewardLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const site = await ctx.db.get(args.siteId);
    if (!site) throw new Error("Site not found.");
    await requireGroupMember(ctx, site.groupId);
    const name = clean(args.name);
    if (!name) throw new Error("Site name is required.");
    const visitRewardVisits =
      args.visitRewardVisits === undefined
        ? site.visitRewardVisits
        : Math.max(1, Math.min(20, Math.round(args.visitRewardVisits)));
    const visitRewardLabel = clean(args.visitRewardLabel) ?? site.visitRewardLabel;
    await ctx.db.patch(args.siteId, {
      name,
      phone: clean(args.phone),
      address: clean(args.address),
      visitRewardVisits,
      visitRewardLabel,
    });
    return args.siteId;
  },
});

export const remove = mutation({
  args: { siteId: v.id("sites") },
  handler: async (ctx, args) => {
    const site = await ctx.db.get(args.siteId);
    if (!site) return;
    await requireGroupMember(ctx, site.groupId);
    const activeSites = (await ctx.db
      .query("sites")
      .withIndex("by_group", (q) => q.eq("groupId", site.groupId))
      .collect()).filter((row) => row.status !== "archived");
    if (activeSites.length <= 1) throw new Error("Keep at least one active site.");
    await ctx.db.patch(args.siteId, { status: "archived" });
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_group", (q) => q.eq("groupId", site.groupId))
      .collect();
    await Promise.all(
      memberships.map((membership) =>
        ctx.db.patch(membership._id, {
          siteIds: membership.siteIds.filter((id) => id !== args.siteId),
          updatedAt: Date.now(),
        })
      )
    );
  },
});
