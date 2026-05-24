// Domain types — the tenant data model used across the app.
// Currently modeled on the pilot customer (New Wok's Cooking, multi-site London).

export type Recency = "sage" | "amber" | "crimson";
export type IntegrationStatus = "green" | "amber" | "red";
export type AvatarTone = "" | "sage" | "amber" | "ink";

export interface Site {
  id: string;
  name: string;
  covers: number;
  address: string;
  phone?: string;
  visitRewardVisits?: number;
  visitRewardLabel?: string;
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
  /** Image to attach when posting. Path under /public, e.g. /sample-food/sweet-sour-chicken.jpg */
  imageUrl?: string;
  /** Short alt for the image; used as a fallback caption if file isn't found. */
  imageAlt?: string;
}

export interface BirthdayTreat {
  id: string;
  site: string;
  customerName: string;
  customerId: string;
  when: string; // 'Saturday' | '3 days' | etc
  voucher: string; // 'Free dim sum basket' | '£10 off your next visit'
  draft: string; // pre-written WhatsApp message
}

export type PipelineStage = "lead" | "active" | "vip" | "at-risk" | "recovery";

export type CustomerSource =
  | "walk-in"
  | "qr"
  | "outreach"
  | "booking"
  | "referral"
  | "instagram"
  | "google"
  | "whatsapp"
  | "event"
  | "other";

export interface Customer {
  id: string;
  initial: string;
  name: string;
  phone?: string;
  email?: string;
  site: string;
  visits: number;
  spend: number;
  tag: string;
  recency: Recency;
  last: string;
  /** Where the customer first came from. Optional. */
  source?: CustomerSource;
  /** Sales-pipeline stage. Optional — system suggests, owner overrides. */
  pipelineStage?: PipelineStage;
  /** Birth month (1-12). Captured optionally at quick-add. */
  birthMonth?: number;
  /** Specific day of month if known (1-31). Optional, used to flag "birthday this week". */
  birthDay?: number;
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
  site: string;
  name: string;
  last: string;
  time: string;
  unread: boolean;
  ai: boolean;
  needs?: boolean;
}

export interface Campaign {
  id: string;
  site: string;
  name: string;
  status: "sending" | "scheduled" | "sent" | "paused";
  recipients: number;
  sent?: number;
  when?: string;
  channel: "WhatsApp" | "Email";
  cost: string;
}

export type WhatsAppSetupMode = "basic" | "connected" | "managed";
export type WhatsAppAccountStatus = "draft" | "pending" | "active" | "blocked";

export interface WhatsAppAccount {
  id: string;
  site: string;
  mode: WhatsAppSetupMode;
  status: WhatsAppAccountStatus;
  displayName: string;
  displayPhoneNumber?: string;
  clickToWhatsAppUrl?: string;
  qrCodeLabel: string;
  flow: string[];
}

export interface WhatsAppEnquiry {
  id: string;
  site: string;
  customer: string;
  source: string;
  need: "catering" | "order" | "booking" | "review" | "other";
  stage: "new" | "quoted" | "confirmed" | "lost" | "review_requested";
  value: number;
  age: string;
  note: string;
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
  customers: Customer[];
  tonight: TonightBooking[];
  threads: Thread[];
  campaigns: Campaign[];
  whatsappAccounts: WhatsAppAccount[];
  whatsappEnquiries: WhatsAppEnquiry[];
  integrations: Integration[];
  team: TeamMember[];
  birthdays: BirthdayTreat[];
}
