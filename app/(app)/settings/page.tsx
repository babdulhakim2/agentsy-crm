"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Icon } from "@/components/icons";
import { DesktopHeader } from "@/components/shell/DesktopHeader";
import { useSite } from "@/lib/site-context";
import { isConvexReady } from "@/lib/convex";
import { readTenantFromStorage, writeTenantToStorage, type StoredTenant } from "@/lib/tenant-storage";

export default function SettingsPage() {
  const { sites, activeSite, activeSiteName, tenantName, logoUrl } = useSite();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="screen-desktop">
      <DesktopHeader
        eyebrow="Settings"
        title="Account settings."
        sub={`${sites.length} site${sites.length === 1 ? "" : "s"} in this workspace.`}
      />
      <div className="desk-content">
        {mounted && isConvexReady() ? (
          <BrandingSettingsCard tenantName={tenantName} logoUrl={logoUrl} />
        ) : (
          <LocalBrandingSettingsCard tenantName={tenantName} logoUrl={logoUrl} />
        )}

        <section style={{ marginBottom: 14 }}>
          <div style={{ margin: "4px 0 12px" }}>
            <div className="eyebrow" style={{ marginBottom: 7 }}>
              Customer loyalty
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.12 }}>
              QR codes for loyalty visits and new leads.
            </div>
            <div style={{ fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.45, marginTop: 6, maxWidth: 620 }}>
              Put the visit QR at the counter. Use the lead QR on flyers, delivery bags and outreach so new customers enter the CRM before their first visit.
            </div>
          </div>
          {mounted && isConvexReady() ? (
            <>
              <VisitQrCard
                activeSiteId={activeSite?.id}
                activeSiteName={activeSiteName}
                restaurantName={tenantName}
                logoUrl={logoUrl}
              />
              <LeadQrCard
                activeSiteId={activeSite?.id}
                activeSiteName={activeSiteName}
                restaurantName={tenantName}
                logoUrl={logoUrl}
              />
            </>
          ) : (
            <>
              <LocalVisitQrCard activeSiteName={activeSiteName} restaurantName={tenantName} logoUrl={logoUrl} />
              <LocalLeadQrCard activeSiteName={activeSiteName} restaurantName={tenantName} logoUrl={logoUrl} />
            </>
          )}
        </section>

        <div className="card" style={{ padding: 22, marginBottom: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Notifications
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              ["Daily morning brief", "WhatsApp + email · 08:30", true],
              ["Negative review (≤3★)", "WhatsApp · within 5 minutes", true],
              ["Campaign approvals", "Email digest · daily", false],
            ].map(([k, v, on]) => (
              <div
                key={k as string}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--rule)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{v}</div>
                </div>
                <button
                  type="button"
                  className={"toggle" + (on ? " on" : "")}
                  aria-label={`Toggle ${k}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Security
          </div>
          <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
            Magic-link sign-in. Two-factor on the way in Phase 2. SOC 2 Type 1 audit in progress.
          </div>
        </div>
      </div>
    </div>
  );
}

function LocalBrandingSettingsCard({
  tenantName,
  logoUrl,
}: {
  tenantName: string;
  logoUrl?: string;
}) {
  const [name, setName] = React.useState(tenantName);
  const [logoPreview, setLogoPreview] = React.useState(logoUrl ?? "");
  const [logoFileName, setLogoFileName] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setName(tenantName);
    setLogoPreview(logoUrl ?? "");
    setLogoFileName(null);
  }, [tenantName, logoUrl]);

  const handleLogoFile = (file: File | null) => {
    if (!file) return;
    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const onSave = (event: React.FormEvent) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setMessage("Restaurant name is required.");
      return;
    }
    const stored = readTenantFromStorage();
    if (stored) {
      writeTenantToStorage({
        ...stored,
        groupName: nextName,
        logoUrl: logoPreview || undefined,
      });
    }
    setMessage("Saved on this device.");
    setTimeout(() => setMessage(null), 1400);
  };

  return (
    <BrandingSettingsForm
      name={name}
      logoPreview={logoPreview}
      saving={false}
      message={message}
      logoFileName={logoFileName}
      onNameChange={setName}
      onLogoFileChange={handleLogoFile}
      onSubmit={onSave}
    />
  );
}

function BrandingSettingsCard({
  tenantName,
  logoUrl,
}: {
  tenantName: string;
  logoUrl?: string;
}) {
  const current = useQuery(api.users.current);
  const updateBranding = useMutation(api.groups.updateBranding);
  const generateLogoUploadUrl = useMutation(api.groups.generateLogoUploadUrl);
  const tenant = current?.tenants.find((row) => row.group);
  const groupId = tenant?.group?._id;
  const [name, setName] = React.useState(tenantName);
  const [logoPreview, setLogoPreview] = React.useState(logoUrl ?? "");
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoFileName, setLogoFileName] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setName(tenantName);
    setLogoPreview(logoUrl ?? "");
    setLogoFile(null);
    setLogoFileName(null);
  }, [tenantName, logoUrl]);

  const handleLogoFile = (file: File | null) => {
    setLogoFile(file);
    if (!file) return;
    setLogoFileName(file.name);
    setLogoPreview(URL.createObjectURL(file));
  };

  const saveLocal = React.useCallback((nextName: string, nextLogo?: string) => {
    const stored = readTenantFromStorage();
    if (!stored) return;
    const nextTenant: StoredTenant = {
      ...stored,
      groupName: nextName,
      logoUrl: nextLogo,
    };
    writeTenantToStorage(nextTenant);
  }, []);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setMessage("Restaurant name is required.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      let storedLogoUrl = logoPreview || undefined;
      if (groupId && isConvexReady()) {
        let logoStorageId: Id<"_storage"> | undefined;
        if (logoFile) {
          const uploadUrl = await generateLogoUploadUrl({ groupId });
          const upload = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": logoFile.type || "application/octet-stream" },
            body: logoFile,
          });
          if (!upload.ok) throw new Error("Could not upload logo.");
          const uploaded = (await upload.json()) as { storageId: string };
          logoStorageId = uploaded.storageId as Id<"_storage">;
        }
        const payload: { groupId: Id<"groups">; name: string; logoStorageId?: Id<"_storage"> } = {
          groupId,
          name: nextName,
        };
        if (logoStorageId) payload.logoStorageId = logoStorageId;
        const updated = await updateBranding(payload);
        storedLogoUrl = updated.logoUrl ?? storedLogoUrl;
        if (storedLogoUrl) setLogoPreview(storedLogoUrl);
      }
      saveLocal(nextName, storedLogoUrl);
      setMessage("Saved.");
      setTimeout(() => setMessage(null), 1400);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save branding.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BrandingSettingsForm
      name={name}
      logoPreview={logoPreview}
      saving={saving}
      message={message}
      logoFileName={logoFileName}
      onNameChange={setName}
      onLogoFileChange={handleLogoFile}
      onSubmit={onSave}
    />
  );
}

function BrandingSettingsForm({
  name,
  logoPreview,
  saving,
  message,
  logoFileName,
  onNameChange,
  onLogoFileChange,
  onSubmit,
}: {
  name: string;
  logoPreview?: string;
  saving: boolean;
  message: string | null;
  logoFileName?: string | null;
  onNameChange: (value: string) => void;
  onLogoFileChange: (file: File | null) => void;
  onSubmit: (event: React.FormEvent) => void | Promise<void>;
}) {
  const fileInputId = "brand-logo-upload";
  return (
    <form className="card" style={{ padding: 22, marginBottom: 14 }} onSubmit={onSubmit}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 7 }}>
            Restaurant brand
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 23, lineHeight: 1.12 }}>
            How customers see this restaurant.
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "132px minmax(0, 1fr)", gap: 18, alignItems: "stretch" }}>
        <label
          htmlFor={fileInputId}
          style={{
            minHeight: 132,
            borderRadius: 14,
            border: "1px solid var(--rule)",
            background: "var(--paper-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 12,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <BrandPreview name={name || "Restaurant"} logoUrl={logoPreview} size={92} />
          <span
            style={{
              position: "absolute",
              right: 10,
              bottom: 10,
              width: 30,
              height: 30,
              borderRadius: 999,
              background: "var(--ink)",
              color: "var(--paper)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 18px rgba(26,22,18,0.18)",
            }}
            aria-hidden
          >
            <Icon.Upload s={14} />
          </span>
        </label>
        <div style={{ display: "grid", gap: 10 }}>
          <div className="field">
            <label htmlFor="brand-name">Restaurant name</label>
            <input
              id="brand-name"
              className="input"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="New Wok's Cooking"
            />
          </div>
          <div>
            <input
              id={fileInputId}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(event) => onLogoFileChange(event.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
            <label
              htmlFor={fileInputId}
              className="btn btn-ghost"
              style={{ justifyContent: "flex-start", width: "100%", padding: "12px 13px", cursor: "pointer" }}
            >
              <Icon.Upload s={15} /> {logoPreview ? "Replace logo" : "Upload logo"}
            </label>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 7, lineHeight: 1.4 }}>
              {logoFileName || "PNG, JPG, WebP or SVG. Square images look best."}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginTop: 14 }}>
        <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.35 }}>
          Used in the sidebar, QR code and customer visit page.
        </div>
        <button type="submit" className="btn btn-terracotta" disabled={saving} style={{ padding: "9px 13px" }}>
          {saving ? "Saving..." : "Save brand"}
        </button>
      </div>
      {message && (
        <div className="chip" style={{ marginTop: 10, whiteSpace: "normal" }}>
          {message}
        </div>
      )}
    </form>
  );
}

function BrandPreview({ name, logoUrl, size = 64 }: { name: string; logoUrl?: string; size?: number }) {
  const [failed, setFailed] = React.useState(false);
  const letter = name.replace(/^the\s+/i, "").charAt(0).toUpperCase() || "R";
  React.useEffect(() => setFailed(false), [logoUrl]);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(14, size * 0.18),
        background: "var(--terracotta)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "var(--serif)",
        fontSize: size * 0.46,
        boxShadow: "0 8px 24px rgba(26,22,18,0.10)",
      }}
    >
      {logoUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        letter
      )}
    </div>
  );
}

function VisitQrCard({
  activeSiteId,
  activeSiteName,
  restaurantName,
  logoUrl,
}: {
  activeSiteId?: string;
  activeSiteName: string;
  restaurantName: string;
  logoUrl?: string;
}) {
  const current = useQuery(api.users.current);
  const updateVisitReward = useMutation(api.sites.updateVisitReward);
  const [origin, setOrigin] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [rewardMessage, setRewardMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const tenant = current?.tenants.find((row) => row.group);
  const groupId = tenant?.group?._id;
  const site =
    tenant?.sites.find((item) => item._id === activeSiteId) ??
    tenant?.sites[0];
  const siteName = site?.name ?? (activeSiteName === "All sites" ? "Main site" : activeSiteName);
  const visitsRequired = site?.visitRewardVisits ?? 3;
  const rewardLabel = site?.visitRewardLabel ?? "20% off";
  const visitUrl =
    origin && groupId && site?._id
      ? `${origin}/visit?groupId=${encodeURIComponent(groupId)}&siteId=${encodeURIComponent(site._id)}&site=${encodeURIComponent(siteName)}`
      : `${origin || ""}/visit?site=${encodeURIComponent(siteName)}`;

  return (
    <QrCard
      title="Visit and review QR"
      restaurantName={tenant?.group?.name ?? restaurantName}
      logoUrl={tenant?.group?.logoUrl ?? logoUrl}
      siteName={siteName}
      visitUrl={visitUrl}
      visitsRequired={visitsRequired}
      rewardLabel={rewardLabel}
      rewardMessage={rewardMessage}
      copied={copied}
      onCopy={async () => {
        await navigator.clipboard.writeText(visitUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      onSaveReward={async (next) => {
        if (!site?._id) {
          setRewardMessage("Choose a saved site first.");
          return;
        }
        setRewardMessage(null);
        await updateVisitReward({
          siteId: site._id,
          visitsRequired: next.visitsRequired,
          rewardLabel: next.rewardLabel,
        });
        setRewardMessage("QR reward saved.");
        setTimeout(() => setRewardMessage(null), 1400);
      }}
      mode={groupId && site?._id ? "Logs to customer visit history" : "Demo link until setup finishes"}
    />
  );
}

function LocalVisitQrCard({
  activeSiteName,
  restaurantName,
  logoUrl,
}: {
  activeSiteName: string;
  restaurantName: string;
  logoUrl?: string;
}) {
  const [origin, setOrigin] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const siteName = activeSiteName === "All sites" ? "Main site" : activeSiteName;
  const [visitsRequired, setVisitsRequired] = React.useState(3);
  const [rewardLabel, setRewardLabel] = React.useState("20% off");
  const [rewardMessage, setRewardMessage] = React.useState<string | null>(null);
  const visitUrl = `${origin || ""}/visit?site=${encodeURIComponent(siteName)}`;

  return (
    <QrCard
      title="Visit and review QR"
      restaurantName={restaurantName}
      logoUrl={logoUrl}
      siteName={siteName}
      visitUrl={visitUrl}
      visitsRequired={visitsRequired}
      rewardLabel={rewardLabel}
      rewardMessage={rewardMessage}
      copied={copied}
      onCopy={async () => {
        await navigator.clipboard.writeText(visitUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      onSaveReward={async (next) => {
        setVisitsRequired(next.visitsRequired);
        setRewardLabel(next.rewardLabel);
        setRewardMessage("Saved for this preview.");
        setTimeout(() => setRewardMessage(null), 1400);
      }}
      mode="Demo link until Convex is configured"
    />
  );
}

function LeadQrCard({
  activeSiteId,
  activeSiteName,
  restaurantName,
  logoUrl,
}: {
  activeSiteId?: string;
  activeSiteName: string;
  restaurantName: string;
  logoUrl?: string;
}) {
  const current = useQuery(api.users.current);
  const [origin, setOrigin] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const tenant = current?.tenants.find((row) => row.group);
  const groupId = tenant?.group?._id;
  const site =
    tenant?.sites.find((item) => item._id === activeSiteId) ??
    tenant?.sites[0];
  const siteName = site?.name ?? (activeSiteName === "All sites" ? "Main site" : activeSiteName);
  const leadUrl =
    origin && groupId && site?._id
      ? `${origin}/lead?groupId=${encodeURIComponent(groupId)}&siteId=${encodeURIComponent(site._id)}&site=${encodeURIComponent(siteName)}`
      : `${origin || ""}/lead?site=${encodeURIComponent(siteName)}`;

  return (
    <LeadQrDisplayCard
      restaurantName={tenant?.group?.name ?? restaurantName}
      logoUrl={tenant?.group?.logoUrl ?? logoUrl}
      siteName={siteName}
      leadUrl={leadUrl}
      copied={copied}
      mode={groupId && site?._id ? "Creates CRM leads" : "Demo link until setup finishes"}
      onCopy={async () => {
        await navigator.clipboard.writeText(leadUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
    />
  );
}

function LocalLeadQrCard({
  activeSiteName,
  restaurantName,
  logoUrl,
}: {
  activeSiteName: string;
  restaurantName: string;
  logoUrl?: string;
}) {
  const [origin, setOrigin] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const siteName = activeSiteName === "All sites" ? "Main site" : activeSiteName;
  const leadUrl = `${origin || ""}/lead?site=${encodeURIComponent(siteName)}`;

  return (
    <LeadQrDisplayCard
      restaurantName={restaurantName}
      logoUrl={logoUrl}
      siteName={siteName}
      leadUrl={leadUrl}
      copied={copied}
      mode="Demo link until Convex is configured"
      onCopy={async () => {
        await navigator.clipboard.writeText(leadUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
    />
  );
}

function printQrCard(key: "visit" | "lead") {
  const target = document.querySelector<HTMLElement>(`.qr-print-card[data-print-key="${key}"]`);
  if (!target) {
    window.print();
    return;
  }

  document.querySelector(".qr-print-root")?.remove();
  const printRoot = document.createElement("div");
  printRoot.className = "qr-print-root";
  printRoot.dataset.printKey = key;
  printRoot.appendChild(target.cloneNode(true));
  document.body.appendChild(printRoot);
  document.body.dataset.printQr = key;
  document.body.classList.add("qr-printing");

  let clearFallback = 0;
  const clearPrintTarget = () => {
    if (document.body.dataset.printQr === key) delete document.body.dataset.printQr;
    document.body.classList.remove("qr-printing");
    printRoot.remove();
    window.removeEventListener("afterprint", clearPrintTarget);
    window.clearTimeout(clearFallback);
  };
  window.addEventListener("afterprint", clearPrintTarget, { once: true });
  clearFallback = window.setTimeout(clearPrintTarget, 60_000);
  waitForPrintImages(printRoot).finally(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.print());
    });
  });
}

function waitForPrintImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  if (images.length === 0) return Promise.resolve();
  const loaded = Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete && image.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          if (typeof image.decode === "function") {
            image.decode().then(done).catch(done);
          }
        })
    )
  ).then(() => undefined);
  return Promise.race([
    loaded,
    new Promise<void>((resolve) => window.setTimeout(resolve, 3500)),
  ]);
}

function QrCard({
  title,
  restaurantName,
  logoUrl,
  siteName,
  visitUrl,
  visitsRequired,
  rewardLabel,
  rewardMessage,
  copied,
  onCopy,
  onSaveReward,
  mode,
}: {
  title: string;
  restaurantName: string;
  logoUrl?: string;
  siteName: string;
  visitUrl: string;
  visitsRequired: number;
  rewardLabel: string;
  rewardMessage: string | null;
  copied: boolean;
  onCopy: () => void | Promise<void>;
  onSaveReward: (next: { visitsRequired: number; rewardLabel: string }) => void | Promise<void>;
  mode: string;
}) {
  const [visitsDraft, setVisitsDraft] = React.useState(String(visitsRequired));
  const [rewardDraft, setRewardDraft] = React.useState(rewardLabel);
  const [savingReward, setSavingReward] = React.useState(false);
  const [editingReward, setEditingReward] = React.useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=12&data=${encodeURIComponent(visitUrl)}`;

  React.useEffect(() => {
    setVisitsDraft(String(visitsRequired));
    setRewardDraft(rewardLabel);
  }, [visitsRequired, rewardLabel]);

  const saveReward = async () => {
    const nextVisits = Math.max(1, Math.min(20, Math.round(Number(visitsDraft) || 3)));
    const nextReward = rewardDraft.trim() || "20% off";
    setSavingReward(true);
    try {
      await onSaveReward({ visitsRequired: nextVisits, rewardLabel: nextReward });
      setEditingReward(false);
    } finally {
      setSavingReward(false);
    }
  };

  return (
    <div className="card qr-print-card" data-print-key="visit" style={{ padding: 22, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <div
          style={{
            width: 202,
            height: 202,
            borderRadius: 12,
            background: "#fff",
            border: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 10,
          }}
        >
          {visitUrl ? (
            <img src={qrUrl} alt={`${siteName} visit QR code`} width={180} height={180} />
          ) : (
            <div className="serif-i" style={{ color: "var(--ink-3)" }}>QR loading</div>
          )}
        </div>
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <div className="eyebrow qr-print-hide" style={{ marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <BrandPreview name={restaurantName} logoUrl={logoUrl} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{restaurantName}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{siteName}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 26, lineHeight: 1.1 }}>
              {visitsRequired} visits unlock {rewardLabel}.
            </div>
            <button
              type="button"
              className="icon-btn qr-print-hide"
              onClick={() => setEditingReward((value) => !value)}
              aria-label="Edit QR reward"
              style={{ width: 30, height: 30, flexShrink: 0 }}
            >
              <Icon.Edit s={14} />
            </button>
          </div>
          <div className="qr-print-hide" style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 8 }}>
            Put this at the counter. Customers scan it after a visit, leave quick feedback, and the visit is logged on their customer profile.
          </div>
          <div className="qr-print-hide" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <span className="chip">{siteName}</span>
            <span className="chip chip-sage">{mode}</span>
          </div>
          <div className="qr-print-hide" style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a className="btn btn-ghost" href={visitUrl} target="_blank" rel="noreferrer" style={{ padding: "9px 12px", fontSize: 13 }}>
              Open form
            </a>
            <button type="button" className="btn btn-terracotta" onClick={onCopy} style={{ padding: "9px 12px", fontSize: 13 }}>
              {copied ? "Copied" : "Copy link"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => printQrCard("visit")} style={{ padding: "9px 12px", fontSize: 13 }}>
              Print QR
            </button>
          </div>
        </div>
      </div>
      {editingReward && (
        <div
          className="qr-print-hide"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 8,
            alignItems: "end",
            marginTop: 14,
            padding: 12,
            borderRadius: 10,
            background: "var(--paper-2)",
          }}
        >
          <div className="field">
            <label htmlFor={`reward-visits-${siteName}`}>Visits</label>
            <input
              id={`reward-visits-${siteName}`}
              className="input"
              type="number"
              min={1}
              max={20}
              value={visitsDraft}
              onChange={(event) => setVisitsDraft(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor={`reward-label-${siteName}`}>Reward</label>
            <input
              id={`reward-label-${siteName}`}
              className="input"
              value={rewardDraft}
              onChange={(event) => setRewardDraft(event.target.value)}
              placeholder="20% off"
            />
          </div>
          <button type="button" className="btn btn-terracotta" onClick={saveReward} disabled={savingReward} style={{ padding: "10px 13px" }}>
            {savingReward ? "Saving..." : "Save"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setEditingReward(false)} style={{ padding: "10px 13px" }}>
            Cancel
          </button>
        </div>
      )}
      {rewardMessage && (
        <div className="chip qr-print-hide" style={{ marginTop: 10, whiteSpace: "normal" }}>
          {rewardMessage}
        </div>
      )}
    </div>
  );
}

function LeadQrDisplayCard({
  restaurantName,
  logoUrl,
  siteName,
  leadUrl,
  copied,
  onCopy,
  mode,
}: {
  restaurantName: string;
  logoUrl?: string;
  siteName: string;
  leadUrl: string;
  copied: boolean;
  onCopy: () => void | Promise<void>;
  mode: string;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=12&data=${encodeURIComponent(leadUrl)}`;

  return (
    <div className="card qr-print-card" data-print-key="lead" style={{ padding: 18, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div
          style={{
            width: 178,
            height: 178,
            borderRadius: 12,
            background: "#fff",
            border: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 9,
          }}
        >
          {leadUrl ? (
            <img src={qrUrl} alt={`${siteName} lead QR code`} width={160} height={160} />
          ) : (
            <div className="serif-i" style={{ color: "var(--ink-3)" }}>QR loading</div>
          )}
        </div>
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <div className="eyebrow qr-print-hide" style={{ marginBottom: 8 }}>
            Lead capture QR
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <BrandPreview name={restaurantName} logoUrl={logoUrl} size={54} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{restaurantName}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{siteName}</div>
            </div>
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.12 }}>
            Join our customer loyalty list.
          </div>
          <div className="qr-print-hide" style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 8 }}>
            Use this on delivery bags, flyers and cold outreach. It captures name, WhatsApp, optional delivery address and where the lead came from.
          </div>
          <div className="qr-print-only" style={{ fontSize: 18, color: "var(--ink)", lineHeight: 1.45, marginTop: 10, fontFamily: "var(--serif)" }}>
            Scan to get personal offers, delivery updates and birthday treats.
          </div>
          <div className="qr-print-hide" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <span className="chip">{siteName}</span>
            <span className="chip">{mode}</span>
          </div>
          <div className="qr-print-hide" style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a className="btn btn-ghost" href={leadUrl} target="_blank" rel="noreferrer" style={{ padding: "9px 12px", fontSize: 13 }}>
              Open form
            </a>
            <button type="button" className="btn btn-terracotta" onClick={onCopy} style={{ padding: "9px 12px", fontSize: 13 }}>
              {copied ? "Copied" : "Copy link"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => printQrCard("lead")} style={{ padding: "9px 12px", fontSize: 13 }}>
              Print QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
