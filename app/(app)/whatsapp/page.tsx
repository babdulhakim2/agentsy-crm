"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FORGE } from "@/lib/data";
import type { WhatsAppAccount, WhatsAppSetupMode } from "@/lib/types";
import { isConvexReady } from "@/lib/convex";
import {
  readTenantFromStorage,
  TENANT_CHANGED_EVENT,
  writeTenantToStorage,
  type StoredTenant,
} from "@/lib/tenant-storage";
import { useSite } from "@/lib/site-context";
import { Icon } from "@/components/icons";
import { ProviderMark } from "@/components/atoms";
import { DesktopHeader } from "@/components/shell/DesktopHeader";
import { SiteTag } from "@/components/widgets/SiteTag";

const MODE_COPY: Record<WhatsAppSetupMode, { label: string; sub: string; tone: string }> = {
  basic: {
    label: "Basic",
    sub: "QR + click links. Owner replies in WhatsApp Business.",
    tone: "var(--sage)",
  },
  connected: {
    label: "Connected",
    sub: "Cloud API sender owned by the business.",
    tone: "var(--terracotta)",
  },
  managed: {
    label: "Managed",
    sub: "You are helping them register the right number.",
    tone: "var(--amber)",
  },
};

function formatMoney(value: number) {
  return value > 0 ? `£${value.toLocaleString("en-GB")}` : "TBC";
}

function buildWaUrl(phone: string, displayName: string) {
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(
    `Hi ${displayName || "there"}, I'd like to ask about an order or catering.`
  )}`;
}

function accountFromTenant(tenant: StoredTenant | null, firstSiteName?: string): WhatsAppAccount | null {
  if (!tenant?.whatsapp) return null;
  const site = tenant.whatsapp.siteScope === "first_site" ? firstSiteName || "Main site" : "All sites";
  return {
    id: "tenant-wa",
    site,
    mode: tenant.whatsapp.mode,
    status: tenant.whatsapp.mode === "connected" ? "pending" : "active",
    displayName: tenant.whatsapp.displayName,
    displayPhoneNumber: tenant.whatsapp.displayPhoneNumber,
    clickToWhatsAppUrl: tenant.whatsapp.displayPhoneNumber
      ? buildWaUrl(tenant.whatsapp.displayPhoneNumber, tenant.whatsapp.displayName)
      : undefined,
    qrCodeLabel: site === "All sites" ? "All sites WhatsApp QR" : `${site} WhatsApp QR`,
    flow: ["Ask intent", "Capture date + party size", "Quote or confirm", "Request review after order"],
  };
}

export default function WhatsAppPage() {
  const { activeSite, activeSiteName, filterByActiveSite, sites, tenantName } = useSite();
  const [tenant, setTenant] = React.useState<StoredTenant | null>(null);
  const [backendAccounts, setBackendAccounts] = React.useState<WhatsAppAccount[] | null>(null);
  const [mode, setMode] = React.useState<WhatsAppSetupMode>("basic");
  const [displayName, setDisplayName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const sync = () => {
      const next = readTenantFromStorage();
      setTenant(next);
      const wa = next?.whatsapp;
      setMode(wa?.mode ?? "basic");
      setDisplayName(wa?.displayName ?? next?.groupName ?? tenantName);
      setPhone(wa?.displayPhoneNumber ?? next?.primaryPhone ?? "");
    };
    sync();
    window.addEventListener(TENANT_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(TENANT_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [tenantName]);

  const tenantAccount = accountFromTenant(tenant, sites[0]?.name);
  const fixtureAccounts = tenantAccount
    ? [tenantAccount, ...FORGE.whatsappAccounts.filter((account) => account.id !== tenantAccount.id)]
    : FORGE.whatsappAccounts;
  const allAccounts = backendAccounts ?? fixtureAccounts;
  const accounts = allAccounts.filter((account) =>
    !activeSite ? true : account.site === activeSite.name || account.site === "All sites"
  );
  const enquiries = filterByActiveSite(FORGE.whatsappEnquiries);
  const linkPreview = buildWaUrl(phone, displayName);
  const activeAccount = accounts.find((account) =>
    activeSite ? account.site === activeSite.name : account.site === "All sites"
  ) ?? accounts[0];
  const projectedValue = enquiries.reduce((sum, enquiry) => sum + enquiry.value, 0);
  const confirmed = enquiries.filter((enquiry) => enquiry.stage === "confirmed").length;

  const saveLocalSetup = () => {
    const current = readTenantFromStorage();
    if (!current) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1200);
      return;
    }
    writeTenantToStorage({
      ...current,
      whatsapp: {
        mode,
        displayName: displayName.trim() || current.groupName,
        displayPhoneNumber: phone.trim() || undefined,
        siteScope: activeSite ? "first_site" : "all_sites",
      },
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="screen-desktop">
      <DesktopHeader
        eyebrow={`WhatsApp · ${activeSiteName}`}
        title="Booking, order and catering pipeline."
        sub="Each business keeps its own customer-facing number. Agentsy tracks the funnel around it."
        right={
          <button type="button" className="btn btn-terracotta" onClick={saveLocalSetup}>
            <Icon.Check s={15} c="#fff" /> {saved ? "Saved" : "Save setup"}
          </button>
        }
      />
      <div className="desk-content">
        {mounted && isConvexReady() && <BackendWhatsAppBridge onAccounts={setBackendAccounts} />}

        <div className="responsive-grid-3" style={{ marginBottom: 18 }}>
          <MetricCard label="30-day enquiries" value={enquiries.length.toString()} sub={`${activeSiteName} visible`} />
          <MetricCard label="Confirmed orders" value={confirmed.toString()} sub="from WhatsApp leads" />
          <MetricCard label="Tracked value" value={formatMoney(projectedValue)} sub="quoted + confirmed" />
        </div>

        <div className="responsive-2col" style={{ alignItems: "start" }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <ProviderMark name="WhatsApp" size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>Setup mode</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>
                  {MODE_COPY[mode].sub}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
              {(Object.keys(MODE_COPY) as WhatsAppSetupMode[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`radio-card${mode === id ? " selected" : ""}`}
                  onClick={() => setMode(id)}
                  aria-pressed={mode === id}
                  style={{ textAlign: "left" }}
                >
                  <div className="ring" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{MODE_COPY[id].label}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{MODE_COPY[id].sub}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label className="field" htmlFor="wa-name">
                <span>Display name</span>
                <input
                  id="wa-name"
                  className="input"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder={tenantName}
                />
              </label>
              <label className="field" htmlFor="wa-phone">
                <span>Business WhatsApp number</span>
                <input
                  id="wa-phone"
                  className="input"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+44 7700 900123"
                />
              </label>
            </div>

            <div
              style={{
                marginTop: 14,
                padding: 12,
                background: "var(--paper-2)",
                borderRadius: 8,
                border: "1px solid var(--rule)",
                fontSize: 12,
                color: "var(--ink-2)",
                wordBreak: "break-word",
                lineHeight: 1.5,
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                Click link
              </div>
              {linkPreview || "Add a number to create the click-to-WhatsApp link."}
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              30-day pilot
            </div>
            {[
              ["QR + links live", activeAccount?.qrCodeLabel ?? "Business WhatsApp QR", "sage"],
              ["Weekly offer", activeSite ? `${activeSite.name} catering platter` : "Office lunch trays", "amber"],
              ["Review request", "Sent after confirmed order", "sage"],
              ["Sheet export", "Every enquiry has source + value", "sage"],
            ].map(([title, sub, tone]) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: title === "Sheet export" ? "none" : "1px solid var(--rule)",
                }}
              >
                <span className={`dot dot-${tone}`} style={{ marginTop: 6 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: 18, overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid var(--rule)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div className="eyebrow">Sender accounts</div>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
              {accounts.length} visible
            </span>
          </div>
          {accounts.map((account) => (
            <div
              key={account.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr 1fr 1.4fr",
                gap: 12,
                padding: "14px 18px",
                borderBottom: "1px solid var(--rule)",
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{account.displayName}</span>
                  <SiteTag site={account.site} subtle />
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                  {account.displayPhoneNumber ?? "Number pending"}
                </div>
              </div>
              <div>
                <span className="chip" style={{ color: MODE_COPY[account.mode].tone }}>
                  {MODE_COPY[account.mode].label}
                </span>
              </div>
              <div>
                <span className={account.status === "active" ? "chip chip-sage" : "chip chip-amber"}>
                  {account.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {account.flow.join(" · ")}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: 18, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--rule)" }}>
            <div className="eyebrow">Enquiry tracker</div>
          </div>
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr 0.8fr 0.8fr 1.5fr",
                gap: 12,
                padding: "14px 18px",
                borderBottom: "1px solid var(--rule)",
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{enquiry.customer}</span>
                  <SiteTag site={enquiry.site} subtle />
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                  {enquiry.source} · {enquiry.age}
                </div>
              </div>
              <div style={{ fontSize: 13 }}>{enquiry.need}</div>
              <div>
                <span className={enquiry.stage === "confirmed" ? "chip chip-sage" : "chip"}>
                  {enquiry.stage.replace("_", " ")}
                </span>
              </div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{formatMoney(enquiry.value)}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.45 }}>
                {enquiry.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 34, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function BackendWhatsAppBridge({
  onAccounts,
}: {
  onAccounts: (accounts: WhatsAppAccount[] | null) => void;
}) {
  const result = useQuery(api.whatsappAccounts.listCurrent);

  React.useEffect(() => {
    if (result === undefined) return;
    if (!result) {
      onAccounts(null);
      return;
    }
    const siteById = new Map(result.sites.map((site) => [site._id, site.name]));
    const accounts = result.accounts.map((account) => ({
      id: account._id,
      site: account.siteId ? siteById.get(account.siteId) ?? "Unknown site" : "All sites",
      mode: account.mode as WhatsAppSetupMode,
      status: account.status as WhatsAppAccount["status"],
      displayName: account.displayName,
      displayPhoneNumber: account.displayPhoneNumber,
      clickToWhatsAppUrl: account.clickToWhatsAppUrl,
      qrCodeLabel: account.qrCodeLabel ?? "WhatsApp QR",
      flow: (() => {
        try {
          const parsed = JSON.parse(account.defaultFlow) as { qualification?: string[] };
          return parsed.qualification ?? ["Ask intent", "Quote", "Review request"];
        } catch {
          return ["Ask intent", "Quote", "Review request"];
        }
      })(),
    }));
    onAccounts(accounts.length > 0 ? accounts : null);
  }, [result, onAccounts]);

  return null;
}
