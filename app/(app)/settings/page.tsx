"use client";

import * as React from "react";
import { DesktopHeader } from "@/components/shell/DesktopHeader";

export default function SettingsPage() {
  return (
    <div className="screen-desktop">
      <DesktopHeader
        eyebrow="Settings"
        title="Your account."
        sub="Notifications, billing, security — all the back-of-house bits."
      />
      <div className="desk-content">
        <div className="card" style={{ padding: 22, marginBottom: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Notifications
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              ["Daily morning brief", "WhatsApp + email · 08:30", true],
              ["Negative review (≤3★)", "WhatsApp · within 5 minutes", true],
              ["Integration broken", "WhatsApp + email · within 2 minutes", true],
              ["Inbound message bot can't handle", "WhatsApp", true],
              ["Daily covers anomalies", "Email digest · daily", false],
            ].map(([k, v, on]) => (
              <div
                key={k as string}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{v}</div>
                </div>
                <button
                  type="button"
                  className={"toggle" + (on ? " on" : "")}
                  aria-label={`Toggle ${k}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22, marginBottom: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Billing
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <span style={{ fontFamily: "var(--serif)", fontSize: 36 }}>£747</span>
            <span style={{ color: "var(--ink-3)" }}>/ month · 3 sites · Group plan</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
            Next invoice 1 May. Includes 3,000 WhatsApp marketing messages.
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Security
          </div>
          <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
            Magic-link sign-in. Two-factor on the way in Phase 2. SOC 2 Type 1 audit in progress.
          </div>
        </div>
      </div>
    </div>
  );
}
