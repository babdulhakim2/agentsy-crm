"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "../icons";
import type { Guest } from "@/lib/types";

const VISIT_HISTORY = [
  { d: "18 Feb", site: "Hackney", party: 2, spend: "£148", notes: '"Great visit" — Jess', svr: "Anya" },
  { d: "03 Jan", site: "Hackney", party: 4, spend: "£312", notes: "Wine pairing menu", svr: "Marco" },
  { d: "12 Dec", site: "King's Cross", party: 2, spend: "£97", notes: "—", svr: "Lou" },
  { d: "24 Nov", site: "Hackney", party: 6, spend: "£420", notes: "Birthday", svr: "Anya" },
];

interface Props {
  guest: Guest;
  onBack?: () => void;
  showBack?: boolean;
}

export function GuestDetailView({ guest: g, onBack, showBack }: Props) {
  return (
    <div style={{ flex: 1, padding: "20px 28px 32px", maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        {showBack && (
          <button type="button" onClick={onBack} className="icon-btn" aria-label="Back to guests">
            <Icon.ChevronLeft s={18} />
          </button>
        )}
        <span className="eyebrow" style={{ marginLeft: showBack ? "auto" : 0 }}>
          Guest · #{g.id}
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
            }}
          >
            <span className={`dot dot-${g.recency}`} /> Last seen {g.last} · {g.site}
          </div>
        </div>
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

      <div className="card" style={{ marginTop: 14, padding: "14px 0" }}>
        {[
          ["Lifetime visits", `${g.visits}`],
          ["Lifetime spend", `£${g.spend}`],
          ["Avg party", "2.4"],
          ["Top dish", "Côte de boeuf"],
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
        {VISIT_HISTORY.map((v) => (
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
                {v.site} · party of {v.party}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                {v.notes} · server {v.svr}
              </div>
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 14 }}>{v.spend}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap" }}>
        <Link href="/inbox" className="btn btn-terracotta" style={{ flex: "1 1 200px" }}>
          <Icon.Send s={14} c="#fff" /> Send WhatsApp
        </Link>
        <button type="button" className="btn btn-ghost">
          <Icon.Plus s={14} /> Note
        </button>
      </div>
    </div>
  );
}
