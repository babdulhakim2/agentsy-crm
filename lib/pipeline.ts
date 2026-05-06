// Pipeline + source taxonomies. Kept separate so the data model and the UI
// share one source of truth without coupling.

import type { PipelineStage, CustomerSource } from "./types";

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
  { id: "booking", label: "Online booking" },
  { id: "referral", label: "Referral" },
  { id: "instagram", label: "Instagram" },
  { id: "google", label: "Google search" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "event", label: "Event / collab" },
  { id: "other", label: "Other" },
];

export const SOURCE_LABEL: Record<CustomerSource, string> = SOURCES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.label }),
  {} as Record<CustomerSource, string>
);
