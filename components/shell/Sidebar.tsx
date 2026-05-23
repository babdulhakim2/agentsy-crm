"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Icon } from "../icons";
import { AgentsyMark } from "../atoms";
import { RestaurantLockup } from "../atoms/RestaurantMark";
import { SiteSwitcher } from "./SiteSwitcher";

const PRIMARY = [
  { id: "customers", href: "/customers", label: "Customers", Icon: Icon.Users },
  { id: "sites", href: "/sites", label: "Sites", Icon: Icon.Building },
  { id: "settings", href: "/settings", label: "Settings", Icon: Icon.Settings },
];

interface SidebarProps {
  onAddBranch?: () => void;
}

export function Sidebar({ onAddBranch }: SidebarProps = {}) {
  const pathname = usePathname() ?? "/";
  const { user, isLoaded } = useUser();
  const ownerName = isLoaded ? user?.firstName || user?.fullName || "Owner" : "Owner";
  const ownerInitial = ownerName.charAt(0).toUpperCase();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="shell-sidebar">
      <Link href="/customers" style={{ display: "block", padding: "0 4px 12px", textDecoration: "none" }}>
        <RestaurantLockup size={32} />
      </Link>
      <div style={{ padding: "0 4px 14px" }}>
        <SiteSwitcher onAddBranch={onAddBranch} />
      </div>

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
      </nav>

      <Link
        href="/settings"
        style={{
          marginTop: "auto",
          padding: 12,
          background: "var(--paper-2)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          color: "inherit",
          transition: "background 0.15s",
        }}
        aria-label="Open owner settings"
      >
        <div className="avatar ink">{ownerInitial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{ownerName}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Owner · settings</div>
        </div>
        <div
          onClick={(event) => event.preventDefault()}
          onKeyDown={(event) => event.stopPropagation()}
          style={{ display: "flex", alignItems: "center" }}
        >
          <UserButton afterSignOutUrl="/" />
        </div>
        <Icon.ChevronRight s={14} c="var(--ink-3)" />
      </Link>

      {/* Tiny "by Agentsy" credit — secondary brand */}
      <div
        style={{
          marginTop: 10,
          padding: "8px 4px 0",
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "var(--ink-4)",
          fontSize: 10.5,
          letterSpacing: "0.06em",
        }}
      >
        <AgentsyMark size={14} />
        <span style={{ textTransform: "uppercase", fontFamily: "var(--mono)" }}>by Agentsy</span>
      </div>
    </aside>
  );
}
