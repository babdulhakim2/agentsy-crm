import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { Customer } from "@/lib/types";
import { nextActionForCustomer, SOURCE_LABEL, stageForCustomer, STAGE_BY_ID } from "@/lib/pipeline";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

type Task = "insights" | "message";

interface Body {
  task: Task;
  customer: Customer;
  offer?: { label: string; voucher: string };
  restaurant?: { name?: string; ownerName?: string };
}

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.customer?.name || !["insights", "message"].includes(body.task)) {
    return NextResponse.json({ error: "Invalid customer AI request" }, { status: 400 });
  }

  try {
    if (body.task === "insights") {
      const text = await callOpenRouter(buildInsightMessages(body.customer, body.restaurant), 0.35);
      const insights = parseStringArray(text).slice(0, 3);
      if (!insights.length) throw new Error("AI returned no usable insights.");
      return NextResponse.json({ mode: "llm", insights });
    }

    const message = await callOpenRouter(buildMessageMessages(body.customer, body.offer, body.restaurant), 0.7);
    if (!message.trim()) throw new Error("AI returned an empty draft.");
    return NextResponse.json({ mode: "llm", message: cleanMessage(message) });
  } catch (err) {
    const fallback =
      body.task === "insights"
        ? { insights: fallbackInsights(body.customer) }
        : { message: fallbackMessage(body.customer, body.offer) };
    return NextResponse.json({
      mode: "fallback",
      ...fallback,
      reason: err instanceof Error ? err.message : "AI unavailable",
    });
  }
}

async function callOpenRouter(messages: OpenRouterMessage[], temperature: number): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_REFERER ?? "https://agentsy.app",
      "X-Title": "Agentsy",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
      messages,
      temperature,
      max_tokens: 520,
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

function buildInsightMessages(customer: Customer, restaurant?: Body["restaurant"]): OpenRouterMessage[] {
  const next = nextActionForCustomer(customer);
  return [
    {
      role: "system",
      content: [
        `You are Agentsy, a practical CRM assistant for an independent UK restaurant.`,
        `Use Gemini Flash 2.5 through OpenRouter to produce operational CRM insight, not generic marketing.`,
        `Write for a restaurant owner who does cold outreach, welcomes walk-ins, uses WhatsApp, and wants repeat visits.`,
        `Return JSON only: an array of 2 or 3 short strings. No markdown. No emojis.`,
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        restaurant?.name ? `Restaurant: ${restaurant.name}` : undefined,
        `Customer context:`,
        customerContext(customer),
        `Recommended next action: ${next.label} - ${next.detail}`,
        `Make the insights specific, decision-ready, and useful for the next customer touch.`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

function buildMessageMessages(
  customer: Customer,
  offer?: Body["offer"],
  restaurant?: Body["restaurant"]
): OpenRouterMessage[] {
  const next = nextActionForCustomer(customer);
  return [
    {
      role: "system",
      content: [
        `You write short WhatsApp messages for an independent UK restaurant.`,
        `Voice: warm, plain, personal, not salesy. No emojis. No exclamation marks.`,
        `The message must fit the customer's CRM stage and relationship history.`,
        `Do not invent allergies, bookings, private details, or previous conversations.`,
        `Return only the message text.`,
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        restaurant?.name ? `Restaurant: ${restaurant.name}` : undefined,
        restaurant?.ownerName ? `Sender/owner: ${restaurant.ownerName}` : undefined,
        `Customer context:`,
        customerContext(customer),
        `Next action: ${next.label}`,
        `Next action detail: ${next.detail}`,
        offer ? `Selected offer: ${offer.label} (${offer.voucher})` : undefined,
        customer.visits === 0
          ? `This person is still a lead. Invite them in for a first visit. Do not say "we missed you".`
          : `This person has visited before. Reference the relationship without sounding automated.`,
        `Keep it under 65 words and make it ready to send on WhatsApp.`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

function customerContext(customer: Customer): string {
  const stage = stageForCustomer(customer);
  const source = customer.source ? SOURCE_LABEL[customer.source] : "unknown";
  return [
    `Name: ${customer.name}`,
    `Site: ${customer.site}`,
    `Stage: ${STAGE_BY_ID[stage].label}`,
    `Source: ${source}`,
    `Visits: ${customer.visits}`,
    `Spend: GBP ${customer.spend}`,
    `Last seen: ${customer.last}`,
    `Tag: ${customer.tag}`,
    customer.birthMonth ? `Birthday month: ${customer.birthMonth}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

function parseStringArray(raw: string): string[] {
  const trimmed = raw.trim();
  const jsonText = trimmed.startsWith("[")
    ? trimmed
    : trimmed.match(/\[[\s\S]*\]/)?.[0] ?? "[]";
  const parsed = JSON.parse(jsonText) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function cleanMessage(raw: string): string {
  return raw.replace(/^["']|["']$/g, "").trim();
}

function fallbackInsights(customer: Customer): string[] {
  const next = nextActionForCustomer(customer);
  const stage = STAGE_BY_ID[stageForCustomer(customer)].label;
  const source = customer.source ? SOURCE_LABEL[customer.source] : "unknown source";
  return [
    `${stage} from ${source}. ${next.label} is the right next move.`,
    customer.visits === 0
      ? "They have not visited yet, so keep the message simple and focused on getting the first visit."
      : `${customer.visits} visits logged. Use the relationship history before sending a generic discount.`,
    next.detail,
  ].slice(0, 3);
}

function fallbackMessage(customer: Customer, offer?: Body["offer"]): string {
  const first = customer.name.split(" ")[0] || customer.name;
  const voucher = offer?.voucher ?? "20% off your next visit";
  if (customer.visits === 0 || stageForCustomer(customer) === "lead") {
    return `Hi ${first}, lovely to meet you. If you fancy trying us, show this message next time you come in and we will take care of ${voucher}.`;
  }
  return `Hi ${first}, quick one from ${customer.site}. We would love to see you again soon, so next time you are in, show this message for ${voucher}.`;
}
