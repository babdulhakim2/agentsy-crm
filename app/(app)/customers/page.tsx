"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FORGE } from "@/lib/data";
import { Icon } from "@/components/icons";
import { CustomerDetailView } from "@/components/widgets/CustomerDetailView";
import { QuickAddCustomer, QuickAddFab, type QuickAddPayload } from "@/components/widgets/QuickAddCustomer";
import { SiteTag } from "@/components/widgets/SiteTag";
import type { Customer, CustomerSource, PipelineStage, Recency } from "@/lib/types";
import { useSite } from "@/lib/site-context";
import { nextActionForCustomer, stageForCustomer, STAGES, STAGE_BY_ID, SOURCE_LABEL } from "@/lib/pipeline";
import {
  customerPhoneKey,
  deleteLocalCustomer,
  isCustomerDeleted,
  prependLocalCustomer,
  readLocalCustomers,
  upsertLocalCustomer,
} from "@/lib/customer-storage";
import { isConvexReady } from "@/lib/convex";

const NOW_MONTH = 5; // demo: pretend we're in May

const SEGMENTS = [
  { id: "all", label: "All" },
  { id: "lead", label: "Leads" },
  { id: "active", label: "Active" },
  { id: "vip", label: "VIPs" },
  { id: "risk", label: "At-risk" },
  { id: "recovery", label: "In recovery" },
  { id: "birthday", label: "Birthday this month" },
] as const;

type SegmentId = (typeof SEGMENTS)[number]["id"];

function matchesSegment(c: Customer, seg: SegmentId): boolean {
  switch (seg) {
    case "all":
      return true;
    case "lead":
      return stageForCustomer(c) === "lead";
    case "active":
      return stageForCustomer(c) === "active";
    case "vip":
      return stageForCustomer(c) === "vip";
    case "birthday":
      return c.birthMonth === NOW_MONTH;
    case "risk":
      return stageForCustomer(c) === "at-risk";
    case "recovery":
      return stageForCustomer(c) === "recovery";
  }
}

export default function CustomersPage() {
  const F = FORGE;
  const router = useRouter();
  const { activeSiteName, activeSite, sites, filterByActiveSite } = useSite();
  const [q, setQ] = React.useState("");
  const [seg, setSeg] = React.useState<SegmentId>("all");
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [extras, setExtras] = React.useState<Customer[]>([]);
  const [backendCustomers, setBackendCustomers] = React.useState<Customer[] | null>(null);
  const [backendGroupId, setBackendGroupId] = React.useState<string | undefined>();
  const [mounted, setMounted] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>(F.customers[0].id);

  const handleBackendCustomers = React.useCallback((customers: Customer[], groupId?: string) => {
    setBackendCustomers(customers);
    setBackendGroupId(groupId);
  }, []);

  React.useEffect(() => {
    setMounted(true);
    setExtras(readLocalCustomers());
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const handleCapture = (p: QuickAddPayload) => {
    const id = `local-${Date.now()}`;
    const customer: Customer = {
      id,
      initial: p.name[0]?.toUpperCase() ?? "?",
      name: p.name,
      phone: p.phone,
      email: p.email,
      site: activeSite?.name ?? sites[0]?.name ?? "Islington",
      visits: 0,
      spend: 0,
      tag: "New",
      recency: "sage",
      last: "just added",
      pipelineStage: "lead",
      birthMonth: p.birthMonth,
      birthDay: p.birthDay,
      source: p.customerSource,
    };
    setExtras(prependLocalCustomer(customer));
    setSelectedId(id);
  };

  const all = filterByActiveSite(mergeCustomers(extras, backendCustomers ?? F.customers));

  const total = all.length;
  const activeThisMonth = all.filter((c) => stageForCustomer(c) === "active").length;
  const birthdaysThisMonth = all.filter((c) => c.birthMonth === NOW_MONTH).length;
  const atRisk = all.filter((c) => stageForCustomer(c) === "at-risk").length;
  const weeklyGrowth = Math.max(1, Math.round(total * 0.12));
  const returningSoon = Math.max(0, all.filter((c) => stageForCustomer(c) === "active" && c.visits >= 2).length);
  const vipAtRisk = all.filter((c) => matchesSegment(c, "vip") && matchesSegment(c, "risk")).length;
  const pipelineCounts = STAGES.reduce(
    (acc, stage) => {
      acc[stage.id] = all.filter((c) => stageForCustomer(c) === stage.id).length;
      return acc;
    },
    {} as Record<PipelineStage, number>
  );

  const segmentCounts: Record<SegmentId, number> = {
    all: all.length,
    lead: all.filter((c) => matchesSegment(c, "lead")).length,
    active: all.filter((c) => matchesSegment(c, "active")).length,
    vip: all.filter((c) => matchesSegment(c, "vip")).length,
    risk: all.filter((c) => matchesSegment(c, "risk")).length,
    recovery: all.filter((c) => matchesSegment(c, "recovery")).length,
    birthday: all.filter((c) => matchesSegment(c, "birthday")).length,
  };

  const filtered = all.filter((c) => {
    const query = q.trim().toLowerCase();
    if (
      query &&
      ![
        c.name,
        c.phone,
        c.tag,
        c.site,
        c.source,
        c.source ? SOURCE_LABEL[c.source] : undefined,
        STAGE_BY_ID[stageForCustomer(c)].label,
      ].some((value) =>
        value?.toLowerCase().includes(query)
      )
    ) {
      return false;
    }
    if (!matchesSegment(c, seg)) return false;
    return true;
  });

  const selected = all.find((c) => c.id === selectedId) ?? all[0];

  const handleRowClick = (id: string) => {
    if (isDesktop) setSelectedId(id);
    else router.push(`/customers/${id}`);
  };

  const handleEditCustomer = async (customer: Customer) => {
    setExtras(upsertLocalCustomer(customer));
    setSelectedId(customer.id);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    setExtras(deleteLocalCustomer(customer));
    const deletedPhone = customerPhoneKey(customer.phone);
    const remaining = all.filter((item) => {
      if (item.id === customer.id) return false;
      return !(deletedPhone && customerPhoneKey(item.phone) === deletedPhone);
    });
    setSelectedId(remaining[0]?.id ?? "");
  };

  return (
    <div className="screen-twocol paper-grain">
      {mounted && isConvexReady() && (
        <BackendCustomersBridge onData={handleBackendCustomers} />
      )}
      <div className="screen-twocol__list">
        <div
          className="page-title"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="eyebrow">Customers · CRM · {activeSiteName}</div>
            <div className="h">Customers</div>
          </div>
          {isDesktop && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="btn btn-terracotta"
              style={{ padding: "10px 14px", fontSize: 13.5 }}
            >
              <Icon.Plus s={14} c="#fff" w={2.4} /> Add customer
            </button>
          )}
        </div>

        <div style={{ padding: "12px 14px" }}>
          <div className="card" style={{ padding: 12, background: "var(--card-2)" }}>
            <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--ink-3)",
                  }}
                >
                  <Icon.Search s={16} />
                </span>
                <input
                  className="input"
                  placeholder="Search name or phone"
                  style={{ paddingLeft: 36 }}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search customers"
                />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6, marginTop: 10 }}>
              <MiniStat label="All" value={total} sub={total ? `+${weeklyGrowth} this week` : undefined} />
              <MiniStat label="Active" value={activeThisMonth} sub={returningSoon ? `Due back: ${returningSoon}` : undefined} />
              <MiniStat label="Birthdays" value={birthdaysThisMonth} sub={birthdaysThisMonth ? "Next 30 days" : undefined} tone="amber" />
              <MiniStat label="At-risk" value={atRisk} sub={vipAtRisk ? `VIPs: ${vipAtRisk}` : undefined} tone="crimson" />
            </div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--rule)" }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Relationship pipeline
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 6 }}>
                {STAGES.map((stage) => (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setSeg(stage.id === "at-risk" ? "risk" : stage.id)}
                    className={seg === (stage.id === "at-risk" ? "risk" : stage.id) ? stage.chip : "chip"}
                    style={{ cursor: "pointer", justifyContent: "center", minWidth: 0, padding: "7px 5px" }}
                    title={stage.hint}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{stage.label}</span>
                    <span style={{ opacity: 0.75 }}>{pipelineCounts[stage.id]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {SEGMENTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeg(s.id)}
                  className={seg === s.id ? "chip chip-terra" : "chip"}
                  style={{ cursor: "pointer", paddingRight: 12 }}
                >
                  {s.label}
                  <span
                    style={{
                      color: seg === s.id ? "rgba(255,255,255,0.7)" : "var(--ink-4)",
                      marginLeft: 5,
                    }}
                  >
                    {segmentCounts[s.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {filtered.map((c) => {
            const active = isDesktop && c.id === selectedId;
            const customerStage = stageForCustomer(c);
            const stageMeta = STAGE_BY_ID[customerStage];
            const sourceLabel = c.source ? SOURCE_LABEL[c.source] : "No source";
            const nextAction = nextActionForCustomer(c);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleRowClick(c.id)}
                className={"list-row" + (active ? " active" : "")}
              >
                <div className="avatar">{c.initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span className={`dot dot-${c.recency}`} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <SiteTag site={c.site} subtle />
                      <span>
                        {c.visits} visits · £{c.spend} · {c.last}
                        {c.phone ? ` · ${c.phone}` : ""}
                      </span>
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, marginTop: 7, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 7px",
                        borderRadius: 8,
                        background: "var(--terracotta-tint)",
                        color: "var(--terracotta)",
                        fontWeight: 700,
                      }}
                    >
                      <span style={{ textTransform: "uppercase", fontSize: 9.5, letterSpacing: 0.4 }}>Next</span>
                      {nextAction.label}
                    </span>
                    <span style={{ color: "var(--ink-3)" }}>{sourceLabel}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                  <span className={stageMeta.chip}>{stageMeta.label}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-3)", maxWidth: 104, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.tag}
                  </span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 36, textAlign: "center", color: "var(--ink-3)" }}>
              <div className="serif-i">No customers match this search.</div>
              <button
                type="button"
                className="btn btn-terracotta"
                onClick={() => setAddOpen(true)}
                style={{ marginTop: 14, padding: "9px 14px", fontSize: 13 }}
              >
                <Icon.Plus s={13} c="#fff" /> Add this customer
              </button>
            </div>
          )}
          <div
            style={{
              padding: "14px 18px",
              fontSize: 12,
              color: "var(--ink-3)",
              fontStyle: "italic",
            }}
          >
            {backendCustomers ? "Showing saved customer data." : "Demo mode: saved locally on this device."}
          </div>
          {filtered.length > 0 && (
            <div style={{ padding: "0 14px 18px" }}>
              <div className="card" style={{ padding: 12, background: "var(--terracotta-tint)", borderColor: "rgba(184,95,58,0.18)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Icon.Sparkle s={15} c="var(--terracotta)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Suggested follow-up</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.45 }}>
                      Check at-risk regulars first, then send a personal WhatsApp offer from the customer profile.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="screen-twocol__detail">
        {selected ? (
          <CustomerDetailView customer={selected} onEditCustomer={handleEditCustomer} onDeleteCustomer={handleDeleteCustomer} />
        ) : (
          <div className="detail-empty">
            <div className="h">Select a customer</div>
            <div>Pick a name from the list to see their full profile.</div>
          </div>
        )}
      </div>

      {!isDesktop && <QuickAddFab onClick={() => setAddOpen(true)} label="Add customer" />}
      <QuickAddCustomer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCapture={handleCapture}
        source="manual"
        title="Add a customer"
        subtitle="Phone + first name. Everything else can come later."
        backendGroupId={backendGroupId}
      />
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  tint,
  tone,
}: {
  label: string;
  value: number;
  sub?: string;
  tint?: "amber" | "crimson";
  tone?: "amber" | "crimson";
}) {
  const pickedTone = tone ?? tint;
  const bg =
    pickedTone === "amber" ? "var(--amber-tint)" : pickedTone === "crimson" ? "var(--crimson-tint)" : "var(--paper-2)";
  const fg = pickedTone === "amber" ? "var(--amber)" : pickedTone === "crimson" ? "var(--crimson)" : "var(--ink)";
  return (
    <div style={{ padding: "9px 10px", background: bg, borderRadius: 8, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, minWidth: 0 }}>
        <div style={{ fontSize: 18, lineHeight: 1, fontFamily: "var(--serif)", color: fg }}>
          {value.toLocaleString()}
        </div>
        <div style={{ fontSize: 10.5, color: pickedTone ? fg : "var(--ink-3)" }}>
          {label}
        </div>
      </div>
      {sub && (
        <div
          style={{
            fontSize: 10.5,
            color: "var(--ink-3)",
            marginTop: 3,
            lineHeight: 1.25,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function BackendCustomersBridge({
  onData,
}: {
  onData: (customers: Customer[], groupId?: string) => void;
}) {
  const current = useQuery(api.users.current);
  const tenant = current?.tenants.find((row) => row.group);
  const groupId = tenant?.group?._id;
  const rows = useQuery(api.customers.list, groupId ? { groupId } : "skip");

  React.useEffect(() => {
    if (!tenant?.group || rows === undefined) return;
    const siteById = new Map(tenant.sites.map((site) => [site._id, site.name]));
    onData(rows.map((row) => customerFromBackend(row, siteById, tenant.sites[0]?.name)), tenant.group._id);
  }, [onData, rows, tenant]);

  return null;
}

function customerFromBackend(
  row: {
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
  },
  siteById: Map<string, string>,
  fallbackSite?: string
): Customer {
  const first = row.name.trim()[0]?.toUpperCase() ?? "?";
  const stage = asPipelineStage(row.pipelineStage);
  return {
    id: row._id,
    initial: first,
    name: row.name,
    phone: row.phone,
    email: row.email,
    site: row.primarySiteId ? siteById.get(row.primarySiteId) ?? fallbackSite ?? "Main site" : fallbackSite ?? "Main site",
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

function mergeCustomers(local: Customer[], base: Customer[]): Customer[] {
  const seenIds = new Set<string>();
  const seenPhones = new Set<string>();
  const out: Customer[] = [];
  for (const customer of [...local, ...base]) {
    if (isCustomerDeleted(customer)) continue;
    const phone = customerPhoneKey(customer.phone);
    if (seenIds.has(customer.id) || (phone && seenPhones.has(phone))) continue;
    seenIds.add(customer.id);
    if (phone) seenPhones.add(phone);
    out.push(customer);
  }
  return out;
}

function recencyFromLastVisit(lastVisitAt?: number): Recency {
  if (!lastVisitAt) return "sage";
  const days = Math.floor((Date.now() - lastVisitAt) / 86_400_000);
  if (days > 60) return "crimson";
  if (days > 30) return "amber";
  return "sage";
}

function lastSeenLabel(lastVisitAt?: number): string {
  if (!lastVisitAt) return "new";
  const days = Math.max(0, Math.floor((Date.now() - lastVisitAt) / 86_400_000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function asPipelineStage(value?: string): PipelineStage | undefined {
  return ["lead", "active", "vip", "at-risk", "recovery"].includes(value ?? "")
    ? (value as PipelineStage)
    : undefined;
}

function asCustomerSource(value?: string): CustomerSource | undefined {
  return ["walk-in", "qr", "outreach", "booking", "referral", "instagram", "google", "whatsapp", "event", "other"].includes(value ?? "")
    ? (value as CustomerSource)
    : undefined;
}
