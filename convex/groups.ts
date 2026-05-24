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
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.id);
    if (!group) return null;
    const logoUrl = group.logoStorageId ? await ctx.storage.getUrl(group.logoStorageId) : group.logoUrl;
    return { ...group, logoUrl: logoUrl ?? group.logoUrl };
  },
});

export const first = query({
  args: {},
  handler: async (ctx) => ctx.db.query("groups").first(),
});

export const updateBranding = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireGroupMember(ctx, args.groupId);
    const name = clean(args.name);
    if (!name) throw new Error("Restaurant name is required.");
    const patch: {
      name: string;
      logoStorageId?: Id<"_storage">;
      logoUrl?: string;
    } = { name };
    if (args.logoStorageId) {
      patch.logoStorageId = args.logoStorageId;
      patch.logoUrl = (await ctx.storage.getUrl(args.logoStorageId)) ?? undefined;
    }
    await ctx.db.patch(args.groupId, patch);
    return { groupId: args.groupId, ...patch };
  },
});

export const generateLogoUploadUrl = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    await requireGroupMember(ctx, args.groupId);
    return await ctx.storage.generateUploadUrl();
  },
});
