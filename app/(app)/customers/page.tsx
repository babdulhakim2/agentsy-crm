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
import type { Customer, PipelineStage } from "@/lib/types";
import { useSite } from "@/lib/site-context";
import { nextActionForCustomer, stageForCustomer, STAGES, STAGE_BY_ID, SOURCE_LABEL } from "@/lib/pipeline";
import { customerFromBackend } from "@/lib/customer-adapter";
import {
  customerPhoneKey,
  deleteLocalCustomer,
  isCustomerDeleted,
  prependLocalCustomer,
  readLocalCustomers,
  upsertLocalCustomer,
} from "@/lib/customer-storage";
import { isConvexReady } from "@/lib/convex";

const NOW_MONTH = new Date().getMonth() + 1;

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
  const [backendState, setBackendState] = React.useState<"loading" | "ready" | "noTenant">("loading");
  const [mounted, setMounted] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>("");

  const handleBackendCustomers = React.useCallback((customers: Customer[], groupId?: string) => {
    setBackendCustomers(customers);
    setBackendGroupId(groupId);
  }, []);

  React.useEffect(() => {
    setMounted(true);
    if (!isConvexReady()) setExtras(readLocalCustomers());
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
      site: activeSite?.name ?? sites[0]?.name ?? "Main site",
      visits: 0,
      spend: 0,
      tag: "New",
      recency: "sage",
      last: "just added",
      pipelineStage: "lead",
      birthMonth: p.birthMonth,
      birthDay: p.birthDay,
      source: p.customerSource,
      address: p.address,
    };
    setExtras(prependLocalCustomer(customer));
    setSelectedId(id);
  };

  const usingBackend = isConvexReady();
  const baseCustomers = usingBackend ? backendCustomers ?? [] : F.customers;
  const all = filterByActiveSite(mergeCustomers(usingBackend ? [] : extras, baseCustomers));
  const loadingCustomers = usingBackend && backendState === "loading" && backendCustomers === null;

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

  React.useEffect(() => {
    if (selectedId && all.some((customer) => customer.id === selectedId)) return;
    setSelectedId(all[0]?.id ?? "");
  }, [all, selectedId]);

  const handleRowClick = (id: string) => {
    if (isDesktop) setSelectedId(id);
    else router.push(`/customers/${id}`);
  };

  const handleEditCustomer = async (customer: Customer) => {
    if (usingBackend && !customer.id.startsWith("local-")) {
      await updateBackendCustomer(customer);
      return;
    }
    setExtras(upsertLocalCustomer(customer));
    setSelectedId(customer.id);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (usingBackend && !customer.id.startsWith("local-")) {
      await deleteBackendCustomer(customer.id);
      setSelectedId("");
      return;
    }
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
        <BackendCustomersBridge onData={handleBackendCustomers} onState={setBackendState} />
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
          {loadingCustomers ? (
            <div style={{ padding: 36, textAlign: "center", color: "var(--ink-3)" }}>
              <div className="serif-i">Loading customer book...</div>
            </div>
          ) : filtered.map((c) => {
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
                </div>
              </button>
            );
          })}
          {!loadingCustomers && filtered.length === 0 && (
            <div style={{ padding: 36, textAlign: "center", color: "var(--ink-3)" }}>
              <div className="serif-i">
                {backendState === "noTenant"
                  ? "Finish onboarding to create your customer book."
                  : q.trim()
                    ? "No customers match this search."
                    : "No customers yet. Add the first one when they visit."}
              </div>
              <button
                type="button"
                className="btn btn-terracotta"
                onClick={() => {
                  if (backendState === "noTenant") router.push("/onboarding");
                  else setAddOpen(true);
                }}
                style={{ marginTop: 14, padding: "9px 14px", fontSize: 13 }}
              >
                {backendState === "noTenant" ? (
                  "Go to onboarding"
                ) : (
                  <>
                    <Icon.Plus s={13} c="#fff" /> Add customer
                  </>
                )}
              </button>
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
        allowLocalFallback={!usingBackend}
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
  onState,
}: {
  onData: (customers: Customer[], groupId?: string) => void;
  onState: (state: "loading" | "ready" | "noTenant") => void;
}) {
  const current = useQuery(api.users.current);
  const tenant = current?.tenants.find((row) => row.group);
  const groupId = tenant?.group?._id;
  const rows = useQuery(api.customers.list, groupId ? { groupId } : "skip");

  React.useEffect(() => {
    if (current === undefined) {
      onState("loading");
      return;
    }
    if (!tenant?.group) {
      onData([], undefined);
      onState("noTenant");
      return;
    }
    if (rows === undefined) {
      onState("loading");
      return;
    }
    const siteById = new Map(tenant.sites.map((site) => [site._id, site.name]));
    onData(rows.map((row) => customerFromBackend(row, siteById, tenant.sites[0]?.name)), tenant.group._id);
    onState("ready");
  }, [current, onData, onState, rows, tenant]);

  return null;
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

async function updateBackendCustomer(customer: Customer) {
  const res = await fetch("/api/customers/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
      email: customer.email,
      tags: customer.tag ? [customer.tag] : [],
      customerSource: customer.source,
      address: customer.address,
      birthMonth: customer.birthMonth,
      birthDay: customer.birthDay,
      pipelineStage: customer.pipelineStage,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not update customer.");
  }
}

async function deleteBackendCustomer(id: string) {
  const res = await fetch("/api/customers/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not delete customer.");
  }
}
