import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

const DAY = 86_400_000;

function ago(days: number) {
  return Date.now() - days * DAY;
}

function phone(n: number) {
  return `+447700900${String(n).padStart(3, "0")}`;
}

async function ensureConnection(
  ctx: MutationCtx,
  args: {
    groupId: Id<"groups">;
    siteId?: Id<"sites">;
    provider: string;
    status: string;
    config: Record<string, unknown>;
  }
) {
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
      ).find((connection) => connection.siteId === undefined);

  const row = {
    groupId: args.groupId,
    siteId: args.siteId,
    provider: args.provider,
    status: args.status,
    config: JSON.stringify(args.config),
    lastSyncAt: Date.now(),
  };

  if (existing) {
    await ctx.db.patch(existing._id, row);
    return existing._id;
  }
  return await ctx.db.insert("connections", row);
}

async function ensureWhatsAppAccount(
  ctx: MutationCtx,
  args: {
    groupId: Id<"groups">;
    siteId?: Id<"sites">;
    mode: string;
    status: string;
    displayName: string;
    displayPhoneNumber: string;
    label: string;
  }
) {
  const now = Date.now();
  const existing = (
    await ctx.db
      .query("whatsappAccounts")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect()
  ).find((account) => account.siteId === args.siteId);
  const digits = args.displayPhoneNumber.replace(/[^\d]/g, "");
  const row = {
    groupId: args.groupId,
    siteId: args.siteId,
    mode: args.mode,
    status: args.status,
    displayName: args.displayName,
    displayPhoneNumber: args.displayPhoneNumber,
    defaultFlow: JSON.stringify({
      intent: "order_or_catering",
      qualification: ["date", "party size", "delivery or collection", "budget", "dietary needs"],
      reviewRequestAfterOrder: true,
    }),
    clickToWhatsAppUrl: `https://wa.me/${digits}?text=${encodeURIComponent(
      `Hi ${args.displayName}, I'd like to ask about an order or catering.`
    )}`,
    qrCodeLabel: args.label,
    onboardingSource: "demo_seed",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  if (existing) {
    await ctx.db.patch(existing._id, row);
    return existing._id;
  }
  return await ctx.db.insert("whatsappAccounts", row);
}

export const londonRestaurantDemo = mutation({
  args: {
    name: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const name = args.name ?? "New Wok's Cooking";
    const ownerEmail = args.ownerEmail ?? "juliet@newwokscooking.co";

    const existingGroup = await ctx.db
      .query("groups")
      .withIndex("by_owner_email", (q) => q.eq("ownerEmail", ownerEmail))
      .first();

    const groupId =
      existingGroup?._id ??
      (await ctx.db.insert("groups", {
        name,
        timezone: "Europe/London",
        primaryPhone: "+447700900123",
        ownerName: "Juliet Mensah",
        ownerEmail,
        plan: "Solo",
        status: "active",
        onboardingStep: 8,
        onboardingCompletedAt: now,
        bookingProvider: "ResDiary",
        posProvider: "Square",
        voiceTone: "warm",
        createdAt: ago(24),
      }));

    if (existingGroup) {
      await ctx.db.patch(groupId, {
        name,
        timezone: "Europe/London",
        primaryPhone: "+447700900123",
        ownerName: "Juliet Mensah",
        ownerEmail,
        plan: "Solo",
        status: "active",
        bookingProvider: "ResDiary",
        posProvider: "Square",
        voiceTone: "warm",
      });
    }

    const sites = await ctx.db
      .query("sites")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();
    const siteSpecs = [
      { name: "Islington", address: "220 Upper Street", postcode: "N1 1RU", coversToday: 38 },
      { name: "Camden", address: "71 Parkway", postcode: "NW1 7PP", coversToday: 24 },
      { name: "Shoreditch", address: "12 Redchurch Street", postcode: "E2 7DJ", coversToday: 31 },
    ];
    const siteIdsByName: Record<string, Id<"sites">> = {};
    for (const site of siteSpecs) {
      const existing = sites.find((row) => row.name === site.name);
      if (existing) {
        await ctx.db.patch(existing._id, {
          address: site.address,
          city: "London",
          postcode: site.postcode,
          coversToday: site.coversToday,
          status: "active",
        });
        siteIdsByName[site.name] = existing._id;
      } else {
        siteIdsByName[site.name] = await ctx.db.insert("sites", {
          groupId,
          name: site.name,
          address: site.address,
          city: "London",
          postcode: site.postcode,
          coversToday: site.coversToday,
          status: "active",
          createdAt: ago(24),
        });
      }
    }

    const customers = [
      ["Sarah Ahmed", "Islington", 1, "Lamb regular", "instagram", 7, 31200, 2],
      ["Daniel Okafor", "Camden", 2, "New regular?", "google", 3, 14200, 5],
      ["Olu Adebayo", "Islington", 3, "VIP", "referral", 14, 74000, 71],
      ["Priya Shah", "Camden", 4, "VIP birthday", "walk-in", 22, 118000, 64],
      ["Marcus Lee", "Camden", 5, "Spice fan", "instagram", 9, 40800, 60],
      ["Hannah Khan", "Shoreditch", 6, "VIP", "referral", 11, 54000, 67],
      ["Tom Hill", "Shoreditch", 7, "Family regular", "walk-in", 16, 82000, 83],
      ["Jamie Park", "Shoreditch", 8, "New", "booking", 2, 7800, 0],
    ] as const;

    const customerIds: Array<{ customerId: Id<"customers">; siteId: Id<"sites"> }> = [];
    for (const [customerName, siteName, n, tag, source, visitCount, spendCents, lastSeenDays] of customers) {
      const siteId = siteIdsByName[siteName];
      const normalized = phone(n);
      const existing = await ctx.db
        .query("customers")
        .withIndex("by_group_phone", (q) => q.eq("groupId", groupId).eq("phone", normalized))
        .unique();
      const row = {
        groupId,
        phone: normalized,
        name: customerName,
        email: `${customerName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        tags: [tag],
        consent: {
          whatsapp: true,
          email: source === "booking",
          capturedAt: ago(Math.max(lastSeenDays, 1)),
          source: source === "walk-in" ? "host_stand" : "booking_widget",
        },
        lastVisitAt: ago(lastSeenDays),
        visitCount,
        spendCents,
        pipelineStage: lastSeenDays > 60 ? "at-risk" : visitCount >= 10 ? "vip" : "active",
        source,
        primarySiteId: siteId,
        createdAt: ago(120),
      };
      if (existing) {
        await ctx.db.patch(existing._id, row);
        customerIds.push({ customerId: existing._id, siteId });
      } else {
        customerIds.push({ customerId: await ctx.db.insert("customers", row), siteId });
      }
    }

    for (let i = 0; i < customerIds.length; i += 1) {
      const { customerId, siteId } = customerIds[i];
      const existingVisits = await ctx.db
        .query("visits")
        .withIndex("by_group_customer", (q) => q.eq("groupId", groupId).eq("customerId", customerId))
        .take(1);
      if (existingVisits.length > 0) continue;
      await ctx.db.insert("visits", {
        groupId,
        customerId,
        siteId,
        at: ago(i === 7 ? 0 : i + 2),
        party: [2, 3, 2, 4, 2, 2, 5, 2][i],
        spendCents: [7200, 5400, 8800, 14800, 6200, 9400, 21000, 3900][i],
        source: i % 2 === 0 ? "booking" : "host_stand",
        notes: i === 1 ? "Severe nut allergy noted on booking." : undefined,
      });
    }

    const reviews = [
      {
        externalId: "gbp-demo-sarah-2026-05-06",
        siteId: siteIdsByName.Islington,
        author: "Sarah Ahmed",
        stars: 4,
        text: "Loved the lamb chow mein. Service was a bit slow at the start but the team made up for it.",
        sentiment: "positive",
        flagged: false,
      },
      {
        externalId: "gbp-demo-daniel-2026-05-06",
        siteId: siteIdsByName.Camden,
        author: "Daniel O.",
        stars: 2,
        text: "Felt rushed and my Singapore noodles came out lukewarm. Not what I hoped for on a Friday.",
        sentiment: "negative",
        flagged: true,
      },
    ];

    for (const review of reviews) {
      const existing = await ctx.db
        .query("reviews")
        .withIndex("by_external", (q) => q.eq("source", "gbp").eq("externalId", review.externalId))
        .unique();
      const row = {
        groupId,
        siteId: review.siteId,
        source: "gbp",
        externalId: review.externalId,
        author: review.author,
        stars: review.stars,
        text: review.text,
        createdAt: ago(review.stars < 3 ? 0.2 : 0.1),
        sentiment: review.sentiment,
        flagged: review.flagged,
        draft:
          review.stars < 3
            ? "Daniel, I am sorry. The noodles should never go out lukewarm, and we are following up with the kitchen about pacing. I would like the chance to put it right."
            : "Sarah, thank you for the kind note about the lamb chow mein. You are right that we were slow to settle in at the start, and we appreciate your patience.",
        draftedAt: now,
        status: "drafted",
      };
      if (existing) await ctx.db.patch(existing._id, row);
      else await ctx.db.insert("reviews", row);
    }

    const existingVoice = await ctx.db
      .query("brandVoice")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .first();
    const brandVoice = {
      groupId,
      summary:
        "Warm, specific and owner-written. Mention the dish or visit detail, keep it plain-spoken, and invite private follow-up for service recovery.",
      rules: [
        "Use UK spelling.",
        "Never sound corporate.",
        "Do not offer refunds in public replies.",
      ],
      bannedWords: ["valued customer", "journey", "delighted to inform"],
      examplesCount: 4,
      lastTrainedAt: now,
    };
    if (existingVoice) await ctx.db.patch(existingVoice._id, brandVoice);
    else await ctx.db.insert("brandVoice", brandVoice);

    const campaigns = [
      {
        name: "Spring win-back · 60-day silence",
        siteId: undefined,
        status: "scheduled",
        channel: "whatsapp",
        audienceFilter: { stage: "at-risk", site: "Islington" },
        body: "It has been a while. The new dragon-spiced lamb is on this week if you fancy your usual table.",
        scheduledAt: now + DAY,
        recipientCount: 142,
        estimatedCostCents: 640,
      },
      {
        name: "May birthdays · Islington",
        siteId: siteIdsByName.Islington,
        status: "draft",
        channel: "whatsapp",
        audienceFilter: { birthMonth: 5, site: "Islington" },
        body: "Birthday week from us: show this message for spring rolls and a bubble tea on the house.",
        recipientCount: 38,
        estimatedCostCents: 160,
      },
    ];
    const existingCampaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();
    for (const campaign of campaigns) {
      const existing = existingCampaigns.find((row) => row.name === campaign.name);
      const row = {
        groupId,
        siteId: campaign.siteId,
        name: campaign.name,
        status: campaign.status,
        channel: campaign.channel,
        audienceFilter: JSON.stringify(campaign.audienceFilter),
        body: campaign.body,
        scheduledAt: campaign.scheduledAt,
        recipientCount: campaign.recipientCount,
        estimatedCostCents: campaign.estimatedCostCents,
      };
      if (existing) await ctx.db.patch(existing._id, row);
      else await ctx.db.insert("campaigns", row);
    }

    await ensureConnection(ctx, {
      groupId,
      provider: "booking:resdiary",
      status: "green",
      config: { provider: "ResDiary", mode: "demo" },
    });
    await ensureConnection(ctx, {
      groupId,
      provider: "pos:square",
      status: "amber",
      config: { provider: "Square", mode: "demo", lastIssue: "OAuth refresh needed" },
    });
    for (const [siteName, siteId] of Object.entries(siteIdsByName)) {
      await ensureConnection(ctx, {
        groupId,
        siteId,
        provider: "google_business",
        status: "green",
        config: { locationName: `New Wok's Cooking - ${siteName}`, mode: "demo" },
      });
    }
    await ensureConnection(ctx, {
      groupId,
      provider: "whatsapp_meta",
      status: "pending",
      config: { phone: "+447700900123", mode: "demo" },
    });

    const groupWhatsAppId = await ensureWhatsAppAccount(ctx, {
      groupId,
      mode: "basic",
      status: "active",
      displayName: name,
      displayPhoneNumber: "+447700900123",
      label: "All sites catering QR",
    });
    const camdenWhatsAppId = await ensureWhatsAppAccount(ctx, {
      groupId,
      siteId: siteIdsByName.Camden,
      mode: "managed",
      status: "pending",
      displayName: `${name} Camden`,
      displayPhoneNumber: "+447700900124",
      label: "Camden counter QR",
    });

    const existingEnquiries = await ctx.db
      .query("whatsappEnquiries")
      .withIndex("by_group_receivedAt", (q) => q.eq("groupId", groupId))
      .collect();
    const enquiries = [
      {
        customerName: "Amira Patel",
        siteId: siteIdsByName.Islington,
        whatsappAccountId: groupWhatsAppId,
        phone: "+447700900231",
        source: "qr",
        need: "catering",
        stage: "quoted",
        valueCents: 42000,
        notes: "Office lunch trays for 28 people next Thursday.",
        receivedAt: ago(1),
      },
      {
        customerName: "Rashid Khan",
        siteId: siteIdsByName.Camden,
        whatsappAccountId: camdenWhatsAppId,
        phone: "+447700900232",
        source: "instagram",
        need: "order",
        stage: "confirmed",
        valueCents: 8600,
        notes: "Weekend family platter; asked for collection after 19:00.",
        receivedAt: ago(2),
      },
      {
        customerName: "Nina Roberts",
        siteId: siteIdsByName.Shoreditch,
        whatsappAccountId: groupWhatsAppId,
        phone: "+447700900233",
        source: "click_link",
        need: "booking",
        stage: "new",
        valueCents: 0,
        notes: "Birthday table for 6; needs halal sharing menu.",
        receivedAt: ago(0.4),
      },
    ];
    for (const enquiry of enquiries) {
      const existing = existingEnquiries.find((row) => row.customerName === enquiry.customerName);
      const row = {
        groupId,
        ...enquiry,
        updatedAt: now,
      };
      if (existing) await ctx.db.patch(existing._id, row);
      else await ctx.db.insert("whatsappEnquiries", row);
    }

    return {
      groupId,
      siteId: siteIdsByName.Islington,
      customers: customerIds.length,
      reviews: reviews.length,
    };
  },
});
