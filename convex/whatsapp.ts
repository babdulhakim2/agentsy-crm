// WhatsApp Cloud API (Meta) — actions only (node module).
// Customer lookups + create live in convex/customers.ts.

"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";

const GRAPH_BASE = "https://graph.facebook.com/v20.0";

function env(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} not set in Convex environment.`);
  return val;
}

function envOptional(name: string): string | undefined {
  return process.env[name];
}

interface WhatsAppSendResult {
  messages?: { id: string }[];
}

async function sendRaw(
  payload: Record<string, unknown>,
  account?: Doc<"whatsappAccounts"> | null
): Promise<WhatsAppSendResult> {
  const phoneId = account?.phoneNumberId ?? envOptional("WHATSAPP_PHONE_NUMBER_ID");
  if (!phoneId) {
    throw new Error(
      "No connected WhatsApp sender. Use Basic mode for QR/click links, or connect this business's WhatsApp Cloud API number."
    );
  }
  const token = env("WHATSAPP_TOKEN");
  const r = await fetch(`${GRAPH_BASE}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`WhatsApp send failed (${r.status}): ${await r.text()}`);
  return await r.json();
}

async function resolveAccount(
  ctx: any,
  args: { groupId: Id<"groups">; siteId?: Id<"sites">; whatsappAccountId?: Id<"whatsappAccounts"> }
) {
  const account = args.whatsappAccountId
    ? await ctx.runQuery(internal.whatsappAccounts.getInternal, { id: args.whatsappAccountId })
    : await ctx.runQuery(internal.whatsappAccounts.bestForSendInternal, {
        groupId: args.groupId,
        siteId: args.siteId,
      });

  if (account && account.groupId !== args.groupId) {
    throw new Error("WhatsApp account does not belong to this restaurant.");
  }
  if (account && account.mode !== "connected" && !envOptional("WHATSAPP_PHONE_NUMBER_ID")) {
    throw new Error(
      "This WhatsApp account is in Basic/Managed setup mode. It can track links and enquiries, but cannot send through Cloud API until connected."
    );
  }
  return account;
}

/** Send a free-form text — only valid inside the 24h customer-initiated window. */
export const sendText = action({
  args: {
    groupId: v.id("groups"),
    siteId: v.optional(v.id("sites")),
    whatsappAccountId: v.optional(v.id("whatsappAccounts")),
    customerId: v.id("customers"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.runQuery(internal.customers.getInternal, { id: args.customerId });
    if (!customer) throw new Error("Customer not found");
    if (!customer.consent.whatsapp) throw new Error("Customer has not opted in to WhatsApp.");
    const account = await resolveAccount(ctx, args);

    const result = await sendRaw({
      messaging_product: "whatsapp",
      to: customer.phone.replace(/^\+/, ""),
      type: "text",
      text: { body: args.body, preview_url: false },
    }, account);

    const conversationId = await ctx.runMutation(internal.conversations.upsertWithCustomer, {
      groupId: args.groupId,
      customerId: args.customerId,
      siteId: args.siteId ?? customer.primarySiteId,
      channel: "whatsapp",
      aiHandled: false,
    });
    await ctx.runMutation(internal.conversations.appendMessage, {
      conversationId,
      direction: "out",
      sender: "owner",
      body: args.body,
      waMessageId: result.messages?.[0]?.id,
    });
    return { ok: true, messageId: result.messages?.[0]?.id };
  },
});

/** Send an approved template (used outside the 24h window). */
export const sendTemplate = action({
  args: {
    groupId: v.id("groups"),
    siteId: v.optional(v.id("sites")),
    whatsappAccountId: v.optional(v.id("whatsappAccounts")),
    customerId: v.id("customers"),
    template: v.string(),
    language: v.string(),
    components: v.optional(
      v.array(
        v.object({
          type: v.string(),
          parameters: v.array(v.object({ type: v.string(), text: v.string() })),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.runQuery(internal.customers.getInternal, { id: args.customerId });
    if (!customer) throw new Error("Customer not found");
    if (!customer.consent.whatsapp) throw new Error("Customer has not opted in to WhatsApp.");
    const account = await resolveAccount(ctx, args);

    await sendRaw({
      messaging_product: "whatsapp",
      to: customer.phone.replace(/^\+/, ""),
      type: "template",
      template: {
        name: args.template,
        language: { code: args.language },
        components: args.components ?? [],
      },
    }, account);

    const conversationId = await ctx.runMutation(internal.conversations.upsertWithCustomer, {
      groupId: args.groupId,
      customerId: args.customerId,
      siteId: args.siteId ?? customer.primarySiteId,
      channel: "whatsapp",
      aiHandled: false,
    });
    await ctx.runMutation(internal.conversations.appendMessage, {
      conversationId,
      direction: "out",
      sender: "owner",
      body: `[template:${args.template}]`,
    });
    return { ok: true };
  },
});

/** Process an inbound WhatsApp webhook payload. */
export const processInbound = internalAction({
  args: {
    groupId: v.optional(v.id("groups")),
    phoneNumberId: v.optional(v.string()),
    fromPhone: v.string(),
    body: v.string(),
    waMessageId: v.string(),
    senderName: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ handled: boolean }> => {
    const account = args.phoneNumberId
      ? await ctx.runQuery(internal.whatsappAccounts.findByPhoneNumberIdInternal, {
          phoneNumberId: args.phoneNumberId,
        })
      : null;
    const groupId = account?.groupId ?? args.groupId;
    if (!groupId) {
      throw new Error("Could not route inbound WhatsApp message to a restaurant.");
    }
    const phone = args.fromPhone.startsWith("+") ? args.fromPhone : "+" + args.fromPhone;
    let customer = await ctx.runQuery(internal.customers.findByPhoneInternal, {
      groupId,
      phone,
    });
    if (!customer) {
      const newId = await ctx.runMutation(internal.customers.createMinimalInternal, {
        groupId,
        phone,
        name: args.senderName ?? "WhatsApp customer",
      });
      customer = await ctx.runQuery(internal.customers.getInternal, { id: newId });
      if (!customer) throw new Error("Failed to create customer.");
    }

    const conversationId = await ctx.runMutation(internal.conversations.upsertWithCustomer, {
      groupId,
      customerId: customer._id,
      siteId: account?.siteId ?? customer.primarySiteId,
      channel: "whatsapp",
      aiHandled: true,
    });
    await ctx.runMutation(internal.conversations.appendMessage, {
      conversationId,
      direction: "in",
      sender: "customer",
      body: args.body,
      waMessageId: args.waMessageId,
    });

    try {
      const draft = await ctx.runAction(internal.ai.suggestWhatsAppReply, {
        groupId,
        customerName: customer.name,
        inbound: args.body,
        threadHistory: [],
      });
      if (draft) {
        await ctx.runMutation(internal.conversations.appendMessage, {
          conversationId,
          direction: "out",
          sender: "agentsy",
          body: `[draft] ${draft}`,
        });
      }
    } catch (err) {
      console.error("AI suggestion failed", err);
    }

    return { handled: true };
  },
});
