import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

const siteInput = v.object({
  name: v.string(),
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  postcode: v.optional(v.string()),
  googlePlaceId: v.optional(v.string()),
});

async function upsertCurrentUser(
  ctx: MutationCtx,
  args: { ownerName?: string; ownerEmail?: string; imageUrl?: string }
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated.");

  const now = Date.now();
  const email = args.ownerEmail ?? identity.email;
  if (!email) throw new Error("Clerk user needs an email address.");

  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      email,
      name: args.ownerName ?? identity.name ?? existing.name,
      imageUrl: args.imageUrl ?? identity.pictureUrl ?? existing.imageUrl,
      lastSeenAt: now,
    });
    return existing._id;
  }

  return await ctx.db.insert("users", {
    clerkUserId: identity.subject,
    email,
    name: args.ownerName ?? identity.name,
    imageUrl: args.imageUrl ?? identity.pictureUrl,
    createdAt: now,
    lastSeenAt: now,
  });
}

function clean(value?: string) {
  const next = value?.trim();
  return next ? next : undefined;
}

async function upsertConnection(
  ctx: MutationCtx,
  args: {
    groupId: Id<"groups">;
    siteId?: Id<"sites">;
    provider: string;
    status: string;
    config: Record<string, unknown>;
  }
) {
  const now = Date.now();
  const existing = args.siteId
    ? await ctx.db
        .query("connections")
        .withIndex("by_site_provider", (q) =>
          q.eq("siteId", args.siteId).eq("provider", args.provider)
        )
        .unique()
    : (
        await ctx.db
          .query("connections")
          .withIndex("by_group_provider", (q) =>
            q.eq("groupId", args.groupId).eq("provider", args.provider)
          )
          .collect()
      ).find((c) => c.siteId === undefined);

  const patch = {
    groupId: args.groupId,
    siteId: args.siteId,
    provider: args.provider,
    status: args.status,
    config: JSON.stringify(args.config),
    lastSyncAt: now,
    lastError: undefined,
  };

  if (existing) {
    await ctx.db.patch(existing._id, patch);
    return existing._id;
  }
  return await ctx.db.insert("connections", patch);
}

export const complete = mutation({
  args: {
    groupName: v.string(),
    timezone: v.string(),
    primaryPhone: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    sites: v.array(siteInput),
    bookingProvider: v.optional(v.string()),
    posProvider: v.optional(v.string()),
    voiceTone: v.optional(v.string()),
    voiceExamples: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const userId = await upsertCurrentUser(ctx, args);
    const ownerEmail = clean(args.ownerEmail);
    const ownerName = clean(args.ownerName);
    const groupName = clean(args.groupName);
    if (!groupName) throw new Error("Restaurant name is required.");

    const existingMembership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const invitedGroup =
      ownerEmail && !existingMembership
        ? await ctx.db
            .query("groups")
            .withIndex("by_owner_email", (q) => q.eq("ownerEmail", ownerEmail))
            .first()
        : null;

    const groupId =
      existingMembership?.groupId ??
      invitedGroup?._id ??
      (await ctx.db.insert("groups", {
        name: groupName,
        timezone: args.timezone,
        primaryPhone: clean(args.primaryPhone),
        ownerName,
        ownerEmail,
        ownerUserId: userId,
        plan: "Solo",
        status: "active",
        onboardingStep: 8,
        onboardingCompletedAt: now,
        bookingProvider: clean(args.bookingProvider),
        posProvider: clean(args.posProvider),
        voiceTone: clean(args.voiceTone),
        createdAt: now,
      }));

    await ctx.db.patch(groupId, {
      name: groupName,
      timezone: args.timezone,
      primaryPhone: clean(args.primaryPhone),
      ownerName,
      ownerEmail,
      ownerUserId: userId,
      plan: "Solo",
      status: "active",
      onboardingStep: 8,
      onboardingCompletedAt: now,
      bookingProvider: clean(args.bookingProvider),
      posProvider: clean(args.posProvider),
      voiceTone: clean(args.voiceTone),
    });

    const existingSites = await ctx.db
      .query("sites")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    const siteIds: Id<"sites">[] = [];
    for (const rawSite of args.sites) {
      const name = clean(rawSite.name);
      if (!name) continue;
      const existing = existingSites.find((s) => s.name.toLowerCase() === name.toLowerCase());
      const sitePatch = {
        groupId,
        name,
        address: clean(rawSite.address),
        city: clean(rawSite.city) ?? "London",
        postcode: clean(rawSite.postcode),
        coversToday: existing?.coversToday ?? 0,
        googlePlaceId: clean(rawSite.googlePlaceId),
        status: "active",
        createdAt: existing?.createdAt ?? now,
      };
      if (existing) {
        await ctx.db.patch(existing._id, sitePatch);
        siteIds.push(existing._id);
      } else {
        siteIds.push(await ctx.db.insert("sites", sitePatch));
      }
    }

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_group_user", (q) => q.eq("groupId", groupId).eq("userId", userId))
      .unique();

    if (membership) {
      await ctx.db.patch(membership._id, {
        role: "owner",
        status: "active",
        siteIds,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("memberships", {
        userId,
        groupId,
        role: "owner",
        status: "active",
        siteIds,
        createdAt: now,
        updatedAt: now,
      });
    }

    if (ownerEmail) {
      const invites = await ctx.db
        .query("invitations")
        .withIndex("by_email", (q) => q.eq("email", ownerEmail))
        .collect();
      await Promise.all(
        invites
          .filter((invite) => invite.groupId === groupId && invite.status === "pending")
          .map((invite) => ctx.db.patch(invite._id, { status: "accepted" }))
      );
    }

    const firstSiteId = siteIds[0];
    if (args.bookingProvider) {
      await upsertConnection(ctx, {
        groupId,
        provider: `booking:${args.bookingProvider.toLowerCase().replace(/\s+/g, "_")}`,
        status: "pending",
        config: { provider: args.bookingProvider, source: "onboarding" },
      });
    }
    if (args.posProvider && args.posProvider !== "Other") {
      await upsertConnection(ctx, {
        groupId,
        provider: `pos:${args.posProvider.toLowerCase().replace(/\s+/g, "_")}`,
        status: "pending",
        config: { provider: args.posProvider, source: "onboarding" },
      });
    }
    if (firstSiteId) {
      await upsertConnection(ctx, {
        groupId,
        siteId: firstSiteId,
        provider: "google_business",
        status: "pending",
        config: { source: "onboarding", needsLocationMatch: true },
      });
    }
    await upsertConnection(ctx, {
      groupId,
      provider: "whatsapp_meta",
      status: "pending",
      config: { phone: clean(args.primaryPhone), source: "onboarding" },
    });

    const existingVoice = await ctx.db
      .query("brandVoice")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .first();
    const examples = args.voiceExamples?.filter((example) => example.trim().length > 0) ?? [];
    const voicePatch = {
      groupId,
      summary: `${groupName} sounds ${args.voiceTone ?? "warm"}, direct and personal. Replies should feel owner-written, specific to the guest and suitable for a UK independent restaurant.`,
      rules: [
        "Use plain UK English.",
        "Mention the specific dish, service detail or visit context when available.",
        "Never over-promise compensation; invite the guest to continue privately when needed.",
      ],
      bannedWords: ["dear valued customer", "synergy", "journey"],
      examplesCount: examples.length,
      lastTrainedAt: now,
    };
    if (existingVoice) {
      await ctx.db.patch(existingVoice._id, voicePatch);
    } else {
      await ctx.db.insert("brandVoice", voicePatch);
    }

    return { groupId, userId, siteIds };
  },
});
