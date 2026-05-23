// Active-site context. Stored in localStorage so the picker remembers
// across reloads. `null` means "all sites" (the operator wants the full picture).
//
// Also owns the list of sites, so a branch added from the switcher (or the
// /sites page) shows up everywhere immediately.

"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FORGE } from "./data";
import type { Site } from "./types";
import { isConvexReady } from "./convex";
import {
  readTenantFromStorage,
  TENANT_CHANGED_EVENT,
  tenantSitesToAppSites,
  writeTenantToStorage,
  type StoredTenant,
} from "./tenant-storage";

type ActiveSiteId = string | null;

interface Ctx {
  sites: Site[];
  activeSiteId: ActiveSiteId;
  activeSite: Site | null;
  isAllSites: boolean;
  setActiveSiteId: (id: ActiveSiteId) => void;
  activeSiteName: string; // 'All sites' | site name
  tenantName: string;
  ownerName: string;
  filterByActiveSite: <T extends { site: string }>(items: T[]) => T[];
  addSite: (s: { name: string; address?: string }) => Site;
  updateSite: (id: string, patch: { name: string; address?: string }) => void;
}

const SiteCtx = React.createContext<Ctx | null>(null);
const STORAGE_KEY = "agentsy.activeSiteId";
const SITES_STORAGE_KEY = "agentsy.extraSites";

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [activeSiteId, setActiveSiteIdState] = React.useState<ActiveSiteId>(null);
  const [extraSites, setExtraSites] = React.useState<Site[]>([]);
  const [tenant, setTenant] = React.useState<StoredTenant | null>(null);
  const [backendTenant, setBackendTenant] = React.useState<StoredTenant | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v && v !== "null") setActiveSiteIdState(v);
      const xs = window.localStorage.getItem(SITES_STORAGE_KEY);
      if (xs) setExtraSites(JSON.parse(xs) as Site[]);
      setTenant(readTenantFromStorage());
    } catch {
      /* no-op */
    }
  }, []);

  React.useEffect(() => {
    const onTenantChanged = () => setTenant(readTenantFromStorage());
    window.addEventListener(TENANT_CHANGED_EVENT, onTenantChanged);
    window.addEventListener("storage", onTenantChanged);
    return () => {
      window.removeEventListener(TENANT_CHANGED_EVENT, onTenantChanged);
      window.removeEventListener("storage", onTenantChanged);
    };
  }, []);

  const setActiveSiteId = React.useCallback((id: ActiveSiteId) => {
    setActiveSiteIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id ?? "null");
    } catch {
      /* no-op */
    }
  }, []);

  const addSite = React.useCallback(
    (s: { name: string; address?: string }) => {
      const site: Site = {
        id: `local-${Date.now()}`,
        name: s.name,
        covers: 0,
        address: s.address ?? "",
      };
      setExtraSites((prev) => {
        const next = [...prev, site];
        try {
          window.localStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* no-op */
        }
        return next;
      });
      // Switch to the new site immediately so it's clearly the active context.
      setActiveSiteId(site.id);
      return site;
    },
    [setActiveSiteId]
  );

  const updateSite = React.useCallback((id: string, patch: { name: string; address?: string }) => {
    setExtraSites((prev) => {
      const next = prev.map((site) =>
        site.id === id ? { ...site, name: patch.name, address: patch.address ?? "" } : site
      );
      try {
        window.localStorage.setItem(SITES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* no-op */
      }
      return next;
    });

    const stored = readTenantFromStorage();
    if (stored) {
      const onboardedIndex = id.startsWith("onboarded-") ? Number(id.replace("onboarded-", "")) : -1;
      const nextTenant: StoredTenant = {
        ...stored,
        sites: stored.sites.map((site, index) =>
          site.id === id || site.name === id || index === onboardedIndex
            ? { ...site, name: patch.name, address: patch.address }
            : site
        ),
      };
      setTenant(nextTenant);
      writeTenantToStorage(nextTenant);
    }

    setBackendTenant((prev) =>
      prev
        ? {
            ...prev,
            sites: prev.sites.map((site) =>
              site.id === id || site.name === id
                ? { ...site, name: patch.name, address: patch.address }
                : site
            ),
          }
        : prev
    );
  }, []);

  const effectiveTenant = backendTenant ?? tenant;
  const baseSites = React.useMemo(
    () => (effectiveTenant ? tenantSitesToAppSites(effectiveTenant) : isConvexReady() ? [] : FORGE.sites),
    [effectiveTenant]
  );
  const sites = React.useMemo(() => [...baseSites, ...extraSites], [baseSites, extraSites]);
  const tenantName = effectiveTenant?.groupName ?? (isConvexReady() ? "Your restaurant" : FORGE.group);
  const ownerName = effectiveTenant?.ownerName ?? (isConvexReady() ? "Owner" : FORGE.owner);
  const activeSite = activeSiteId === null ? null : sites.find((s) => s.id === activeSiteId) ?? null;
  const isAllSites = activeSiteId === null;

  const activeSiteName =
    activeSiteId === null
      ? "All sites"
      : activeSite?.name ?? "All sites";

  const filterByActiveSite = React.useCallback(
    <T extends { site: string }>(items: T[]) => {
      if (!activeSite) return items;
      return items.filter((item) => item.site === activeSite.name);
    },
    [activeSite]
  );

  return (
    <SiteCtx.Provider
      value={{
        sites,
        activeSiteId,
        activeSite,
        isAllSites,
        setActiveSiteId,
        activeSiteName,
        tenantName,
        ownerName,
        filterByActiveSite,
        addSite,
        updateSite,
      }}
    >
      {mounted && isConvexReady() && <BackendTenantBridge onTenant={setBackendTenant} />}
      {children}
    </SiteCtx.Provider>
  );
}

export function useSite(): Ctx {
  const ctx = React.useContext(SiteCtx);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}

/** Helper for filtering arrays of items that have a `site` name. */
export function filterBySite<T extends { site: string }>(items: T[], activeId: ActiveSiteId): T[] {
  if (activeId === null) return items;
  // Resolve current name from the merged sites list (built into the provider).
  // Importing the provider here would be circular, so we just match by id-as-name fallback.
  const tenant = readTenantFromStorage();
  const all = tenant ? tenantSitesToAppSites(tenant) : isConvexReady() ? [] : [...FORGE.sites];
  const match = all.find((s) => s.id === activeId);
  if (!match) return items; // local-* (newly added) — no historical data yet
  return items.filter((i) => i.site === match.name);
}

function BackendTenantBridge({ onTenant }: { onTenant: (tenant: StoredTenant | null) => void }) {
  const current = useQuery(api.users.current);

  React.useEffect(() => {
    if (current === undefined) return;
    if (current === null) {
      onTenant(null);
      return;
    }
    const tenant = current.tenants.find((row) => row.group);
    if (!tenant?.group) {
      onTenant(null);
      return;
    }
    onTenant({
      groupName: tenant.group.name,
      ownerName: tenant.group.ownerName ?? current.user.name ?? "Owner",
      ownerEmail: tenant.group.ownerEmail ?? current.user.email,
      timezone: tenant.group.timezone,
      primaryPhone: tenant.group.primaryPhone,
      bookingProvider: tenant.group.bookingProvider,
      posProvider: tenant.group.posProvider,
      voiceTone: tenant.group.voiceTone,
      sites: tenant.sites.map((site) => ({
        id: site._id,
        name: site.name,
        address: site.address,
        city: site.city,
        postcode: site.postcode,
        coversToday: site.coversToday,
      })),
      createdAt: tenant.group.createdAt,
    });
  }, [current, onTenant]);

  return null;
}
