"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../icons";
import { AgentsyMark } from "../atoms";

const PRIMARY = [
  { id: "today", href: "/today", label: "Today", Icon: Icon.Home },
  { id: "guests", href: "/guests", label: "Guests", Icon: Icon.Users },
  { id: "reviews", href: "/reviews", label: "Reviews", Icon: Icon.Star },
  { id: "inbox", href: "/inbox", label: "Inbox", Icon: Icon.Inbox },
];

const MORE = [
  { id: "campaigns", href: "/campaigns", label: "Campaigns", Icon: Icon.Send },
  { id: "voice", href: "/voice", label: "Brand voice", Icon: Icon.Sparkle },
  { id: "sites", href: "/sites", label: "Sites", Icon: Icon.Building, badge: 1 },
  { id: "team", href: "/team", label: "Team", Icon: Icon.Users },
  { id: "settings", href: "/settings", label: "Settings", Icon: Icon.Settings },
];

export function Sidebar() {
  const pathname = usePathname() ?? "/";
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="shell-sidebar">
      <Link href="/today" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 18px" }}>
        <AgentsyMark size={26} />
        <div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 17 }}>Agentsy</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>The Forge Group</div>
        </div>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {PRIMARY.map((i) => {
          const I = i.Icon;
          return (
            <Link
              key={i.id}
              href={i.href}
              className={`nav-item${isActive(i.href) ? " active" : ""}`}
            >
              <I s={17} w={1.7} />
              <span style={{ flex: 1 }}>{i.label}</span>
            </Link>
          );
        })}
        <div style={{ height: 1, background: "var(--rule)", margin: "12px 8px" }} />
        <div
          style={{
            fontSize: 10.5,
            color: "var(--ink-4)",
            padding: "4px 10px 6px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "var(--mono)",
          }}
        >
          More
        </div>
        {MORE.map((i) => {
          const I = i.Icon;
          return (
            <Link
              key={i.id}
              href={i.href}
              className={`nav-item${isActive(i.href) ? " active" : ""}`}
            >
              <I s={17} w={1.7} />
              <span style={{ flex: 1 }}>{i.label}</span>
              {i.badge ? (
                <span
                  style={{ width: 7, height: 7, borderRadius: 999, background: "var(--crimson)" }}
                  aria-label="needs attention"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", padding: 12, background: "var(--paper-2)", borderRadius: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="avatar ink">M</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Maya Hayward</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Owner</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
