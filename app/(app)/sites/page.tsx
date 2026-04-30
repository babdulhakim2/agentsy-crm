"use client";

import * as React from "react";
import { FORGE } from "@/lib/data";
import { Icon } from "@/components/icons";
import { ProviderMark, HealthPill } from "@/components/atoms";
import { DesktopHeader } from "@/components/shell/DesktopHeader";

export default function SitesPage() {
  const F = FORGE;
  const [opened, setOpened] = React.useState<string | null>("Square");

  return (
    <div className="screen-desktop">
      <DesktopHeader
        eyebrow="Sites & integrations"
        title="Every connection, every problem, in one view."
        sub="Anything broken interrupts the morning brief. Everything else just works."
        right={
          <button type="button" className="btn btn-ghost">
            <Icon.Plus s={16} /> Add a site
          </button>
        }
      />
      <div className="desk-content">
        {/* Sites overview */}
        <div className="responsive-grid-3" style={{ marginBottom: 22 }}>
          {F.sites.map((s) => (
            <div key={s.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Icon.Building s={18} c="var(--ink-3)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 17 }}>{s.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{s.address}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[
                  { t: "GBP", c: "sage" as const },
                  { t: "Bookings", c: "sage" as const },
                  { t: "POS", c: s.id === "hackney" ? ("crimson" as const) : ("sage" as const) },
                  { t: "WhatsApp", c: "sage" as const },
                ].map((p) => (
                  <span
                    key={p.t}
                    className="health"
                    style={{
                      background:
                        p.c === "sage"
                          ? "var(--sage-tint)"
                          : p.c === "crimson"
                            ? "var(--crimson-tint)"
                            : "var(--amber-tint)",
                      color:
                        p.c === "sage"
                          ? "var(--sage)"
                          : p.c === "crimson"
                            ? "var(--crimson)"
                            : "var(--amber)",
                      border: "none",
                    }}
                  >
                    <span className={`dot dot-${p.c}`} style={{ width: 6, height: 6 }} />
                    {p.t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Integrations table */}
        <div className="card">
          <div
            style={{
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid var(--rule)",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div className="eyebrow">All integrations · 6 connected, 1 needs attention</div>
            <button
              type="button"
              className="btn-soft"
              style={{
                marginLeft: "auto",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12.5,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon.Plus s={13} /> Add integration
            </button>
          </div>
          {F.integrations.map((it) => (
            <div key={it.provider}>
              <div
                onClick={() => setOpened(opened === it.provider ? null : it.provider)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpened(opened === it.provider ? null : it.provider);
                  }
                }}
                role="button"
                tabIndex={0}
                className="int-row"
                style={{
                  borderBottom: opened === it.provider ? "none" : undefined,
                }}
              >
                <ProviderMark name={it.provider} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{it.provider}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{it.type}</div>
                </div>
                <div className="col-status">
                  <HealthPill status={it.status} />
                </div>
                <div className="col-sync" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                  Last sync · {it.sync}
                </div>
                <div className="col-scopes" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                  {it.scopes.join(" · ")}
                </div>
                <div style={{ textAlign: "right" }}>
                  {it.status === "red" ? (
                    <button type="button" className="btn btn-terracotta" style={{ padding: "6px 12px", fontSize: 12 }}>
                      Reconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-soft"
                      style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12 }}
                    >
                      Manage
                    </button>
                  )}
                </div>
              </div>
              {opened === it.provider && (
                <div
                  className="fade-up"
                  style={{
                    padding: "14px 18px 18px 90px",
                    background: "var(--paper-2)",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  {it.status === "red" && (
                    <div
                      className="card"
                      style={{
                        padding: 14,
                        marginBottom: 12,
                        background: "var(--crimson-tint)",
                        borderColor: "rgba(162,58,46,0.2)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <Icon.AlertTriangle s={16} c="var(--crimson)" />
                        <div style={{ flex: 1, fontSize: 13, color: "var(--ink-2)", minWidth: 220 }}>
                          <b>{it.error}</b> — reconnecting takes about 60 seconds. While Square&apos;s down, spend data
                          is frozen on yesterday&apos;s totals.
                        </div>
                        <button type="button" className="btn btn-terracotta" style={{ padding: "7px 14px", fontSize: 12.5 }}>
                          Reconnect
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="responsive-grid-3" style={{ gap: 14 }}>
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 6 }}>
                        Scopes granted
                      </div>
                      <div style={{ fontSize: 12.5 }}>{it.scopes.map((s) => "· " + s).join("  ")}</div>
                    </div>
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 6 }}>
                        Last successful sync
                      </div>
                      <div style={{ fontSize: 12.5 }}>{it.sync}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn-soft"
                        style={{ padding: "7px 12px", borderRadius: 8, fontSize: 12 }}
                      >
                        Test connection
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{
                          padding: "7px 12px",
                          fontSize: 12,
                          color: "var(--crimson)",
                          border: "1px solid rgba(162,58,46,0.2)",
                          borderRadius: 8,
                          background: "transparent",
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Marketplace */}
        <div className="card" style={{ marginTop: 22, padding: 22, background: "var(--card-2)" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Available · click to connect
          </div>
          <div className="responsive-grid-6">
            {[
              "ResDiary",
              "Access Collins",
              "OpenTable",
              "SevenRooms",
              "Eat App",
              "Square",
              "Lightspeed",
              "Toast",
              "Google Business Profile",
              "WhatsApp",
              "Instagram",
              "Email",
            ].map((p) => (
              <button
                key={p}
                type="button"
                className="card"
                style={{
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  background: "var(--card)",
                  border: "1px solid var(--rule)",
                }}
              >
                <ProviderMark name={p} size={36} />
                <div style={{ fontSize: 11.5, fontWeight: 500, textAlign: "center" }}>{p}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
