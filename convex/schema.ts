// Convex schema — tenant-scoped (group), with optional per-site scoping.
//
// Scoping rules:
//   • groups   — top-level tenant (one per restaurant brand)
//   • sites    — branches under a group; the unit the operator switches between
//   • customers/brandVoice/connections (group_provider) — group-scoped (cross-branch identity)
//   • visits/reviews — site-scoped (the things that physically happen at a branch)
//   • conversations/campaigns/connections (per-site) — optionally site-scoped
//     when the operator wants to target one branch
//   • whatsappAccounts — group-scoped by default, optionally branch-scoped when
//     a site has its own sender number/display name
//
// Run `npx convex dev` once to generate _generated/ types; subsequent edits hot-reload.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  groups: defineTable({
    name: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
    logoUrl: v.optional(v.string()),
    timezone: v.string(),
    primaryPhone: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    ownerUserId: v.optional(v.id("users")),
    clerkOrganizationId: v.optional(v.string()),
    plan: v.optional(v.string()),
    status: v.optional(v.string()), // 'pending' | 'active' | 'paused'
    onboardingStep: v.optional(v.number()),
    onboardingCompletedAt: v.optional(v.number()),
    bookingProvider: v.optional(v.string()),
    posProvider: v.optional(v.string()),
    voiceTone: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_owner_email", ["ownerEmail"]),

  sites: defineTable({
    groupId: v.id("groups"),
    name: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    postcode: v.optional(v.string()),
    coversToday: v.optional(v.number()),
    googlePlaceId: v.optional(v.string()),
    gbpLocationId: v.optional(v.string()), // Google Business Profile location resource ID
    visitRewardVisits: v.optional(v.number()),
    visitRewardLabel: v.optional(v.string()),
    status: v.optional(v.string()), // 'pending' | 'active' | 'paused'
    createdAt: v.optional(v.number()),
  }).index("by_group", ["groupId"]),

  memberships: defineTable({
    userId: v.id("users"),
    groupId: v.id("groups"),
    role: v.string(), // 'owner' | 'manager' | 'host' | 'admin'
    status: v.string(), // 'active' | 'invited' | 'disabled'
    siteIds: v.array(v.id("sites")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_group", ["groupId"])
    .index("by_group_user", ["groupId", "userId"]),

  invitations: defineTable({
    groupId: v.id("groups"),
    email: v.string(),
    role: v.string(),
    status: v.string(), // 'pending' | 'accepted' | 'revoked'
    clerkInvitationId: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_group", ["groupId"]),

  // Unified customer profile across all sites in a group.
  // We dedupe on (groupId, phone) — phone is the canonical key.
  customers: defineTable({
    groupId: v.id("groups"),
    phone: v.string(), // E.164, e.g. +447700900123
    name: v.string(),
    email: v.optional(v.string()),
    dietary: v.optional(v.string()),
    tags: v.array(v.string()),
    consent: v.object({
      whatsapp: v.boolean(),
      email: v.boolean(),
      capturedAt: v.number(),
      source: v.string(), // 'host_stand' | 'qr' | 'manual' | 'booking_widget'
    }),
    lastVisitAt: v.optional(v.number()),
    visitCount: v.number(),
    spendCents: v.number(),
    /** 'lead' | 'active' | 'vip' | 'at-risk' | 'recovery' */
    pipelineStage: v.optional(v.string()),
    /** True when owner manually set the stage — cron leaves it alone. */
    pipelineStageManual: v.optional(v.boolean()),
    /** 'walk-in' | 'qr' | 'outreach' | 'booking' | 'referral' | 'instagram' | 'google' | 'whatsapp' | 'event' | 'other' */
    source: v.optional(v.string()),
    /** Birth month (1-12), used for birthday campaigns. */
    birthMonth: v.optional(v.number()),
    /** Optional birthday day of month (1-31). */
    birthDay: v.optional(v.number()),
    /** Site the customer most often visits — purely a hint for filtering UI. */
    primarySiteId: v.optional(v.id("sites")),
    createdAt: v.number(),
  })
    .index("by_group_phone", ["groupId", "phone"])
    .index("by_group_lastVisit", ["groupId", "lastVisitAt"])
    .searchIndex("by_name", {
      searchField: "name",
      filterFields: ["groupId"],
    }),

  visits: defineTable({
    groupId: v.id("groups"),
    customerId: v.id("customers"),
    siteId: v.id("sites"),
    at: v.number(),
    party: v.number(),
    spendCents: v.number(),
    source: v.string(), // 'booking' | 'walkin' | 'host_stand'
    notes: v.optional(v.string()),
    rating: v.optional(v.number()),
    feedback: v.optional(v.string()),
    reviewOptIn: v.optional(v.boolean()),
  })
    .index("by_group_customer", ["groupId", "customerId"])
    .index("by_site_at", ["siteId", "at"]),

  conversations: defineTable({
    groupId: v.id("groups"),
    customerId: v.id("customers"),
    /** Optional — set when the conversation is about a specific branch. */
    siteId: v.optional(v.id("sites")),
    channel: v.string(), // 'whatsapp' | 'email'
    lastMessageAt: v.number(),
    aiHandled: v.boolean(),
    needsHuman: v.boolean(),
    windowExpiresAt: v.optional(v.number()), // 24h WhatsApp window
  })
    .index("by_group_lastMessage", ["groupId", "lastMessageAt"])
    .index("by_customer", ["customerId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    direction: v.string(), // 'in' | 'out'
    sender: v.string(), // 'customer' | 'owner' | 'agentsy'
    body: v.string(),
    sentAt: v.number(),
    waMessageId: v.optional(v.string()),
    status: v.optional(v.string()), // 'sent' | 'delivered' | 'read' | 'failed'
  }).index("by_conversation_sentAt", ["conversationId", "sentAt"]),

  reviews: defineTable({
    groupId: v.id("groups"),
    siteId: v.id("sites"),
    source: v.string(), // 'gbp' | 'tripadvisor' (gbp only at MVP)
    externalId: v.string(), // GBP review name/id
    author: v.string(),
    stars: v.number(),
    text: v.string(),
    createdAt: v.number(),
    sentiment: v.optional(v.string()),
    flagged: v.boolean(),
    draft: v.optional(v.string()),
    draftedAt: v.optional(v.number()),
    replyText: v.optional(v.string()),
    repliedAt: v.optional(v.number()),
    status: v.string(), // 'needs_reply' | 'drafted' | 'sent' | 'skipped'
  })
    .index("by_group_status", ["groupId", "status"])
    .index("by_external", ["source", "externalId"])
    .index("by_site_createdAt", ["siteId", "createdAt"]),

  // Encrypted-at-rest provider tokens.
  // Each provider has its own shape — store as JSON string.
  connections: defineTable({
    groupId: v.id("groups"),
    siteId: v.optional(v.id("sites")), // some are per-site (GBP), some per-group
    provider: v.string(), // 'google_business' | 'whatsapp_meta' | 'square' | etc
    status: v.string(), // 'green' | 'amber' | 'red' | 'pending'
    secretsRef: v.optional(v.string()), // pointer to vault entry; or null and read from env
    config: v.string(), // JSON: refresh_token, locationId, etc
    lastSyncAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
  })
    .index("by_group_provider", ["groupId", "provider"])
    .index("by_site_provider", ["siteId", "provider"]),

  whatsappAccounts: defineTable({
    groupId: v.id("groups"),
    /** Optional — set when a branch owns a dedicated WhatsApp sender. */
    siteId: v.optional(v.id("sites")),
    /** 'basic' = click links/QRs, 'connected' = Meta Cloud API, 'managed' = agency-assisted setup. */
    mode: v.string(),
    /** 'draft' | 'pending' | 'active' | 'blocked' */
    status: v.string(),
    displayName: v.string(),
    displayPhoneNumber: v.optional(v.string()),
    /** Meta WhatsApp Business Account ID. Only present once connected through Embedded Signup/API. */
    wabaId: v.optional(v.string()),
    /** Meta Phone Number ID used for Cloud API send + webhook routing. */
    phoneNumberId: v.optional(v.string()),
    qualityRating: v.optional(v.string()),
    accessTokenSecretRef: v.optional(v.string()),
    defaultFlow: v.string(), // JSON: enquiry/order/review flow config
    clickToWhatsAppUrl: v.optional(v.string()),
    qrCodeLabel: v.optional(v.string()),
    onboardingSource: v.optional(v.string()), // 'onboarding' | 'embedded_signup' | 'manual'
    connectedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_site", ["siteId"])
    .index("by_phone_number_id", ["phoneNumberId"]),

  whatsappEnquiries: defineTable({
    groupId: v.id("groups"),
    siteId: v.optional(v.id("sites")),
    whatsappAccountId: v.optional(v.id("whatsappAccounts")),
    customerId: v.optional(v.id("customers")),
    customerName: v.string(),
    phone: v.optional(v.string()),
    source: v.string(), // 'qr' | 'click_link' | 'instagram' | 'manual' | 'google'
    need: v.string(), // 'catering' | 'order' | 'booking' | 'review' | 'other'
    stage: v.string(), // 'new' | 'quoted' | 'confirmed' | 'lost' | 'review_requested'
    valueCents: v.optional(v.number()),
    notes: v.optional(v.string()),
    receivedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group_receivedAt", ["groupId", "receivedAt"])
    .index("by_site_receivedAt", ["siteId", "receivedAt"])
    .index("by_group_stage", ["groupId", "stage"]),

  campaigns: defineTable({
    groupId: v.id("groups"),
    /** Optional — set when targeting a single branch's customers. */
    siteId: v.optional(v.id("sites")),
    name: v.string(),
    status: v.string(), // 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
    channel: v.string(), // 'whatsapp' | 'email'
    audienceFilter: v.string(), // JSON describing the audience query
    body: v.string(),
    scheduledAt: v.optional(v.number()),
    recipientCount: v.optional(v.number()),
    sentCount: v.optional(v.number()),
    estimatedCostCents: v.optional(v.number()),
  }).index("by_group", ["groupId"]),

  brandVoice: defineTable({
    groupId: v.id("groups"),
    summary: v.string(), // 3-line description fed to the LLM
    rules: v.array(v.string()), // 'never use emojis' etc
    bannedWords: v.array(v.string()),
    examplesCount: v.number(),
    lastTrainedAt: v.optional(v.number()),
  }).index("by_group", ["groupId"]),

  // Platform-level admins (you, onboarding restaurants).
  platformAdmins: defineTable({
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Short-lived signed state for OAuth flows.
  oauthState: defineTable({
    state: v.string(),
    groupId: v.id("groups"),
    siteId: v.optional(v.id("sites")),
    provider: v.string(),
    redirectAfter: v.string(),
    expiresAt: v.number(),
  }).index("by_state", ["state"]),
});
