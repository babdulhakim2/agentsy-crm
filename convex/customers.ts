// Customer CRUD with phone-as-canonical dedupe.
// quickAdd is the "host stand / walk-in / QR" capture endpoint.

import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const CONSENT_SOURCES = ["host_stand", "qr", "manual", "booking_widget"] as const;

function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[\s()\-]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("0")) return "+44" + cleaned.slice(1);
  return cleaned.startsWith("44") ? "+" + cleaned : cleaned;
}

export const list = query({
  args: { groupId: v.id("groups"), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.search && args.search.length > 0) {
      return await ctx.db
        .query("customers")
        .withSearchIndex("by_name", (q) =>
          q.search("name", args.search!).eq("groupId", args.groupId)
        )
        .take(50);
    }
    return await ctx.db
      .query("customers")
      .withIndex("by_group_lastVisit", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(100);
  },
});

export const get = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const findByPhone = query({
  args: { groupId: v.id("groups"), phone: v.string() },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    return await ctx.db
      .query("customers")
      .withIndex("by_group_phone", (q) =>
        q.eq("groupId", args.groupId).eq("phone", phone)
      )
      .unique();
  },
});

export const visitsForCustomer = query({
  args: { customerId: v.id("customers"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer) return [];
    const rows = await ctx.db
      .query("visits")
      .withIndex("by_group_customer", (q) =>
        q.eq("groupId", customer.groupId).eq("customerId", args.customerId)
      )
      .order("desc")
      .take(args.limit ?? 8);

    return await Promise.all(
      rows.map(async (visit) => {
        const site = await ctx.db.get(visit.siteId);
        return {
          _id: visit._id,
          at: visit.at,
          siteName: site?.name ?? "Site",
          party: visit.party,
          spendCents: visit.spendCents,
          source: visit.source,
          notes: visit.notes,
          rating: visit.rating,
          feedback: visit.feedback,
        };
      })
    );
  },
});

/**
 * Quick-capture from host stand, walk-in, QR. Phone + name only.
 * Idempotent on (groupId, phone) — re-adds just refresh consent.
 */
export const quickAdd = mutation({
  args: {
    groupId: v.id("groups"),
    phone: v.string(),
    name: v.string(),
    consentWhatsapp: v.boolean(),
    consentEmail: v.optional(v.boolean()),
    source: v.string(),
    tags: v.optional(v.array(v.string())),
    dietary: v.optional(v.string()),
    email: v.optional(v.string()),
    customerSource: v.optional(v.string()),
    birthMonth: v.optional(v.number()),
    birthDay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    if (!phone || phone.length < 7) throw new Error("Phone looks too short.");
    if (!args.name.trim()) throw new Error("Need a name, even just a first name.");
    if (!CONSENT_SOURCES.includes(args.source as (typeof CONSENT_SOURCES)[number])) {
      throw new Error("Unknown consent source.");
    }

    const existing = await ctx.db
      .query("customers")
      .withIndex("by_group_phone", (q) =>
        q.eq("groupId", args.groupId).eq("phone", phone)
      )
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name.trim() || existing.name,
        email: args.email ?? existing.email,
        consent: {
          whatsapp: args.consentWhatsapp || existing.consent.whatsapp,
          email: (args.consentEmail ?? false) || existing.consent.email,
          capturedAt: now,
          source: args.source,
        },
        tags: args.tags ?? existing.tags,
        dietary: args.dietary ?? existing.dietary,
        source: args.customerSource ?? existing.source,
        birthMonth: args.birthMonth ?? existing.birthMonth,
        birthDay: args.birthDay ?? existing.birthDay,
      });
      return { id: existing._id, created: false };
    }

    const id = await ctx.db.insert("customers", {
      groupId: args.groupId,
      phone,
      name: args.name.trim(),
      email: args.email,
      tags: args.tags ?? [],
      dietary: args.dietary,
      consent: {
        whatsapp: args.consentWhatsapp,
        email: args.consentEmail ?? false,
        capturedAt: now,
        source: args.source,
      },
      visitCount: 0,
      spendCents: 0,
      source: args.customerSource,
      birthMonth: args.birthMonth,
      birthDay: args.birthDay,
      createdAt: now,
    });
    return { id, created: true };
  },
});

export const tag = mutation({
  args: { id: v.id("customers"), tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { tags: args.tags });
  },
});

/**
 * Owner-driven stage update. Marks `pipelineStageManual` so the cron skips it.
 */
export const setStage = mutation({
  args: { id: v.id("customers"), stage: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      pipelineStage: args.stage,
      pipelineStageManual: true,
    });
  },
});

const ACTIVE_DAYS = 30;
const ATRISK_DAYS = 60;
const VIP_VISITS = 10;

function inferStage(c: {
  visitCount: number;
  lastVisitAt?: number;
}): string {
  const now = Date.now();
  const daysSince = c.lastVisitAt
    ? Math.floor((now - c.lastVisitAt) / 86_400_000)
    : Infinity;

  if (c.visitCount === 0) return "lead";
  if (c.visitCount >= VIP_VISITS && daysSince <= ATRISK_DAYS) return "vip";
  if (daysSince <= ACTIVE_DAYS) return "active";
  if (daysSince > ATRISK_DAYS) return "at-risk";
  return "active";
}

/**
 * Daily cron: walk every customer, set the inferred stage if owner hasn't manually set one.
 * Recovery and Lost are owner-only — never auto-derived.
 */
export const recomputePipeline = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("customers").collect();
    let updated = 0;
    for (const c of all) {
      if (c.pipelineStageManual) continue;
      const next = inferStage(c);
      if (c.pipelineStage !== next) {
        await ctx.db.patch(c._id, { pipelineStage: next });
        updated += 1;
      }
    }
    return { scanned: all.length, updated };
  },
});

// ── Internal helpers (callable only from Convex actions) ──

export const getInternal = internalQuery({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const findByPhoneInternal = internalQuery({
  args: { groupId: v.id("groups"), phone: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("customers")
      .withIndex("by_group_phone", (q) =>
        q.eq("groupId", args.groupId).eq("phone", args.phone)
      )
      .unique(),
});

export const createMinimalInternal = internalMutation({
  args: { groupId: v.id("groups"), phone: v.string(), name: v.string() },
  handler: async (ctx, args) =>
    await ctx.db.insert("customers", {
      groupId: args.groupId,
      phone: args.phone,
      name: args.name,
      tags: [],
      consent: {
        whatsapp: true,
        email: false,
        capturedAt: Date.now(),
        source: "whatsapp_inbound",
      },
      visitCount: 0,
      spendCents: 0,
      createdAt: Date.now(),
    }),
});

export const recordVisit = mutation({
  args: {
    groupId: v.id("groups"),
    customerId: v.id("customers"),
    siteId: v.id("sites"),
    party: v.number(),
    spendCents: v.number(),
    source: v.string(),
    notes: v.optional(v.string()),
    rating: v.optional(v.number()),
    feedback: v.optional(v.string()),
    reviewOptIn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const visitId = await ctx.db.insert("visits", { ...args, at: Date.now() });
    const customer = await ctx.db.get(args.customerId);
    if (customer) {
      await ctx.db.patch(args.customerId, {
        lastVisitAt: Date.now(),
        visitCount: customer.visitCount + 1,
        spendCents: customer.spendCents + args.spendCents,
      });
    }
    return visitId;
  },
});

export const publicQrVisit = mutation({
  args: {
    groupId: v.id("groups"),
    siteId: v.id("sites"),
    name: v.string(),
    phone: v.string(),
    rating: v.optional(v.number()),
    feedback: v.optional(v.string()),
    consentWhatsapp: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    if (!phone || phone.length < 7) throw new Error("Phone looks too short.");
    if (!args.name.trim()) throw new Error("Need a name.");

    const now = Date.now();
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_group_phone", (q) =>
        q.eq("groupId", args.groupId).eq("phone", phone)
      )
      .unique();

    const customerId =
      existing?._id ??
      (await ctx.db.insert("customers", {
        groupId: args.groupId,
        phone,
        name: args.name.trim(),
        tags: ["QR visit"],
        consent: {
          whatsapp: args.consentWhatsapp ?? true,
          email: false,
          capturedAt: now,
          source: "qr",
        },
        visitCount: 0,
        spendCents: 0,
        source: "qr",
        pipelineStage: "lead",
        createdAt: now,
      }));

    const customer = existing ?? (await ctx.db.get(customerId));
    if (!customer) throw new Error("Customer could not be created.");

    const feedback = cleanOptional(args.feedback);
    const ratingText = args.rating ? `Rating: ${args.rating}/5` : undefined;
    const notes = [ratingText, feedback].filter(Boolean).join(" · ") || undefined;

    const visitId = await ctx.db.insert("visits", {
      groupId: args.groupId,
      customerId,
      siteId: args.siteId,
      at: now,
      party: 1,
      spendCents: 0,
      source: "qr",
      notes,
      rating: args.rating,
      feedback,
      reviewOptIn: true,
    });

    const nextVisitCount = customer.visitCount + 1;
    const nextStage =
      customer.pipelineStageManual
        ? customer.pipelineStage
        : nextVisitCount >= VIP_VISITS
          ? "vip"
          : "active";

    await ctx.db.patch(customerId, {
      name: args.name.trim() || customer.name,
      consent: {
        whatsapp: args.consentWhatsapp ?? customer.consent.whatsapp,
        email: customer.consent.email,
        capturedAt: now,
        source: "qr",
      },
      lastVisitAt: now,
      visitCount: nextVisitCount,
      spendCents: customer.spendCents,
      pipelineStage: nextStage,
    });

    return {
      customerId,
      visitId,
      visitCount: nextVisitCount,
      rewardUnlocked: nextVisitCount % 3 === 0,
      visitsUntilReward: nextVisitCount % 3 === 0 ? 0 : 3 - (nextVisitCount % 3),
    };
  },
});

function cleanOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 800) : undefined;
}
