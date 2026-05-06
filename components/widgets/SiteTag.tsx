"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { useSite } from "@/lib/site-context";

export function SiteTag({ site, subtle = false }: { site: string; subtle?: boolean }) {
  const { isAllSites } = useSite();
  if (!isAllSites) return null;

  return (
    <span
      className={subtle ? "chip" : "chip chip-terra"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: subtle ? "3px 7px" : "4px 8px",
        fontSize: subtle ? 10.5 : 11,
        flexShrink: 0,
      }}
    >
      <Icon.Building s={10} c={subtle ? "var(--ink-3)" : "currentColor"} />
      {site}
    </span>
  );
}
