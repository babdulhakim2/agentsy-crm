"use client";

import * as React from "react";
import { FORGE } from "@/lib/data";
import { Icon } from "@/components/icons";
import { DesktopHeader } from "@/components/shell/DesktopHeader";
import { SiteTag } from "@/components/widgets/SiteTag";
import { useSite } from "@/lib/site-context";

export default function TeamPage() {
  const F = FORGE;
  const { activeSite, activeSiteName, isAllSites } = useSite();
  const team = F.team.filter((member) => {
    if (!activeSite) return true;
    return member.sites === "All sites" || member.sites.includes(activeSite.name);
  });

  return (
    <div className="screen-desktop">
      <DesktopHeader
        eyebrow="Team & access"
        title="Add managers and hosts without giving everyone everything."
        sub={`Owner · Manager · Host. ${activeSiteName}.`}
        right={
          <button type="button" className="btn btn-terracotta">
            <Icon.Plus s={16} c="#fff" /> Invite
          </button>
        }
      />
      <div className="desk-content">
        <div className="card">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1.4fr 1fr 60px",
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
            <div>Member</div>
            <div>Role</div>
            <div>Sites</div>
            <div>Last active</div>
            <div></div>
          </div>
          {team.map((u) => (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1.4fr 1fr 60px",
                padding: "14px 18px",
                borderBottom: "1px solid var(--rule)",
                alignItems: "center",
                opacity: u.pending ? 0.7 : 1,
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div className={"avatar " + u.tone}>{u.initial}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{u.email}</div>
                </div>
              </div>
              <div>
                <span className={"chip " + (u.role === "Owner" ? "chip-terra" : "")}>
                  {u.role.split(" · ")[0]}
                </span>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {isAllSites ? (
                  u.sites.split(" · ").map((site) => <SiteTag key={site} site={site} subtle />)
                ) : (
                  <span style={{ fontSize: 13 }}>{u.sites}</span>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{u.last}</div>
              <div style={{ textAlign: "right" }}>
                <button
                  type="button"
                  className="btn-soft"
                  style={{ width: 28, height: 28, borderRadius: 8 }}
                  aria-label="Member options"
                >
                  <Icon.More s={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div
          className="card"
          style={{
            marginTop: 18,
            padding: 18,
            background: "var(--card-2)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <Icon.Sparkle s={20} c="var(--terracotta)" />
          <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.5, minWidth: 220 }}>
            <b>Tip.</b>{" "}
            <span className="serif-i">
              Add Sam to {activeSiteName === "All sites" ? "a branch" : activeSiteName} so she can see her site without bothering you.
            </span>
          </div>
          <button type="button" className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>
            Invite a manager
          </button>
        </div>
      </div>
    </div>
  );
}
