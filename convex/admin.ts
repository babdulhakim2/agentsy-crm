// Platform admin — onboard new restaurants, list existing.

import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

async function requirePlatformAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  const email = identity?.email?.toLowerCase();
  if (!identity || !email) throw new Error("Not authenticated.");

  const firstAdmin = await ctx.db.query("platformAdmins").first();
  if (!firstAdmin) {
    if ("insert" in ctx.db) {
      await ctx.db.insert("platformAdmins", {
        email,
        name: identity.name ?? email,
        createdAt: Date.now(),
      });
      return;
    }
    throw new Error("No platform admin has been bootstrapped yet.");
  }

  const admin = await ctx.db
    .query("platformAdmins")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
  if (!admin) throw new Error("Platform admin access required.");
}

export const listRestaurants = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    const groups = await ctx.db.query("groups").collect();
    return Promise.all(
      groups.map(async (g) => {
        const sites = await ctx.db
          .query("sites")
          .withIndex("by_group", (q) => q.eq("groupId", g._id))
          .collect();
        return {
          id: g._id,
          name: g.name,
          timezone: g.timezone,
          createdAt: g.createdAt,
          branchCount: sites.length,
          branches: sites.map((s) => s.name),
        };
      })
    );
  },
});

export const onboardRestaurant = mutation({
  args: {
    name: v.string(),
    timezone: v.string(),
    firstBranchName: v.string(),
    firstBranchAddress: v.optional(v.string()),
    ownerName: v.string(),
    ownerEmail: v.string(),
    ownerPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    if (!args.name.trim() || !args.firstBranchName.trim() || !args.ownerEmail.trim()) {
      throw new Error("Name, first branch and owner email are required.");
    }
    const groupId = await ctx.db.insert("groups", {
      name: args.name.trim(),
      timezone: args.timezone,
      primaryPhone: args.ownerPhone,
      ownerName: args.ownerName.trim(),
      ownerEmail: args.ownerEmail.trim().toLowerCase(),
      plan: "Solo",
      status: "pending",
      onboardingStep: 1,
      createdAt: Date.now(),
    });
    const siteId = await ctx.db.insert("sites", {
      groupId,
      name: args.firstBranchName.trim(),
      address: args.firstBranchAddress,
      city: "London",
      coversToday: 0,
      status: "pending",
      createdAt: Date.now(),
    });
    await ctx.db.insert("invitations", {
      groupId,
      email: args.ownerEmail.trim().toLowerCase(),
      role: "owner",
      status: "pending",
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 86_400_000,
    });
    return { groupId, siteId };
  },
});
