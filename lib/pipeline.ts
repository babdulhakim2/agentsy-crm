// Pipeline + source taxonomies. Kept separate so the data model and the UI
// share one source of truth without coupling.

import type { Customer, PipelineStage, CustomerSource } from "./types";

interface StageMeta {
  id: PipelineStage;
  label: string;
  hint: string;
  chip: string; // CSS chip class
}

export const STAGES: StageMeta[] = [
  { id: "lead", label: "Lead", hint: "Captured but hasn't visited yet", chip: "chip" },
  { id: "active", label: "Active", hint: "Visiting regularly", chip: "chip chip-sage" },
  { id: "vip", label: "VIP", hint: "Top-decile spend or visit count", chip: "chip chip-terra" },
  { id: "at-risk", label: "At-risk", hint: "60+ days silent — was a regular", chip: "chip chip-amber" },
  { id: "recovery", label: "Recovery", hint: "Personal offer sent — awaiting", chip: "chip chip-crimson" },
];

export const STAGE_BY_ID: Record<PipelineStage, StageMeta> = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<PipelineStage, StageMeta>
);

interface SourceMeta {
  id: CustomerSource;
  label: string;
}

export const SOURCES: SourceMeta[] = [
  { id: "walk-in", label: "Walk-in" },
  { id: "qr", label: "QR scan" },
  { id: "outreach", label: "Cold outreach" },
  { id: "booking", label: "Online booking" },
  { id: "referral", label: "Referral" },
  { id: "instagram", label: "Instagram" },
  { id: "google", label: "Google search" },
  { id: "delivery", label: "Delivery lead" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "event", label: "Event / collab" },
  { id: "other", label: "Other" },
];

export const SOURCE_LABEL: Record<CustomerSource, string> = SOURCES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.label }),
  {} as Record<CustomerSource, string>
);

export interface NextAction {
  label: string;
  detail: string;
  cta: string;
}

export function stageForCustomer(customer: Customer): PipelineStage {
  if (customer.pipelineStage) return customer.pipelineStage;
  if (customer.visits === 0) return "lead";
  if (customer.recency === "crimson") return "at-risk";
  if (customer.tag.toLowerCase().includes("vip") || customer.visits >= 10) return "vip";
  return "active";
}

export function nextActionForCustomer(customer: Customer): NextAction {
  switch (stageForCustomer(customer)) {
    case "lead":
      return customer.visits === 0
        ? {
            label: "Invite to first visit",
            detail: "They are still a lead. Send a simple WhatsApp invite or log the first visit when they come in.",
            cta: "Draft invite",
          }
        : {
            label: "Turn first visit into repeat",
            detail: "They have shown interest. Follow up with a reason to come back this week.",
            cta: "Draft follow-up",
          };
    case "active":
      return {
        label: "Keep warm",
        detail: "They are active. Keep the relationship warm with a light personal message or seasonal offer.",
        cta: "Draft message",
      };
    case "vip":
      return {
        label: "Personal check-in",
        detail: "They are high value. Send something personal, not a generic campaign.",
        cta: "Draft VIP note",
      };
    case "at-risk":
      return {
        label: "Win-back offer",
        detail: "They have gone quiet. Send a direct reason to return before they drift away.",
        cta: "Draft win-back",
      };
    case "recovery":
      return {
        label: "Follow up offer",
        detail: "A recovery touch has started. Follow up once, then move them back to active if they return.",
        cta: "Draft follow-up",
      };
  }
}
