import type { Customer, CustomerSource, PipelineStage, Recency } from "./types";

export interface BackendCustomerRow {
  _id: string;
  phone: string;
  email?: string;
  name: string;
  tags: string[];
  visitCount: number;
  spendCents: number;
  lastVisitAt?: number;
  pipelineStage?: string;
  source?: string;
  birthMonth?: number;
  birthDay?: number;
  primarySiteId?: string;
}

export function customerFromBackend(
  row: BackendCustomerRow,
  siteById: Map<string, string> = new Map(),
  fallbackSite = "Main site"
): Customer {
  const first = row.name.trim()[0]?.toUpperCase() ?? "?";
  const stage = asPipelineStage(row.pipelineStage);
  return {
    id: row._id,
    initial: first,
    name: row.name,
    phone: row.phone,
    email: row.email,
    site: row.primarySiteId ? siteById.get(row.primarySiteId) ?? fallbackSite : fallbackSite,
    visits: row.visitCount,
    spend: Math.round(row.spendCents / 100),
    tag: row.tags[0] ?? (row.visitCount === 0 ? "New" : stage === "vip" ? "VIP" : "Regular"),
    recency: recencyFromLastVisit(row.lastVisitAt),
    last: lastSeenLabel(row.lastVisitAt),
    pipelineStage: stage,
    source: asCustomerSource(row.source),
    birthMonth: row.birthMonth,
    birthDay: row.birthDay,
  };
}

export function recencyFromLastVisit(lastVisitAt?: number): Recency {
  if (!lastVisitAt) return "sage";
  const days = Math.floor((Date.now() - lastVisitAt) / 86_400_000);
  if (days > 60) return "crimson";
  if (days > 30) return "amber";
  return "sage";
}

export function lastSeenLabel(lastVisitAt?: number): string {
  if (!lastVisitAt) return "new";
  const days = Math.max(0, Math.floor((Date.now() - lastVisitAt) / 86_400_000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function asPipelineStage(value?: string): PipelineStage | undefined {
  return ["lead", "active", "vip", "at-risk", "recovery"].includes(value ?? "")
    ? (value as PipelineStage)
    : undefined;
}

export function asCustomerSource(value?: string): CustomerSource | undefined {
  return ["walk-in", "qr", "outreach", "booking", "referral", "instagram", "google", "whatsapp", "event", "other"].includes(value ?? "")
    ? (value as CustomerSource)
    : undefined;
}
