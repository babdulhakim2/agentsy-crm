"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FORGE } from "@/lib/data";
import { Icon } from "@/components/icons";
import { RestaurantSymbol } from "@/components/atoms/RestaurantMark";
import { QuickAddCustomer } from "@/components/widgets/QuickAddCustomer";
import { useSite } from "@/lib/site-context";

export default function HostStandPage() {
  const F = FORGE;
  const router = useRouter();
  const { activeSiteName, tenantName } = useSite();
  const [sel, setSel] = React.useState<string | null>(null);
  const [walkInOpen, setWalkInOpen] = React.useState(false);
  const seated = F.tonight.filter((t) => t.status === "arrived").length;
  const expected = F.tonight.filter((t) => t.status === "expected").length;

  const selected = sel ? F.tonight.find((x) => x.id === sel) : null;

  return (
    <div className="screen-bleed dark" style={{ background: "#1a1612", color: "#f5f0e6", overflow: "hidden", height: "100vh" }}>
      <div
        style={{
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          borderBottom: "1px solid rgba(245,240,230,0.08)",
          flexWrap: "wrap",
        }}
      >
        <RestaurantSymbol size={32} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 22,
              lineHeight: 1.1,
              color: "#f5f0e6",
            }}
          >
            {tenantName}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(245,240,230,0.55)",
              fontFamily: "var(--mono)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: 3,
            }}
          >
            Host stand · {activeSiteName === "All sites" ? F.sites[0]?.name : activeSiteName} · Wed 30 Apr · 18:14
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 22,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Stat label="Seated" value={seated} />
          <Stat label="Expected" value={expected} />
          <Stat label="Walk-ins" value={3} />
          <button
            type="button"
            onClick={() => setWalkInOpen(true)}
            style={{
              background: "var(--terracotta)",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon.Plus s={14} c="#fff" w={2.4} /> Walk-in
          </button>
          <button
            type="button"
            onClick={() => router.push("/today")}
            style={{
              background: "rgba(245,240,230,0.08)",
              color: "#f5f0e6",
              border: "none",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            Exit
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: sel ? "1fr 360px" : "1fr",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div className="scroll" style={{ padding: "14px 24px 24px", minHeight: 0 }}>
          {F.tonight.map((t) => {
            const isCurrent = t.time === "18:00" || t.time === "18:30";
            const past = t.status === "arrived";
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSel(t.id)}
                className={
                  "tonight-row" +
                  (sel === t.id ? " selected" : "") +
                  (isCurrent ? " current" : "") +
                  (past ? " past" : "")
                }
              >
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 30,
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 90,
                    color: isCurrent ? "#d18465" : "#f5f0e6",
                  }}
                >
                  {t.time}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>{t.name}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {t.party > 0 && (
                      <span
                        className="chip"
                        style={{ background: "rgba(245,240,230,0.08)", color: "#f5f0e6" }}
                      >
                        Party of {t.party}
                      </span>
                    )}
                    {t.tags.map((tg) => {
                      const danger = tg.toLowerCase().includes("allerg");
                      const vip = tg === "VIP";
                      return (
                        <span
                          key={tg}
                          className="chip"
                          style={{
                            background: danger
                              ? "rgba(162,58,46,0.25)"
                              : vip
                                ? "rgba(184,95,58,0.22)"
                                : "rgba(245,240,230,0.08)",
                            color: danger ? "#f1ddd0" : vip ? "#f1ddd0" : "#d6cdb9",
                            fontWeight: danger ? 600 : 400,
                          }}
                        >
                          {danger && "⚠ "}
                          {tg}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {past ? (
                  <span
                    className="chip"
                    style={{ background: "rgba(107,122,90,0.3)", color: "#d8ddc9" }}
                  >
                    <Icon.Check s={11} c="#d8ddc9" /> Seated
                  </span>
                ) : (
                  <Icon.ChevronRight s={20} c="rgba(245,240,230,0.4)" />
                )}
              </button>
            );
          })}
        </div>

        {selected && (
          <div
            style={{
              borderLeft: "1px solid rgba(245,240,230,0.08)",
              background: "rgba(245,240,230,0.03)",
              padding: "20px 22px",
              overflow: "auto",
              minHeight: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => setSel(null)}
                style={{ background: "transparent", border: "none", color: "rgba(245,240,230,0.6)", cursor: "pointer" }}
                aria-label="Close customer sheet"
              >
                <Icon.X s={20} c="rgba(245,240,230,0.6)" />
              </button>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "rgba(245,240,230,0.5)",
                  letterSpacing: "0.08em",
                }}
              >
                {selected.time} · party {selected.party || "?"}
              </span>
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 30, marginBottom: 4 }}>{selected.name}</div>
            <div style={{ fontSize: 13, color: "rgba(245,240,230,0.6)", marginBottom: 18 }}>
              3rd visit · last seen 18 Feb
            </div>

            {selected.tags.some((tg) => tg.toLowerCase().includes("allerg")) && (
              <div
                style={{
                  padding: 14,
                  background: "rgba(162,58,46,0.25)",
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontFamily: "var(--mono)",
                    color: "#f1ddd0",
                    marginBottom: 4,
                  }}
                >
                  ⚠ Allergy · pinned
                </div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.3 }}>
                  SEVERE NUT ALLERGY — please flag in the kitchen.
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontFamily: "var(--mono)",
                  color: "rgba(245,240,230,0.5)",
                  marginBottom: 8,
                }}
              >
                Last 3 visits
              </div>
              {[
                ["18 Feb", `${activeSiteName === "All sites" ? F.sites[0]?.name : activeSiteName} · 2`, "£72"],
                ["03 Jan", `${activeSiteName === "All sites" ? F.sites[0]?.name : activeSiteName} · 4`, "£148"],
                ["12 Dec", `${activeSiteName === "All sites" ? F.sites[0]?.name : activeSiteName} · 2`, "£54"],
              ].map(([d, w, s]) => (
                <div
                  key={d}
                  style={{
                    display: "flex",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(245,240,230,0.06)",
                    fontSize: 13.5,
                  }}
                >
                  <span style={{ width: 60, color: "rgba(245,240,230,0.5)" }}>{d}</span>
                  <span style={{ flex: 1 }}>{w}</span>
                  <span style={{ fontFamily: "var(--serif)" }}>{s}</span>
                </div>
              ))}
            </div>

            <button type="button" className="btn btn-terracotta" style={{ width: "100%", marginBottom: 8 }}>
              Mark seated
            </button>
            <button
              type="button"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 999,
                border: "1px solid rgba(245,240,230,0.18)",
                background: "transparent",
                color: "#f5f0e6",
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 18,
                cursor: "pointer",
              }}
            >
              Mark left
            </button>

            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "var(--mono)",
                color: "rgba(245,240,230,0.5)",
                marginBottom: 10,
              }}
            >
              Post-visit · one tap
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { l: "Great visit", c: "#d8ddc9", bg: "rgba(107,122,90,0.25)" },
                { l: "Recovery needed", c: "#f1ddd0", bg: "rgba(162,58,46,0.25)" },
                { l: "New regular?", c: "#f0e3c4", bg: "rgba(184,133,50,0.22)" },
              ].map((b) => (
                <button
                  key={b.l}
                  type="button"
                  style={{
                    padding: "12px",
                    borderRadius: 10,
                    border: "none",
                    background: b.bg,
                    color: b.c,
                    fontSize: 14,
                    fontWeight: 500,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  {b.l}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <HostQuickAdd open={walkInOpen} onClose={() => setWalkInOpen(false)} />
    </div>
  );
}

function HostQuickAdd({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <QuickAddCustomer
      open={open}
      onClose={onClose}
      source="host_stand"
      title="Quick walk-in"
      subtitle="Phone + name. We'll send them a thank-you tonight."
      defaultTags={["walk-in"]}
    />
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 10.5,
          color: "rgba(245,240,230,0.55)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "var(--mono)",
          marginTop: 3,
        }}
      >
        {label}
      </div>
    </div>
  );
}
