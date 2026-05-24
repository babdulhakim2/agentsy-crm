// Customer CRUD with phone-as-canonical dedupe.
// quickAdd is the "host stand / walk-in / QR" capture endpoint.

import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";

const CONSENT_SOURCES = ["host_stand", "qr", "manual", "booking_widget"] as const;
const QR_VISIT_COOLDOWN_MS = 20 * 60 * 60 * 1000;
const CUSTOMER_SOURCES = [
  "walk-in",
  "qr",
  "outreach",
  "booking",
  "referral",
  "instagram",
  "google",
  "delivery",
  "whatsapp",
  "event",
  "other",
] as const;

type CustomerMatch = Doc<"customers">;
type DatabaseCtx = { db: QueryCtx["db"] };

function normalizePhone(raw: string): string {
  const input = raw.trim();
  if (!input) return "";
  const hasLeadingPlus = input.startsWith("+");
  let digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (hasLeadingPlus) return `+${digits}`;
  if (digits.startsWith("44")) return `+${digits}`;
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("7")) return `+44${digits}`;
  return digits;
}

function phoneLookupVariants(raw: string): string[] {
  const canonical = normalizePhone(raw);
  const input = raw.trim();
  const digits = input.replace(/\D/g, "");
  const variants = new Set<string>();
  if (canonical) variants.add(canonical);
  if (input) variants.add(input.replace(/[\s()\-]/g, ""));
  if (digits) variants.add(digits);
  if (digits.startsWith("0")) variants.add(digits.slice(1));
  if (digits.startsWith("44")) {
    variants.add(`+${digits}`);
    variants.add(digits.slice(2));
    variants.add(`0${digits.slice(2)}`);
  }
  if (canonical.startsWith("+44")) {
    const national = canonical.slice(3);
    variants.add(national);
    variants.add(`0${national}`);
    variants.add(canonical.slice(1));
  }
  return [...variants].filter(Boolean);
}

function isBetterCustomerMatch(
  candidate: CustomerMatch,
  current: CustomerMatch | null
): boolean {
  if (!current) return true;
  if (candidate.visitCount !== current.visitCount) return candidate.visitCount > current.visitCount;
  const candidateLast = candidate.lastVisitAt ?? 0;
  const currentLast = current.lastVisitAt ?? 0;
  if (candidateLast !== currentLast) return candidateLast > currentLast;
  return candidate.name.length > current.name.length;
}

function normalizeEmail(email?: string): string | undefined {
  const next = email?.trim().toLowerCase();
  return next || undefined;
}

function cleanShort(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 240) : undefined;
}

function normalizeBusinessName(value: string): string {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

function parseContactDate(value?: string): number | undefined {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const [, year, month, day] = match;
  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day), 12);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function mergeTags(existing: string[], next: string[]): string[] {
  const seen = new Set<string>();
  return [...existing, ...next]
    .map((tag) => tag.trim())
    .filter((tag) => {
      if (!tag || seen.has(tag.toLowerCase())) return false;
      seen.add(tag.toLowerCase());
      return true;
    })
    .slice(0, 12);
}

function mergeText(existing?: string, next?: string): string | undefined {
  const cleanNext = cleanOptional(next);
  if (!cleanNext) return existing;
  if (!existing) return cleanNext;
  if (existing.toLowerCase().includes(cleanNext.toLowerCase())) return existing;
  return `${existing}\n${cleanNext}`.slice(0, 800);
}

function inferImportedSource(contact: { event?: boolean; notes?: string; role?: string; company?: string }): string {
  const notes = contact.notes?.toLowerCase() ?? "";
  if (contact.event) return "event";
  if (notes.includes("referral")) return "referral";
  if (contact.company || contact.role) return "outreach";
  return "outreach";
}

function normalizeCustomerSource(value?: string): string {
  return CUSTOMER_SOURCES.includes(value as (typeof CUSTOMER_SOURCES)[number]) ? value! : "qr";
}

function rewardProgress(visitCount: number, visitsRequired: number) {
  if (visitCount <= 0) {
    return {
      rewardUnlocked: false,
      visitsUntilReward: visitsRequired,
    };
  }
  const remainder = visitCount % visitsRequired;
  return {
    rewardUnlocked: visitCount > 0 && remainder === 0,
    visitsUntilReward: remainder === 0 ? 0 : visitsRequired - remainder,
  };
}

async function recentCountedVisitForCustomer(
  ctx: DatabaseCtx,
  groupId: Id<"groups">,
  customerId: Id<"customers">,
  siteId: Id<"sites">,
  now: number
): Promise<Doc<"visits"> | null> {
  const cutoff = now - QR_VISIT_COOLDOWN_MS;
  const rows = await ctx.db
    .query("visits")
    .withIndex("by_group_customer", (q) => q.eq("groupId", groupId).eq("customerId", customerId))
    .order("desc")
    .take(12);
  return rows.find((visit) => visit.siteId === siteId && visit.at >= cutoff) ?? null;
}

function buildImportTags(contact: {
  event?: boolean;
  notes?: string;
  role?: string;
  company?: string;
  location?: string;
}): string[] {
  const tags = ["Imported"];
  if (contact.event) tags.push("Event");
  if (contact.company) tags.push("Company");
  const role = cleanShort(contact.role);
  if (role) tags.push(role);
  if (contact.location) tags.push("Local lead");
  if (contact.notes?.toLowerCase().includes("referral")) tags.push("Referral");
  return tags;
}

async function getCurrentUserId(ctx: MutationCtx): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
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
  return user?._id ?? null;
}

async function hasSeedSecret(argsSecret?: string): Promise<boolean> {
  const expected = process.env.CUSTOMER_SEED_SECRET;
  return Boolean(expected && argsSecret && argsSecret === expected);
}

async function customersByPhoneVariants(
  ctx: DatabaseCtx,
  groupId: Id<"groups">,
  rawPhone: string
): Promise<CustomerMatch[]> {
  const seen = new Set<string>();
  const out: CustomerMatch[] = [];
  for (const variant of phoneLookupVariants(rawPhone)) {
    const rows = await ctx.db
      .query("customers")
      .withIndex("by_group_phone", (q) => q.eq("groupId", groupId).eq("phone", variant))
      .collect();
    for (const row of rows) {
      if (seen.has(row._id)) continue;
      seen.add(row._id);
      out.push(row);
    }
  }
  return out;
}

async function mergeCustomerRecords(
  ctx: MutationCtx,
  primary: CustomerMatch,
  duplicate: CustomerMatch,
  canonicalPhone: string
): Promise<CustomerMatch> {
  if (primary._id === duplicate._id) return primary;
  const now = Date.now();
  const duplicateVisits = await ctx.db
    .query("visits")
    .withIndex("by_group_customer", (q) =>
      q.eq("groupId", duplicate.groupId).eq("customerId", duplicate._id)
    )
    .collect();
  for (const visit of duplicateVisits) {
    await ctx.db.patch(visit._id, { customerId: primary._id });
  }

  const mergedVisitCount = primary.visitCount + duplicate.visitCount;
  const mergedSpend = primary.spendCents + duplicate.spendCents;
  const mergedLastVisit = Math.max(primary.lastVisitAt ?? 0, duplicate.lastVisitAt ?? 0) || undefined;
  const firstContactAt = Math.min(
    primary.firstContactAt ?? primary.createdAt,
    duplicate.firstContactAt ?? duplicate.createdAt
  );
  const capturedAt = Math.max(primary.consent.capturedAt, duplicate.consent.capturedAt, now);

  await ctx.db.patch(primary._id, {
    phone: canonicalPhone,
    name: primary.name.length >= duplicate.name.length ? primary.name : duplicate.name,
    email: primary.email ?? duplicate.email,
    tags: mergeTags(primary.tags, duplicate.tags),
    consent: {
      whatsapp: primary.consent.whatsapp || duplicate.consent.whatsapp,
      email: primary.consent.email || duplicate.consent.email,
      capturedAt,
      source: primary.consent.source ?? duplicate.consent.source,
    },
    lastVisitAt: mergedLastVisit,
    visitCount: mergedVisitCount,
    spendCents: mergedSpend,
    pipelineStage: primary.pipelineStage ?? duplicate.pipelineStage,
    pipelineStageManual: primary.pipelineStageManual || duplicate.pipelineStageManual,
    source: primary.source ?? duplicate.source,
    birthMonth: primary.birthMonth ?? duplicate.birthMonth,
    birthDay: primary.birthDay ?? duplicate.birthDay,
    primarySiteId: primary.primarySiteId ?? duplicate.primarySiteId,
    notes: mergeText(primary.notes, duplicate.notes),
    company: primary.company ?? duplicate.company,
    address: primary.address ?? duplicate.address,
    role: primary.role ?? duplicate.role,
    location: primary.location ?? duplicate.location,
    firstContactAt,
    sourceDate: primary.sourceDate ?? duplicate.sourceDate,
    importedAt: primary.importedAt ?? duplicate.importedAt,
    importSource: primary.importSource ?? duplicate.importSource,
    createdAt: Math.min(primary.createdAt, duplicate.createdAt),
  });
  await ctx.db.delete(duplicate._id);
  return (await ctx.db.get(primary._id)) ?? primary;
}

async function findOrMergeCustomerByPhone(
  ctx: MutationCtx,
  groupId: Id<"groups">,
  rawPhone: string
): Promise<CustomerMatch | null> {
  const canonicalPhone = normalizePhone(rawPhone);
  const matches = await customersByPhoneVariants(ctx, groupId, rawPhone);
  if (!matches.length) return null;
  let primary: CustomerMatch | null = null;
  for (const match of matches) {
    if (isBetterCustomerMatch(match, primary)) primary = match;
  }
  if (!primary) return null;

  if (primary.phone !== canonicalPhone) {
    await ctx.db.patch(primary._id, { phone: canonicalPhone });
    primary = (await ctx.db.get(primary._id)) ?? primary;
  }

  for (const match of matches) {
    if (match._id === primary._id) continue;
    primary = await mergeCustomerRecords(ctx, primary, match, canonicalPhone);
  }
  return primary;
}

async function normalizeAndDedupeCustomersForDisplay(
  rows: CustomerMatch[]
): Promise<CustomerMatch[]> {
  const byPhone = new Map<string, CustomerMatch>();
  const noPhone: CustomerMatch[] = [];
  for (const row of rows) {
    const key = normalizePhone(row.phone);
    if (!key) {
      noPhone.push(row);
      continue;
    }
    const current = byPhone.get(key) ?? null;
    if (isBetterCustomerMatch(row, current)) byPhone.set(key, row);
  }
  return [...byPhone.values(), ...noPhone];
}

export const list = query({
  args: { groupId: v.id("groups"), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.search && args.search.length > 0) {
      const rows = await ctx.db
        .query("customers")
        .withSearchIndex("by_name", (q) =>
          q.search("name", args.search!).eq("groupId", args.groupId)
        )
        .take(50);
      return await normalizeAndDedupeCustomersForDisplay(rows);
    }
    const rows = await ctx.db
      .query("customers")
      .withIndex("by_group_lastVisit", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(100);
    return await normalizeAndDedupeCustomersForDisplay(rows);
  },
});

export const get = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const findByPhone = query({
  args: { groupId: v.id("groups"), phone: v.string() },
  handler: async (ctx, args) => {
    const matches = await customersByPhoneVariants(ctx, args.groupId, args.phone);
    let best: CustomerMatch | null = null;
    for (const match of matches) {
      if (isBetterCustomerMatch(match, best)) best = match;
    }
    return best;
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

async function resolveSeedContext(
  ctx: MutationCtx,
  args: {
    business: string;
    groupId?: Id<"groups">;
    siteId?: Id<"sites">;
    seedSecret?: string;
  }
): Promise<{
  groupId: Id<"groups">;
  siteId?: Id<"sites">;
  mode: "secret" | "authenticated";
}> {
  const secretOk = await hasSeedSecret(args.seedSecret);
  const currentUserId = secretOk ? null : await getCurrentUserId(ctx);
  let groupId = args.groupId;

  if (!groupId) {
    const expectedName = normalizeBusinessName(args.business);
    if (currentUserId) {
      const memberships = (await ctx.db
        .query("memberships")
        .withIndex("by_user", (q) => q.eq("userId", currentUserId))
        .collect()).filter((membership) => membership.status === "active");
      const tenantRows = (
        await Promise.all(
          memberships.map(async (membership) => {
            const group = await ctx.db.get(membership.groupId);
            return group ? { group, membership } : null;
          })
        )
      ).filter((row): row is NonNullable<typeof row> => row !== null);
      const matches = tenantRows.filter(
        (row) => normalizeBusinessName(row.group.name) === expectedName
      );
      if (matches.length === 1) {
        groupId = matches[0].group._id;
      } else if (tenantRows.length === 1) {
        groupId = tenantRows[0].group._id;
      }
    } else if (secretOk) {
      const groups = await ctx.db.query("groups").collect();
      const matches = groups.filter((group) => normalizeBusinessName(group.name) === expectedName);
      if (matches.length === 1) {
        groupId = matches[0]._id;
      } else if (groups.length === 1) {
        groupId = groups[0]._id;
      }
    }
  }

  if (!groupId) {
    throw new Error("Could not resolve restaurant. Pass groupId or use the exact business name.");
  }

  const group = await ctx.db.get(groupId);
  if (!group) throw new Error("Restaurant not found.");

  if (!secretOk) {
    if (!currentUserId) {
      throw new Error("Not authenticated. For CLI/prod imports, set CUSTOMER_SEED_SECRET in Convex and pass seedSecret.");
    }
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", groupId).eq("userId", currentUserId))
      .unique();
    if (!membership || membership.status !== "active") {
      throw new Error("Not a member of this restaurant.");
    }
  }

  let siteId = args.siteId;
  if (siteId) {
    const site = await ctx.db.get(siteId);
    if (!site || site.groupId !== groupId || site.status === "archived") {
      throw new Error("Site does not belong to this restaurant.");
    }
  } else {
    const sites = (await ctx.db
      .query("sites")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect()).filter((site) => site.status !== "archived");
    sites.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    siteId = sites[0]?._id;
  }

  return { groupId, siteId, mode: secretOk ? "secret" : "authenticated" };
}

export const seedContacts = mutation({
  args: {
    seedSecret: v.optional(v.string()),
    business: v.string(),
    groupId: v.optional(v.id("groups")),
    siteId: v.optional(v.id("sites")),
    contacts: v.array(
      v.object({
        date: v.optional(v.string()),
        name: v.optional(v.string()),
        company: v.optional(v.string()),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        notes: v.optional(v.string()),
        role: v.optional(v.string()),
        event: v.optional(v.boolean()),
        location: v.optional(v.string()),
        address: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { groupId, siteId, mode } = await resolveSeedContext(ctx, args);
    const now = Date.now();
    let created = 0;
    let updated = 0;
    const importedIds: Id<"customers">[] = [];
    const skipped: Array<{
      name?: string;
      company?: string;
      phone?: string;
      reason: string;
    }> = [];

    for (const contact of args.contacts) {
      const name = cleanShort(contact.name) ?? cleanShort(contact.company);
      const company = cleanShort(contact.company);
      const rawPhone = cleanShort(contact.phone);
      if (!rawPhone) {
        skipped.push({
          name,
          company,
          reason: "missing_phone",
        });
        continue;
      }

      const phone = normalizePhone(rawPhone);
      if (!phone || phone.length < 7) {
        skipped.push({
          name,
          company,
          phone: rawPhone,
          reason: "phone_too_short",
        });
        continue;
      }
      if (!name) {
        skipped.push({
          company,
          phone: rawPhone,
          reason: "missing_name",
        });
        continue;
      }

      const existing = await findOrMergeCustomerByPhone(ctx, groupId, rawPhone);
      const email = normalizeEmail(contact.email);
      const sourceDate = cleanShort(contact.date);
      const firstContactAt = parseContactDate(sourceDate) ?? now;
      const source = inferImportedSource(contact);
      const tags = buildImportTags(contact);
      const role = cleanShort(contact.role);
      const address = cleanShort(contact.address);
      const location = cleanShort(contact.location);
      const notes = cleanOptional(contact.notes);

      if (existing) {
        const existingFirstContactAt = existing.firstContactAt ?? existing.createdAt;
        await ctx.db.patch(existing._id, {
          name,
          email: email ?? existing.email,
          tags: mergeTags(existing.tags, tags),
          source: existing.source ?? source,
          primarySiteId: existing.primarySiteId ?? siteId,
          notes: mergeText(existing.notes, notes),
          company: company ?? existing.company,
          address: address ?? existing.address,
          role: role ?? existing.role,
          location: location ?? existing.location,
          firstContactAt: Math.min(existingFirstContactAt, firstContactAt),
          sourceDate: sourceDate ?? existing.sourceDate,
          importedAt: now,
          importSource: "manual_seed",
        });
        updated += 1;
        importedIds.push(existing._id);
        continue;
      }

      const customerId = await ctx.db.insert("customers", {
        groupId,
        phone,
        name,
        email,
        tags,
        consent: {
          whatsapp: false,
          email: false,
          capturedAt: now,
          source: "manual",
        },
        visitCount: 0,
        spendCents: 0,
        pipelineStage: "lead",
        source,
        primarySiteId: siteId,
        notes,
        company,
        address,
        role,
        location,
        firstContactAt,
        sourceDate,
        importedAt: now,
        importSource: "manual_seed",
        createdAt: firstContactAt,
      });
      created += 1;
      importedIds.push(customerId);
    }

    return {
      mode,
      groupId,
      siteId,
      total: args.contacts.length,
      created,
      updated,
      imported: created + updated,
      skipped,
      importedIds,
    };
  },
});

export const normalizePhonesForGroup = mutation({
  args: {
    seedSecret: v.optional(v.string()),
    groupId: v.optional(v.id("groups")),
    business: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { groupId, mode } = await resolveSeedContext(ctx, {
      seedSecret: args.seedSecret,
      groupId: args.groupId,
      business: args.business ?? "",
    });
    const rows = await ctx.db
      .query("customers")
      .withIndex("by_group_lastVisit", (q) => q.eq("groupId", groupId))
      .collect();
    let scanned = 0;
    let canonicalized = 0;
    let merged = 0;
    const seen = new Set<string>();

    for (const row of rows) {
      if (seen.has(row._id)) continue;
      const current = await ctx.db.get(row._id);
      if (!current) {
        merged += 1;
        continue;
      }
      scanned += 1;
      const canonicalPhone = normalizePhone(current.phone);
      if (!canonicalPhone || canonicalPhone.length < 7) continue;
      if (current.phone !== canonicalPhone) canonicalized += 1;
      const before = (await customersByPhoneVariants(ctx, groupId, current.phone)).length;
      const mergedCustomer = await findOrMergeCustomerByPhone(ctx, groupId, current.phone);
      if (before > 1) merged += before - 1;
      if (mergedCustomer) seen.add(mergedCustomer._id);
    }

    const remaining = await ctx.db
      .query("customers")
      .withIndex("by_group_lastVisit", (q) => q.eq("groupId", groupId))
      .collect();

    return {
      mode,
      groupId,
      scanned,
      canonicalized,
      merged,
      remaining: remaining.length,
    };
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
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    if (!phone || phone.length < 7) throw new Error("Phone looks too short.");
    if (!args.name.trim()) throw new Error("Need a name, even just a first name.");
    if (!CONSENT_SOURCES.includes(args.source as (typeof CONSENT_SOURCES)[number])) {
      throw new Error("Unknown consent source.");
    }

    const existing = await findOrMergeCustomerByPhone(ctx, args.groupId, args.phone);

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
        address: cleanShort(args.address) ?? existing.address,
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
      address: cleanShort(args.address),
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

export const update = mutation({
  args: {
    id: v.id("customers"),
    phone: v.optional(v.string()),
    name: v.string(),
    email: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    customerSource: v.optional(v.string()),
    birthMonth: v.optional(v.number()),
    birthDay: v.optional(v.number()),
    pipelineStage: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Customer not found.");
    if (!args.name.trim()) throw new Error("Customer name is required.");

    const phone = args.phone ? normalizePhone(args.phone) : undefined;
    if (phone && phone.length < 7) throw new Error("Phone looks too short.");

    if (phone && phone !== existing.phone) {
      const duplicate = await findOrMergeCustomerByPhone(ctx, existing.groupId, phone);
      if (duplicate && duplicate._id !== args.id) {
        await mergeCustomerRecords(ctx, existing, duplicate, phone);
      }
    }

    await ctx.db.patch(args.id, {
      phone: phone ?? existing.phone,
      name: args.name.trim(),
      email: cleanOptional(args.email),
      tags: args.tags ?? existing.tags,
      source: args.customerSource,
      birthMonth: args.birthMonth,
      birthDay: args.birthMonth ? args.birthDay : undefined,
      pipelineStage: args.pipelineStage,
      pipelineStageManual: args.pipelineStage ? true : existing.pipelineStageManual,
      address: cleanShort(args.address),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) return;
    await ctx.db.delete(args.id);
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
  handler: async (ctx, args) => {
    const matches = await customersByPhoneVariants(ctx, args.groupId, args.phone);
    let best: CustomerMatch | null = null;
    for (const match of matches) {
      if (isBetterCustomerMatch(match, best)) best = match;
    }
    return best;
  },
});

export const createMinimalInternal = internalMutation({
  args: { groupId: v.id("groups"), phone: v.string(), name: v.string() },
  handler: async (ctx, args) =>
    await ctx.db.insert("customers", {
      groupId: args.groupId,
      phone: normalizePhone(args.phone),
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
    birthMonth: v.optional(v.number()),
    birthDay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    if (!phone || phone.length < 7) throw new Error("Phone looks too short.");
    if (!args.name.trim()) throw new Error("Need a name.");

    const now = Date.now();
    const existing = await findOrMergeCustomerByPhone(ctx, args.groupId, args.phone);

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
        birthMonth: args.birthMonth,
        birthDay: args.birthMonth ? args.birthDay : undefined,
        createdAt: now,
      }));

    const customer = existing ?? (await ctx.db.get(customerId));
    if (!customer) throw new Error("Customer could not be created.");

    const feedback = cleanOptional(args.feedback);
    const ratingText = args.rating ? `Rating: ${args.rating}/5` : undefined;
    const notes = [ratingText, feedback].filter(Boolean).join(" · ") || undefined;
    const site = await ctx.db.get(args.siteId);
    if (!site || site.groupId !== args.groupId) throw new Error("Visit QR is not valid for this site.");
    const visitsRequired = Math.max(1, Math.round(site?.visitRewardVisits ?? 3));
    const rewardLabel = cleanOptional(site?.visitRewardLabel)?.slice(0, 80) ?? "20% off";
    const recentVisit = await recentCountedVisitForCustomer(ctx, args.groupId, customerId, args.siteId, now);

    if (recentVisit) {
      const progress = rewardProgress(customer.visitCount, visitsRequired);
      await ctx.db.patch(customerId, {
        name: args.name.trim() || customer.name,
        consent: {
          whatsapp: args.consentWhatsapp ?? customer.consent.whatsapp,
          email: customer.consent.email,
          capturedAt: now,
          source: "qr",
        },
        birthMonth: args.birthMonth ?? customer.birthMonth,
        birthDay: args.birthMonth ? args.birthDay : customer.birthDay,
      });
      return {
        customerId,
        visitId: recentVisit._id,
        visitCount: customer.visitCount,
        duplicate: true,
        counted: false,
        nextEligibleAt: recentVisit.at + QR_VISIT_COOLDOWN_MS,
        ...progress,
        visitsRequired,
        rewardLabel,
      };
    }

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
      birthMonth: args.birthMonth ?? customer.birthMonth,
      birthDay: args.birthMonth ? args.birthDay : customer.birthDay,
    });

    return {
      customerId,
      visitId,
      duplicate: false,
      counted: true,
      visitCount: nextVisitCount,
      ...rewardProgress(nextVisitCount, visitsRequired),
      visitsRequired,
      rewardLabel,
    };
  },
});

export const publicQrLead = mutation({
  args: {
    groupId: v.id("groups"),
    siteId: v.optional(v.id("sites")),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    customerSource: v.optional(v.string()),
    consentWhatsapp: v.optional(v.boolean()),
    birthMonth: v.optional(v.number()),
    birthDay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const phone = normalizePhone(args.phone);
    if (!phone || phone.length < 7) throw new Error("Phone looks too short.");
    if (!args.name.trim()) throw new Error("Need a name.");

    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Restaurant not found.");

    let siteId = args.siteId;
    if (siteId) {
      const site = await ctx.db.get(siteId);
      if (!site || site.groupId !== args.groupId || site.status === "archived") {
        siteId = undefined;
      }
    }

    const now = Date.now();
    const source = normalizeCustomerSource(args.customerSource);
    const email = normalizeEmail(args.email);
    const address = cleanShort(args.address);
    const notes = cleanOptional(args.notes);
    const tags = mergeTags(
      ["Lead QR"],
      [source === "delivery" || address ? "Delivery" : "", source === "referral" ? "Referral" : ""]
    );

    const existing = await findOrMergeCustomerByPhone(ctx, args.groupId, args.phone);

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name.trim() || existing.name,
        email: email ?? existing.email,
        address: address ?? existing.address,
        notes: mergeText(existing.notes, notes),
        tags: mergeTags(existing.tags, tags),
        consent: {
          whatsapp: (args.consentWhatsapp ?? false) || existing.consent.whatsapp,
          email: Boolean(email) || existing.consent.email,
          capturedAt: now,
          source: "qr",
        },
        source: existing.source ?? source,
        primarySiteId: existing.primarySiteId ?? siteId,
        birthMonth: args.birthMonth ?? existing.birthMonth,
        birthDay: args.birthMonth ? args.birthDay : existing.birthDay,
        firstContactAt: existing.firstContactAt ?? existing.createdAt,
      });
      return { customerId: existing._id, created: false, status: "updated" };
    }

    const customerId = await ctx.db.insert("customers", {
      groupId: args.groupId,
      phone,
      name: args.name.trim(),
      email,
      tags,
      consent: {
        whatsapp: args.consentWhatsapp ?? true,
        email: Boolean(email),
        capturedAt: now,
        source: "qr",
      },
      visitCount: 0,
      spendCents: 0,
      pipelineStage: "lead",
      source,
      primarySiteId: siteId,
      birthMonth: args.birthMonth,
      birthDay: args.birthMonth ? args.birthDay : undefined,
      address,
      notes,
      firstContactAt: now,
      sourceDate: new Date(now).toISOString().slice(0, 10),
      createdAt: now,
    });

    return { customerId, created: true, status: "created" };
  },
});

function cleanOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 800) : undefined;
}
