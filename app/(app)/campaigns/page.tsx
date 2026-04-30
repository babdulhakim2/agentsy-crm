"use client";

import * as React from "react";
import { FORGE } from "@/lib/data";
import { Icon } from "@/components/icons";
import { DesktopHeader } from "@/components/shell/DesktopHeader";
import { ProviderMark, StatusBadge } from "@/components/atoms";

const TEMPLATES = [
  { t: "Win-back", s: "60-day silent regulars", emoji: "↺" },
  { t: "Birthday", s: "VIPs in the next 14 days", emoji: "✦" },
  { t: "Seasonal", s: "Menu drop, soft list", emoji: "◐" },
  { t: "Custom", s: "Build from scratch", emoji: "+" },
];

export default function CampaignsPage() {
  const F = FORGE;
  const [building, setBuilding] = React.useState(false);

  return (
    <div className="screen-desktop">
      <DesktopHeader
        eyebrow="Campaigns"
        title="Targeted, opt-in pushes."
        sub="Win-back the silent regulars. Birthday a few VIPs. Never spam."
        right={
          <button type="button" className="btn btn-terracotta" onClick={() => setBuilding(true)}>
            <Icon.Plus s={16} c="#fff" /> New campaign
          </button>
        }
      />
      <div className="desk-content">
        {!building ? (
          <>
            <div className="card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                  padding: "12px 18px",
                  borderBottom: "1px solid var(--rule)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  fontFamily: "var(--mono)",
                  gap: 10,
                }}
              >
                <div>Campaign</div>
                <div>Status</div>
                <div>Recipients</div>
                <div>Channel</div>
                <div>Cost</div>
              </div>
              {F.campaigns.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                    padding: "14px 18px",
                    borderBottom: "1px solid var(--rule)",
                    alignItems: "center",
                    cursor: "pointer",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                      {c.when ?? (c.sent ? `${c.sent} of ${c.recipients} sent` : "—")}
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{c.recipients}</div>
                  <div style={{ fontSize: 13 }}>{c.channel}</div>
                  <div style={{ fontSize: 13, fontFamily: "var(--serif)" }}>{c.cost}</div>
                </div>
              ))}
            </div>

            <div
              className="card"
              style={{ marginTop: 18, padding: 18, background: "var(--card-2)" }}
            >
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Templates
              </div>
              <div className="responsive-grid-4">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.t}
                    type="button"
                    className="card"
                    onClick={() => setBuilding(true)}
                    style={{ padding: 14, cursor: "pointer", textAlign: "left", border: "1px solid var(--rule)" }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontFamily: "var(--serif)",
                        color: "var(--terracotta)",
                        marginBottom: 4,
                      }}
                    >
                      {t.emoji}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t.t}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{t.s}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <CampaignBuilder onClose={() => setBuilding(false)} />
        )}
      </div>
    </div>
  );
}

function CampaignBuilder({ onClose }: { onClose: () => void }) {
  return (
    <div className="responsive-2col-sticky">
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            style={{ width: 32, height: 32 }}
            aria-label="Close builder"
          >
            <Icon.X s={16} />
          </button>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>New campaign · Win-back</div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>
          1 · Audience
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          <span className="chip chip-terra">Last visit · 60+ days ago</span>
          <span className="chip chip-terra">Lifetime visits ≥ 3</span>
          <span className="chip chip-terra">Has WhatsApp opt-in</span>
          <span className="chip">All sites</span>
          <button className="chip chip-ghost" style={{ border: "1px dashed var(--rule-2)" }}>
            <Icon.Plus s={11} /> Filter
          </button>
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>
          2 · Channel
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <div className="radio-card selected" style={{ flex: 1, minWidth: 220 }}>
            <div className="ring" />
            <ProviderMark name="WhatsApp" size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>WhatsApp</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>~£0.04 / message</div>
            </div>
          </div>
          <div className="radio-card" style={{ flex: 1, minWidth: 220 }}>
            <div className="ring" />
            <ProviderMark name="Email" size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>Email</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Free · their domain</div>
            </div>
          </div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>
          3 · Message{" "}
          <span style={{ color: "var(--terracotta)", textTransform: "none", letterSpacing: 0 }}>
            · in your voice
          </span>
        </div>
        <textarea
          className="textarea"
          rows={5}
          defaultValue={
            "Hi {{first_name}} — it's been a minute. The new spring menu lands Thursday and we kept a Friday two-top free in case you'd like it. — Maya"
          }
          style={{ marginBottom: 18 }}
        />

        <div className="eyebrow" style={{ marginBottom: 8 }}>
          4 · Schedule
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input className="input" defaultValue="2 May 2026" style={{ flex: 2, minWidth: 180 }} />
          <input className="input" defaultValue="11:00" style={{ flex: 1, minWidth: 100 }} />
        </div>
      </div>
      <div>
        <div className="card" style={{ padding: 18, position: "sticky", top: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Audience preview
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 42, fontVariantNumeric: "tabular-nums" }}>142</span>
            <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>guests match</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>Sample 5</div>
          {FORGE.guests.slice(0, 5).map((g) => (
            <div key={g.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0" }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 11.5 }}>
                {g.initial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{g.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{g.last}</div>
              </div>
            </div>
          ))}
          <div style={{ height: 1, background: "var(--rule)", margin: "14px 0" }} />
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Estimated cost</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>~£6.00</div>
          <button type="button" className="btn btn-terracotta" style={{ width: "100%", marginTop: 14 }}>
            Schedule send
          </button>
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              textAlign: "center",
              marginTop: 8,
              fontStyle: "italic",
            }}
          >
            Confirm modal: 142 guests, 2 May 11:00.
          </div>
        </div>
      </div>
    </div>
  );
}
