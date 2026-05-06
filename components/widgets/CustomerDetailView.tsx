"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "../icons";
import { OfferComposer } from "./OfferComposer";
import { SiteTag } from "./SiteTag";
import type { Customer, PipelineStage } from "@/lib/types";
import { STAGES, STAGE_BY_ID, SOURCE_LABEL } from "@/lib/pipeline";

const VISIT_HISTORY = [
  { d: "18 Feb", site: "Islington", party: 2, spend: "£72", notes: '"Great visit" — Jess', svr: "Anya" },
  { d: "03 Jan", site: "Islington", party: 4, spend: "£148", notes: "Family Sunday", svr: "Marco" },
  { d: "12 Dec", site: "Islington", party: 2, spend: "£54", notes: "—", svr: "Lou" },
  { d: "24 Nov", site: "Islington", party: 6, spend: "£220", notes: "Birthday", svr: "Anya" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  customer: Customer;
  onBack?: () => void;
  showBack?: boolean;
}

/**
 * Derive a small set of insights per customer. In production these come from
 * Convex queries over the visit history; for the demo we synthesize from the
 * customer's tag, recency, visits and spend so each profile feels real.
 */
function deriveInsights(g: Customer): string[] {
  const out: string[] = [];
  if (g.recency === "crimson") {
    out.push(
      `Used to come every 2–3 weeks. Hasn't booked since ${g.last}. Strong candidate for a personal nudge.`
    );
  }
  if (g.visits >= 10) {
    const avg = Math.round(g.spend / g.visits);
    out.push(`Top-decile loyalty — ${g.visits} visits with an average spend of £${avg} per cover.`);
  }
  if (g.tag.toLowerCase().includes("wine") || g.tag.toLowerCase().includes("spice")) {
    out.push(
      `Pattern: orders ${g.tag.toLowerCase()} on most visits. Try inviting them to next chef's tasting.`
    );
  }
  if (g.tag.toLowerCase().includes("vip")) {
    out.push(`Tagged VIP. Reserve corner table and brief the kitchen on dietary preferences.`);
  }
  if (g.birthMonth) {
    const m = MONTH_NAMES[g.birthMonth - 1];
    out.push(
      `Birthday in ${m}${g.birthDay ? ` (the ${g.birthDay}${["st", "nd", "rd"][g.birthDay - 1] ?? "th"})` : ""} — birthday treat queues automatically.`
    );
  }
  if (g.visits <= 2 && g.recency === "sage") {
    out.push(`First or second visit — they're at the make-or-break moment for becoming a regular.`);
  }
  if (out.length === 0) {
    out.push(`Steady regular. Spend is consistent and visits are well-spaced.`);
  }
  return out.slice(0, 3);
}

export function CustomerDetailView({ customer: g, onBack, showBack }: Props) {
  const [offerOpen, setOfferOpen] = React.useState(false);
  const [stagePickerOpen, setStagePickerOpen] = React.useState(false);
  const [stage, setStage] = React.useState<PipelineStage | undefined>(g.pipelineStage);
  const insights = deriveInsights(g);
  const stageMeta = stage ? STAGE_BY_ID[stage] : undefined;

  return (
    <div style={{ flex: 1, padding: "20px 28px 32px", maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        {showBack && (
          <button type="button" onClick={onBack} className="icon-btn" aria-label="Back to customers">
            <Icon.ChevronLeft s={18} />
          </button>
        )}
        <span className="eyebrow" style={{ marginLeft: showBack ? "auto" : 0 }}>
          Customer · #{g.id}
        </span>
        {!showBack && <span style={{ marginLeft: "auto" }} />}
        <button type="button" className="icon-btn" aria-label="More options">
          <Icon.More s={18} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
          {g.initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 28, lineHeight: 1.1 }}>{g.name}</div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--ink-3)",
              marginTop: 4,
              display: "flex",
              gap: 6,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span className={`dot dot-${g.recency}`} /> Last seen {g.last}
            <SiteTag site={g.site} subtle />
            {g.birthMonth && (
              <>
                <span style={{ opacity: 0.4 }}>·</span>
                🎂 {MONTH_NAMES[g.birthMonth - 1]}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline stage — clickable chip with inline picker.
          When the owner picks a stage, it locks (manual override).
          When unset, the daily Convex cron infers it from visit data. */}
      <div style={{ marginTop: 14, position: "relative" }}>
        <div
          className="eyebrow"
          style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}
        >
          Pipeline stage
          <span style={{ color: "var(--ink-4)", fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>
            · {stage ? "set" : "auto"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setStagePickerOpen((v) => !v)}
          className={stageMeta ? stageMeta.chip : "chip chip-ghost"}
          style={{
            cursor: "pointer",
            padding: "7px 12px",
            border: stageMeta ? "none" : "1px dashed var(--rule-2)",
          }}
        >
          {stageMeta ? stageMeta.label : "Set stage"}
          <Icon.ChevronDown s={12} />
        </button>
        {stagePickerOpen && (
          <div
            className="card fade-up"
            style={{
              marginTop: 8,
              padding: 8,
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              background: "var(--card-2)",
            }}
          >
            {STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setStage(s.id);
                  setStagePickerOpen(false);
                }}
                className={stage === s.id ? s.chip : "chip"}
                style={{ cursor: "pointer", padding: "6px 10px" }}
                title={s.hint}
              >
                {s.label}
              </button>
            ))}
            {stage && (
              <button
                type="button"
                onClick={() => {
                  setStage(undefined);
                  setStagePickerOpen(false);
                }}
                className="chip chip-ghost"
                style={{ cursor: "pointer", padding: "6px 10px", border: "1px dashed var(--rule-2)" }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {g.recency === "crimson" && (
        <div
          className="card"
          style={{
            marginTop: 14,
            padding: 12,
            background: "var(--crimson-tint)",
            borderColor: "rgba(162,58,46,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Icon.AlertTriangle s={16} c="var(--crimson)" />
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
            <b>{g.last}</b> — I&apos;d say hi.
          </span>
        </div>
      )}

      {/* Primary action — send a personal offer */}
      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-terracotta"
          onClick={() => setOfferOpen(true)}
          style={{ flex: "1 1 220px" }}
        >
          <Icon.Sparkle s={14} c="#fff" /> Send a personal offer
        </button>
        <Link href="/inbox" className="btn btn-ghost" style={{ flex: "0 0 auto" }}>
          <Icon.Send s={14} /> WhatsApp
        </Link>
      </div>

      {/* Agentsy-noticed insights — the "real CRM" moment */}
      <div
        className="card"
        style={{
          marginTop: 18,
          padding: 16,
          background: "var(--terracotta-tint)",
          borderColor: "rgba(184,95,58,0.18)",
        }}
      >
        <div
          className="eyebrow"
          style={{ color: "var(--terracotta)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon.Sparkle s={11} c="var(--terracotta)" /> Agentsy noticed
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {insights.map((i, idx) => (
            <li
              key={idx}
              style={{
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "var(--ink)",
              }}
            >
              {i}
            </li>
          ))}
        </ul>
      </div>

      {/* Stats */}
      <div className="card" style={{ marginTop: 14, padding: "14px 0" }}>
        {[
          ["Lifetime visits", `${g.visits}`],
          ["Lifetime spend", `£${g.spend}`],
          ["Avg per visit", g.visits > 0 ? `£${Math.round(g.spend / g.visits)}` : "—"],
          ["Source", g.source ? SOURCE_LABEL[g.source] : "—"],
        ].map(([k, v], i, arr) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 18px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--rule)" : "none",
              fontSize: 13.5,
            }}
          >
            <span style={{ color: "var(--ink-3)" }}>{k}</span>
            <span style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{v}</span>
          </div>
        ))}
      </div>

      <div
        className="card"
        style={{
          marginTop: 14,
          padding: 14,
          background: "var(--amber-tint)",
          borderColor: "rgba(184,133,50,0.3)",
        }}
      >
        <div className="eyebrow" style={{ color: "var(--amber)", marginBottom: 4 }}>
          Dietary · pinned
        </div>
        <div style={{ fontSize: 14.5, fontFamily: "var(--serif)" }}>
          No known allergies. Strong wine preferences.
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
        <span className="chip chip-terra">{g.tag}</span>
        <span className="chip">Côte de boeuf · 3x</span>
        <span className="chip">Reduces noise</span>
        <button className="chip chip-ghost" style={{ border: "1px dashed var(--rule-2)" }}>
          <Icon.Plus s={11} /> Tag
        </button>
      </div>

      <div style={{ marginTop: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Visits · last 4
        </div>
        {VISIT_HISTORY.map((v) => ({ ...v, site: g.site })).map((v) => (
          <div
            key={v.d}
            style={{
              display: "flex",
              gap: 12,
              padding: "10px 0",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div style={{ width: 64, fontSize: 12.5, color: "var(--ink-3)" }}>{v.d}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <SiteTag site={v.site} subtle />
                  <span>party of {v.party}</span>
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                {v.notes} · server {v.svr}
              </div>
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 14 }}>{v.spend}</div>
          </div>
        ))}
      </div>

      <OfferComposer open={offerOpen} onClose={() => setOfferOpen(false)} customer={g} />
    </div>
  );
}
