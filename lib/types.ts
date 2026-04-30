// Domain types — typed model of the Forge group used across the app.

export type Recency = "sage" | "amber" | "crimson";
export type IntegrationStatus = "green" | "amber" | "red";
export type AvatarTone = "" | "sage" | "amber" | "ink";

export interface Site {
  id: string;
  name: string;
  covers: number;
  address: string;
}

export interface Review {
  id: string;
  author: string;
  site: string;
  stars: number;
  age: string;
  excerpt: string;
  draft: string;
  sentiment: "positive" | "negative" | "neutral";
  flagged?: boolean;
}

export interface Winback {
  id: string;
  name: string;
  site: string;
  last: string;
  tag: string;
  draft: string;
}

export interface SocialDraft {
  id: string;
  site: string;
  kind: string;
  draft: string;
}

export interface Anomaly {
  id: string;
  kind: string;
  label: string;
  detail: string;
}

export interface Guest {
  id: string;
  initial: string;
  name: string;
  site: string;
  visits: number;
  spend: number;
  tag: string;
  recency: Recency;
  last: string;
}

export interface TonightBooking {
  id: string;
  time: string;
  name: string;
  party: number;
  tags: string[];
  status: "arrived" | "expected";
  flag?: "allergy" | "vip";
}

export interface Thread {
  id: string;
  name: string;
  last: string;
  time: string;
  unread: boolean;
  ai: boolean;
  needs?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  status: "sending" | "scheduled" | "sent" | "paused";
  recipients: number;
  sent?: number;
  when?: string;
  channel: "WhatsApp" | "Email";
  cost: string;
}

export interface Integration {
  provider: string;
  type: string;
  status: IntegrationStatus;
  sync: string;
  scopes: string[];
  error?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  sites: string;
  last: string;
  initial: string;
  tone: AvatarTone;
  pending?: boolean;
}

export interface ForgeData {
  group: string;
  owner: string;
  date: string;
  sites: Site[];
  totalCovers: number;
  reviews: Review[];
  winbacks: Winback[];
  social: SocialDraft[];
  anomalies: Anomaly[];
  guests: Guest[];
  tonight: TonightBooking[];
  threads: Thread[];
  campaigns: Campaign[];
  integrations: Integration[];
  team: TeamMember[];
}
