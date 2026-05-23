import { internalQuery, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const accountMode = v.union(v.literal("basic"), v.literal("connected"), v.literal("managed"));
const accountStatus = v.union(v.literal("draft"), v.literal("pending"), v.literal("active"), v.literal("blocked"));

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

function waLink(phone: string | undefined, displayName: string, siteName?: string) {
  const digits = phone?.replace(/[^\d]/g, "");
  if (!digits) return undefined;
  const context = siteName ? `${displayName} ${siteName}` : displayName;
  const text = `Hi ${context}, I'd like to ask about an order or catering.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

const defaultFlow = (displayName: string, siteName?: string) =>
  JSON.stringify({
    intent: "order_or_catering",
    greeting: `Hi ${siteName ? `${displayName} ${siteName}` : displayName}, I'd like to ask about an order or catering.`,
    qualification: ["date", "party size", "delivery or collection", "budget", "dietary needs"],
    handoff: "owner",
    reviewRequestAfterOrder: true,
  });

export const listForGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.groupId);
    return await ctx.db
      .query("whatsappAccounts")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
  },
});

export const listCurrent = query({
  args: {},
  handler: async (ctx) => {
    const current = await firstCurrentMembership(ctx);
    if (!current) return null;
    const group = await ctx.db.get(current.membership.groupId);
    const sites = await ctx.db
      .query("sites")
      .withIndex("by_group", (q) => q.eq("groupId", current.membership.groupId))
      .collect();
    const accounts = await ctx.db
      .query("whatsappAccounts")
      .withIndex("by_group", (q) => q.eq("groupId", current.membership.groupId))
      .collect();
    return { group, sites, accounts };
  },
});

export const upsert = mutation({
  args: {
    groupId: v.id("groups"),
    siteId: v.optional(v.id("sites")),
    mode: accountMode,
    status: v.optional(accountStatus),
    displayName: v.string(),
    displayPhoneNumber: v.optional(v.string()),
    wabaId: v.optional(v.string()),
    phoneNumberId: v.optional(v.string()),
    qualityRating: v.optional(v.string()),
    accessTokenSecretRef: v.optional(v.string()),
    defaultFlow: v.optional(v.string()),
    onboardingSource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.groupId);
    const now = Date.now();
    const site = args.siteId ? await ctx.db.get(args.siteId) : null;
    if (args.siteId && (!site || site.groupId !== args.groupId)) {
      throw new Error("Site does not belong to this restaurant.");
    }

    const existing = (
      await ctx.db
        .query("whatsappAccounts")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
        .collect()
    ).find((account) => account.siteId === args.siteId);

    const row = {
      groupId: args.groupId,
      siteId: args.siteId,
      mode: args.mode,
      status: args.status ?? (args.mode === "connected" && args.phoneNumberId ? "active" : "pending"),
      displayName: args.displayName.trim() || "WhatsApp",
      displayPhoneNumber: clean(args.displayPhoneNumber),
      wabaId: clean(args.wabaId),
      phoneNumberId: clean(args.phoneNumberId),
      qualityRating: clean(args.qualityRating),
      accessTokenSecretRef: clean(args.accessTokenSecretRef),
      defaultFlow: args.defaultFlow ?? defaultFlow(args.displayName, site?.name),
      clickToWhatsAppUrl: waLink(args.displayPhoneNumber, args.displayName, site?.name),
      qrCodeLabel: site?.name ? `${site.name} WhatsApp QR` : "All sites WhatsApp QR",
      onboardingSource: args.onboardingSource ?? "manual",
      connectedAt: args.mode === "connected" && args.phoneNumberId ? (existing?.connectedAt ?? now) : existing?.connectedAt,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, row);
      return existing._id;
    }
    return await ctx.db.insert("whatsappAccounts", row);
  },
});

export const getInternal = internalQuery({
  args: { id: v.id("whatsappAccounts") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const findByPhoneNumberIdInternal = internalQuery({
  args: { phoneNumberId: v.string() },
  handler: async (ctx, args) =>
    await ctx.db
      .query("whatsappAccounts")
      .withIndex("by_phone_number_id", (q) => q.eq("phoneNumberId", args.phoneNumberId))
      .first(),
});

export const bestForSendInternal = internalQuery({
  args: { groupId: v.id("groups"), siteId: v.optional(v.id("sites")) },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("whatsappAccounts")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
    const connected = accounts.filter((account) => account.mode === "connected" && account.phoneNumberId);
    return (
      (args.siteId ? connected.find((account) => account.siteId === args.siteId) : null) ??
      connected.find((account) => account.siteId === undefined) ??
      accounts.find((account) => account.siteId === args.siteId) ??
      accounts.find((account) => account.siteId === undefined) ??
      null
    );
  },
});
