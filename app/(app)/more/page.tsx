"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { useSite } from "@/lib/site-context";

const ITEMS = [
  { href: "/campaigns", label: "Campaigns", sub: "4 active · 2 scheduled", Icon: Icon.Send },
  { href: "/voice", label: "Brand voice", sub: "Trained · last refreshed 4 days ago", Icon: Icon.Sparkle },
  { href: "/sites", label: "Sites", sub: "Manage branches and addresses", Icon: Icon.Building },
  { href: "/team", label: "Team", sub: "5 people · 1 invite pending", Icon: Icon.Users },
  { href: "/settings", label: "Settings", sub: "Notifications and security", Icon: Icon.Settings },
  { href: "/host", label: "Open host stand (tablet)", sub: "For Jess on the door", Icon: Icon.Calendar },
  { href: "/onboarding", label: "Re-run onboarding", sub: "Add a 4th site", Icon: Icon.Plus },
];

export default function MorePage() {
  const { sites } = useSite();
  const items = ITEMS.map((item) => {
    if (item.href === "/sites") return { ...item, sub: `${sites.length} site${sites.length === 1 ? "" : "s"}` };
    return item;
  });

  return (
    <div className="screen-desktop paper-grain">
      <div className="desk-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">More</div>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(22px, 4vw, 30px)",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              margin: 0,
              fontWeight: 400,
            }}
          >
            The rest of the back office.
          </h1>
        </div>
      </div>
      <div className="desk-content">
        <div className="responsive-grid-3" style={{ gap: 14 }}>
          {items.map((it) => {
            const I = it.Icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                className="card"
                style={{
                  padding: 18,
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                  background: "var(--card)",
                }}
              >
                <div
                  className="logo-tile"
                  style={{ background: "var(--paper-2)", width: 40, height: 40 }}
                >
                  <I s={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14.5,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    {it.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{it.sub}</div>
                </div>
                <Icon.ChevronRight s={16} c="var(--ink-3)" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
