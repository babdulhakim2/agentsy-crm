// Restaurant brand mark — used in the sidebar and headers to give the operator's
// brand the dominant identity. Agentsy becomes a small "by Agentsy" credit.

"use client";

import * as React from "react";
import { useSite } from "@/lib/site-context";

interface Props {
  size?: number;
  /** When true, shows just the symbol; otherwise the full lockup. */
  symbolOnly?: boolean;
}

function useTenantBrand() {
  const { tenantName, activeSiteName, sites, logoUrl } = useSite();
  return {
    group: tenantName,
    site: activeSiteName === "All sites" ? sites[0]?.name ?? "Main site" : activeSiteName,
    logoUrl,
  };
}

/**
 * Restaurant logo from tenant settings. Falls back to a terracotta tile with
 * the first letter so the app never depends on a hardcoded brand asset.
 */
export function RestaurantSymbol({ size = 32 }: { size?: number }) {
  const [failed, setFailed] = React.useState(false);
  const { group, logoUrl } = useTenantBrand();
  const letter = group.replace(/^the\s+/i, "").charAt(0).toUpperCase();
  React.useEffect(() => setFailed(false), [logoUrl]);

  if (!logoUrl || failed) {
    return (
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          borderRadius: 9,
          background: "var(--terracotta)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--serif)",
          fontWeight: 500,
          fontSize: size * 0.5,
          flexShrink: 0,
        }}
      >
        {letter}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={group}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        borderRadius: 9,
        objectFit: "cover",
        flexShrink: 0,
        display: "block",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 4px 10px rgba(26,22,18,0.10)",
      }}
    />
  );
}

/**
 * Full restaurant lockup — symbol + serif name + tiny location.
 * Use anywhere we want the operator's brand to feel primary.
 */
export function RestaurantLockup({ size = 32 }: Props) {
  const { group, site } = useTenantBrand();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <RestaurantSymbol size={size} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: size * 0.55,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 180,
          }}
        >
          {group}
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
            marginTop: 2,
          }}
        >
          {site}
        </div>
      </div>
    </div>
  );
}
