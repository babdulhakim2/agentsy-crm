"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../icons";

const TABS = [
  { id: "today", href: "/today", label: "Today", Icon: Icon.Home },
  { id: "guests", href: "/guests", label: "Guests", Icon: Icon.Users },
  { id: "reviews", href: "/reviews", label: "Reviews", Icon: Icon.Star },
  { id: "inbox", href: "/inbox", label: "Inbox", Icon: Icon.Inbox },
  { id: "more", href: "/more", label: "More", Icon: Icon.More },
];

export function BottomTabs() {
  const pathname = usePathname() ?? "/";

  // Match the More tab against the umbrella pages
  const moreRoutes = ["/more", "/campaigns", "/voice", "/sites", "/team", "/settings"];

  const isActive = (id: string, href: string) => {
    if (id === "more") {
      return moreRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
    }
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
