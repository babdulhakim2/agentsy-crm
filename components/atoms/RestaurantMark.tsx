// Restaurant brand mark — used in the sidebar and headers to give the operator's
// brand the dominant identity. Agentsy becomes a small "by Agentsy" credit.

"use client";

import * as React from "react";
import { FORGE } from "@/lib/data";
import { isConvexReady } from "@/lib/convex";
import { readTenantFromStorage, TENANT_CHANGED_EVENT } from "@/lib/tenant-storage";

interface Props {
  size?: number;
  /** When true, shows just the symbol; otherwise the full lockup. */
  symbolOnly?: boolean;
}

const LOGO_SRC = "/logo.png";

function useTenantBrand() {
  const [brand, setBrand] = React.useState({
    group: isConvexReady() ? "Your restaurant" : FORGE.group,
    site: isConvexReady() ? "Main site" : FORGE.sites[0]?.name ?? "—",
  });

  React.useEffect(() => {
    const sync = () => {
      const tenant = readTenantFromStorage();
      setBrand({
        group: tenant?.groupName ?? (isConvexReady() ? "Your restaurant" : FORGE.group),
        site: tenant?.sites[0]?.name ?? (isConvexReady() ? "Main site" : FORGE.sites[0]?.name ?? "—"),
      });
    };
    sync();
    window.addEventListener(TENANT_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(TENANT_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return brand;
}

/**
 * The restaurant logo, served from /public/logo.png.
 * Falls back to a terracotta tile with the first letter if the asset
 * is missing — keeps the demo robust during onboarding.
 */
export function RestaurantSymbol({ size = 32 }: { size?: number }) {
  const [failed, setFailed] = React.useState(false);
  const { group } = useTenantBrand();
  const letter = group.replace(/^the\s+/i, "").charAt(0).toUpperCase();

  if (failed) {
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
      src={LOGO_SRC}
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
