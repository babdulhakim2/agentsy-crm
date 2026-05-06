"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FORGE } from "@/lib/data";
import { Icon } from "@/components/icons";
import { CustomerDetailView } from "@/components/widgets/CustomerDetailView";
import { QuickAddCustomer, QuickAddFab, type QuickAddPayload } from "@/components/widgets/QuickAddCustomer";
import { SiteTag } from "@/components/widgets/SiteTag";
import type { Customer } from "@/lib/types";
import { useSite } from "@/lib/site-context";

const NOW_MONTH = 5; // demo: pretend we're in May

const SEGMENTS = [
  { id: "all", label: "All" },
  { id: "vip", label: "VIPs" },
  { id: "repeat", label: "Repeat" },
  { id: "new", label: "New" },
  { id: "birthday", label: "Birthday this month" },
  { id: "risk", label: "At-risk" },
  { id: "recovery", label: "In recovery" },
] as const;

type SegmentId = (typeof SEGMENTS)[number]["id"];

function matchesSegment(c: Customer, seg: SegmentId): boolean {
  switch (seg) {
    case "all":
      return true;
    case "vip":
      return c.pipelineStage === "vip" || c.tag.toLowerCase().includes("vip");
    case "repeat":
      return c.visits >= 5;
    case "new":
      return c.visits <= 2;
    case "birthday":
      return c.birthMonth === NOW_MONTH;
    case "risk":
      return c.pipelineStage === "at-risk" || c.recency === "crimson";
    case "recovery":
      return c.pipelineStage === "recovery";
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
  const [selectedId, setSelectedId] = React.useState<string>(F.customers[0].id);

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
      site: activeSite?.name ?? sites[0]?.name ?? "Islington",
      visits: 0,
      spend: 0,
      tag: "New",
      recency: "sage",
      last: "just added",
      birthMonth: p.birthMonth,
    };
    setExtras((prev) => [customer, ...prev]);
    setSelectedId(id);
  };

  const all = filterByActiveSite([...extras, ...F.customers]);

  const total = all.length + 8296; // illustrative — most still syncing
  const activeThisMonth = all.filter((c) => /day|today|2 days|5 days/.test(c.last)).length + 142;
  const birthdaysThisMonth = all.filter((c) => c.birthMonth === NOW_MONTH).length;
  const atRisk = all.filter((c) => c.recency === "crimson").length;

  const segmentCounts: Record<SegmentId, number> = {
    all: all.length,
    vip: all.filter((c) => matchesSegment(c, "vip")).length,
    repeat: all.filter((c) => matchesSegment(c, "repeat")).length,
    new: all.filter((c) => matchesSegment(c, "new")).length,
    birthday: all.filter((c) => matchesSegment(c, "birthday")).length,
    risk: all.filter((c) => matchesSegment(c, "risk")).length,
    recovery: all.filter((c) => matchesSegment(c, "recovery")).length,
  };

  const filtered = all.filter((c) => {
    if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (!matchesSegment(c, seg)) return false;
    return true;
  });

  const selected = all.find((c) => c.id === selectedId) ?? all[0];

  const handleRowClick = (id: string) => {
    if (isDesktop) setSelectedId(id);
    else router.push(`/customers/${id}`);
  };

  return (
    <div className="screen-twocol paper-grain">
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
            <div className="h">Find anyone. Notice patterns. Take action.</div>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="btn btn-terracotta"
            style={{ padding: "10px 14px", fontSize: 13.5 }}
          >
            <Icon.Plus s={14} c="#fff" w={2.4} /> Add customer
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8,
            padding: "12px 14px 6px",
          }}
        >
          <StatCard label="All customers" value={total.toLocaleString()} sub="across history" />
          <StatCard label="Active 30d" value={activeThisMonth.toString()} sub="visited recently" />
          <StatCard
            label="Birthdays · May"
            value={birthdaysThisMonth.toString()}
            sub="treats ready to send"
            tint="amber"
          />
          <StatCard label="At-risk" value={atRisk.toString()} sub="60+ days silent" tint="crimson" />
        </div>

        <div style={{ padding: "8px 14px 0" }}>
          <div
            className="card"
            style={{
              padding: 12,
              background: "var(--terracotta-tint)",
              borderColor: "rgba(184,95,58,0.2)",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <Icon.Sparkle s={16} c="var(--terracotta)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ color: "var(--terracotta)", marginBottom: 3 }}>
                Agentsy noticed
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink)" }}>
                Three of your VIPs — Olu, Hannah and Tom &amp; Rachel — used to come every 3 weeks
                and haven&apos;t booked since the spring menu changed. Want me to draft a personal
                &ldquo;come back and try the new lamb&rdquo; with 10% off?
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-terracotta"
                  style={{ padding: "7px 12px", fontSize: 12 }}
                >
                  <Icon.Send s={12} c="#fff" /> Draft outreach
                </button>
                <button type="button" className="btn btn-ghost" style={{ padding: "7px 12px", fontSize: 12 }}>
                  Show me the 3
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 14px" }}>
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
              placeholder="Name, phone, email…"
              style={{ paddingLeft: 36 }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search customers"
            />
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

        <div style={{ flex: 1 }}>
          {filtered.map((c) => {
            const active = isDesktop && c.id === selectedId;
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
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <SiteTag site={c.site} subtle />
                      <span>{c.visits} visits · £{c.spend} · {c.last}</span>
                    </span>
                  </div>
                </div>
                <span className="chip" style={{ flexShrink: 0 }}>
                  {c.tag}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 36, textAlign: "center", color: "var(--ink-3)" }}>
              <div className="serif-i">Nobody matches that filter yet.</div>
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
            Still importing — 2,140 of 8,300 customers synced.
          </div>
        </div>
      </div>

      <div className="screen-twocol__detail">
        {selected ? (
          <CustomerDetailView customer={selected} />
        ) : (
          <div className="detail-empty">
            <div className="h">Select a customer</div>
            <div>Pick a name from the list to see their full profile.</div>
          </div>
        )}
      </div>

      <QuickAddFab onClick={() => setAddOpen(true)} label="Add customer" />
      <QuickAddCustomer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCapture={handleCapture}
        source="manual"
        title="Add a customer"
        subtitle="Phone + first name. Everything else can come later."
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tint,
}: {
  label: string;
  value: string;
  sub: string;
  tint?: "amber" | "crimson";
}) {
  const bg =
    tint === "amber" ? "var(--amber-tint)" : tint === "crimson" ? "var(--crimson-tint)" : "var(--card)";
  const fg = tint === "amber" ? "var(--amber)" : tint === "crimson" ? "var(--crimson)" : "var(--ink)";
  return (
    <div className="card" style={{ padding: "10px 12px", background: bg, borderColor: "var(--rule)" }}>
      <div className="eyebrow" style={{ color: tint ? fg : "var(--ink-3)", marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: 26,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          color: fg,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: tint ? fg : "var(--ink-3)", marginTop: 3, opacity: 0.85 }}>
        {sub}
      </div>
    </div>
  );
}
