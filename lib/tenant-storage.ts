import type { Site } from "./types";

export const TENANT_STORAGE_KEY = "agentsy.currentTenant";
export const TENANT_CHANGED_EVENT = "agentsy.tenantChanged";

export interface StoredTenantSite {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  postcode?: string;
  coversToday?: number;
}

export interface StoredTenant {
  groupName: string;
  ownerName: string;
  ownerEmail?: string;
  timezone: string;
  primaryPhone?: string;
  bookingProvider?: string;
  posProvider?: string;
  voiceTone?: string;
  sites: StoredTenantSite[];
  createdAt: number;
}

export function readTenantFromStorage(): StoredTenant | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TENANT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredTenant) : null;
  } catch {
    return null;
  }
}

export function writeTenantToStorage(tenant: StoredTenant) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(tenant));
  window.dispatchEvent(new Event(TENANT_CHANGED_EVENT));
}

export function tenantSitesToAppSites(tenant: StoredTenant): Site[] {
  return tenant.sites.map((site, index) => ({
    id: site.id ?? `onboarded-${index}`,
    name: site.name,
    covers: site.coversToday ?? (index === 0 ? 38 : 0),
    address: [site.address, site.city, site.postcode].filter(Boolean).join(", "),
  }));
}
