// AI actions — OpenRouter → Gemini.
// Only actions live here (this is a node-mode module).

"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callOpenRouter(messages: OpenRouterMessage[], model = DEFAULT_MODEL): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing — set it in Convex dashboard env vars.");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_REFERER ?? "https://agentsy.app",
      "X-Title": "Agentsy",
    },
    body: JSON.stringify({ model, messages, temperature: 0.65, max_tokens: 400 }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { choices: { message: { content: string } }[] };
  return json.choices[0]?.message?.content?.trim() ?? "";
}

function buildVoiceSystemPrompt(opts: {
  groupName: string;
  voiceSummary?: string;
  rules: string[];
  bannedWords: string[];
}): string {
  const lines = [
    `You write in the voice of ${opts.groupName}, an independent UK restaurant group.`,
    opts.voiceSummary
      ? `Voice: ${opts.voiceSummary}`
      : `Voice: warm, plain-spoken, lightly British, never gushing. No exclamation marks.`,
    `Output: 1–3 short sentences. No emojis unless the rules say otherwise. Never use marketing-speak.`,
  ];
  if (opts.rules.length) lines.push(`Rules: ${opts.rules.join("; ")}.`);
  if (opts.bannedWords.length) lines.push(`Never use these words: ${opts.bannedWords.join(", ")}.`);
  lines.push(`Never apologize on behalf of suppliers. Don't promise refunds without owner approval.`);
  return lines.join("\n");
}

export const draftReviewReply = internalAction({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args): Promise<string> => {
    const review = await ctx.runQuery(internal.reviews.getInternal, { id: args.reviewId });
    if (!review) throw new Error("Review not found");

    const voice = await ctx.runQuery(internal.brandVoice.getInternal, { groupId: review.groupId });
    const group = await ctx.runQuery(internal.groups.getInternal, { id: review.groupId });

    const system = buildVoiceSystemPrompt({
      groupName: group?.name ?? "the restaurant",
      voiceSummary: voice?.summary,
      rules: voice?.rules ?? [],
      bannedWords: voice?.bannedWords ?? [],
    });

    const user = [
      `A customer left a ${review.stars}-star review.`,
      `Author: ${review.author}`,
      `Review: "${review.text}"`,
      review.stars <= 3
        ? `This is critical feedback. Acknowledge specifically, take responsibility, offer to put it right — don't grovel.`
        : `Reply briefly with a specific reference to something they mentioned. Don't be sycophantic.`,
    ].join("\n");

    return await callOpenRouter([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
  },
});

export const suggestWhatsAppReply = internalAction({
  args: {
    groupId: v.id("groups"),
    customerName: v.string(),
    inbound: v.string(),
    threadHistory: v.array(v.object({ role: v.string(), content: v.string() })),
  },
  handler: async (ctx, args): Promise<string> => {
    const voice = await ctx.runQuery(internal.brandVoice.getInternal, { groupId: args.groupId });
    const group = await ctx.runQuery(internal.groups.getInternal, { id: args.groupId });
    const system = buildVoiceSystemPrompt({
      groupName: group?.name ?? "the restaurant",
      voiceSummary: voice?.summary,
      rules: voice?.rules ?? [],
      bannedWords: voice?.bannedWords ?? [],
    });

    const messages: OpenRouterMessage[] = [
      { role: "system", content: system + `\nYou are responding on WhatsApp to ${args.customerName}.` },
      ...args.threadHistory.map((m) => ({
        role: (m.role === "customer" ? "user" : "assistant") as OpenRouterMessage["role"],
        content: m.content,
      })),
      { role: "user", content: args.inbound },
    ];
    return await callOpenRouter(messages);
  },
});
