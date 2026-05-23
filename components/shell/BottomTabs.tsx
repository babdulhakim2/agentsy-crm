"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../icons";

const TABS = [
  { id: "customers", href: "/customers", label: "Customers", Icon: Icon.Users },
  { id: "sites", href: "/sites", label: "Sites", Icon: Icon.Building },
  { id: "settings", href: "/settings", label: "Settings", Icon: Icon.Settings },
];

export function BottomTabs() {
  const pathname = usePathname() ?? "/";

  const isActive = (id: string, href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="tabbar" aria-label="Primary">
      {TABS.map((t) => {
        const I = t.Icon;
        const active = isActive(t.id, t.href);
        return (
          <Link key={t.id} href={t.href} className={active ? "active" : ""}>
            <I s={20} w={1.6} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
