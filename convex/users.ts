import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";

async function requireIdentity(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated.");
  return identity;
}

export const upsertCurrent = mutation({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const now = Date.now();
    const email = args.email ?? identity.email;
    if (!email) throw new Error("Clerk user needs an email address.");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        name: args.name ?? identity.name ?? existing.name,
        imageUrl: args.imageUrl ?? identity.pictureUrl ?? existing.imageUrl,
        lastSeenAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: identity.subject,
      email,
      name: args.name ?? identity.name,
      imageUrl: args.imageUrl ?? identity.pictureUrl,
      createdAt: now,
      lastSeenAt: now,
    });
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!user) return null;

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const tenants = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        const sites = await ctx.db
          .query("sites")
          .withIndex("by_group", (q) => q.eq("groupId", membership.groupId))
          .collect();
        const visibleSites =
          membership.siteIds.length > 0
            ? sites.filter((site) => membership.siteIds.includes(site._id))
            : sites;
        return { membership, group, sites: visibleSites };
      })
    );

    return { user, tenants };
  },
});
