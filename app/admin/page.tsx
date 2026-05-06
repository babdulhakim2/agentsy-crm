"use client";

import * as React from "react";
import { ADMIN_RESTAURANTS, type AdminRestaurant } from "@/lib/admin-data";
import { Icon } from "@/components/icons";
import { OnboardSheet } from "@/components/admin/OnboardSheet";

const STATUS_CHIP: Record<AdminRestaurant["status"], string> = {
  active: "chip chip-sage",
  pending: "chip chip-amber",
  paused: "chip chip-crimson",
};

export default function AdminPage() {
  const [restaurants, setRestaurants] = React.useState(ADMIN_RESTAURANTS);
  const [open, setOpen] = React.useState(false);

  const totalBranches = restaurants.reduce((n, r) => n + r.branches.length, 0);
  const monthly = restaurants.reduce((n, r) => n + r.monthlyGBP, 0);
  const active = restaurants.filter((r) => r.status === "active").length;

  return (
    <div style={{ padding: "24px clamp(16px, 4vw, 32px) 48px", maxWidth: 1180, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 22,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow">Restaurants</div>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(24px, 4vw, 30px)",
              lineHeight: 1.15,
              margin: 0,
              fontWeight: 400,
            }}
          >
            Onboard, manage, switch between restaurants.
          </h1>
        </div>
        <button
          type="button"
          className="btn btn-terracotta"
          onClick={() => setOpen(true)}
          style={{ padding: "12px 16px", fontSize: 14 }}
        >
          <Icon.Plus s={14} c="#fff" w={2.4} /> Onboard new restaurant
        </button>
      </header>

      {/* Platform usage — how restaurants are using Agentsy this week */}
      <div
        style={{
          padding: 18,
          background: "var(--card)",
          border: "1px solid var(--rule)",
          borderRadius: 14,
          marginBottom: 22,
        }}
      >
        <div
          className="eyebrow"
          style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon.Sparkle s={11} c="var(--terracotta)" /> Platform usage · last 7 days
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          <UsageStat label="Customers added" value="284" delta="+38 vs prev wk" />
          <UsageStat label="WhatsApp messages sent" value="1,247" delta="92% approved" />
          <UsageStat label="Reviews replied" value="73" delta="median 47m to reply" />
          <UsageStat label="Daily-brief opens" value="14 / 21 days" delta="across all owners" />
          <UsageStat label="Operators active 24h" value="9" delta="of 11 invited" />
          <UsageStat label="AI cost · OpenRouter" value="£18.40" delta="0.6¢ avg / output" />
        </div>
      </div>

      <div
        className="responsive-grid-3"
        style={{ marginBottom: 22 }}
      >
        <Stat label="Restaurants" value={restaurants.length} sub={`${active} active`} />
        <Stat label="Branches" value={totalBranches} sub="across all tenants" />
        <Stat
          label="MRR"
          value={`£${monthly.toLocaleString()}`}
          sub="paid plans only"
        />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1.4fr 1fr 100px",
            padding: "12px 18px",
            borderBottom: "1px solid var(--rule)",
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontFamily: "var(--mono)",
            gap: 12,
          }}
        >
          <div>Restaurant</div>
          <div>Branches</div>
          <div>Plan · MRR</div>
          <div>Status</div>
          <div></div>
        </div>
        {restaurants.map((r) => (
          <div
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1.4fr 1fr 100px",
              padding: "14px 18px",
              borderBottom: "1px solid var(--rule)",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                Owner: {r.ownerName} · {r.ownerEmail}
              </div>
            </div>
            <div style={{ fontSize: 13 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{r.branches.length}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
                {r.branches.map((b) => b.name).join(" · ")}
              </div>
            </div>
            <div style={{ fontSize: 13 }}>
              <div>{r.plan}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {r.monthlyGBP > 0 ? `£${r.monthlyGBP}/mo` : "—"}
              </div>
            </div>
            <div>
              <span className={STATUS_CHIP[r.status]}>{r.status}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <a
                href="/today"
                className="btn-soft"
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  display: "inline-block",
                  textDecoration: "none",
                }}
              >
                Open
              </a>
            </div>
          </div>
        ))}
      </div>

      <OnboardSheet
        open={open}
        onClose={() => setOpen(false)}
        onCreate={(r) => setRestaurants((rs) => [r, ...rs])}
      />
    </div>
  );
}

function UsageStat({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: 24,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>{delta}</div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: 28,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 4 }}>{sub}</div>
    </div>
  );
}
