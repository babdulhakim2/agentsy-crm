"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Icon } from "@/components/icons";
import { DesktopHeader } from "@/components/shell/DesktopHeader";
import { AddBranchSheet, type BranchPayload } from "@/components/widgets/AddBranchSheet";
import { useSite } from "@/lib/site-context";
import { isConvexReady } from "@/lib/convex";
import type { Site } from "@/lib/types";

export default function SitesPage() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (mounted && isConvexReady()) return <BackendSitesPage />;
  return <SitesPageContent mode="local" />;
}

function BackendSitesPage() {
  const current = useQuery(api.users.current);
  const createSite = useMutation(api.sites.createForCurrentUser);
  const updateDetails = useMutation(api.sites.updateDetails);
  const removeBackendSite = useMutation(api.sites.remove);
  const tenant = current?.tenants.find((row) => row.group);
  const groupId = tenant?.group?._id;

  return (
    <SitesPageContent
      mode="backend"
      onCreate={
        groupId
          ? (site) =>
              createSite({
                groupId,
                name: site.name,
                phone: site.phone,
                address: site.address,
                visitRewardVisits: 3,
                visitRewardLabel: "20% off",
              })
          : undefined
      }
      onUpdate={(site, patch) =>
        updateDetails({
          siteId: site.id as Id<"sites">,
          name: patch.name,
          phone: patch.phone,
          address: patch.address,
          visitRewardVisits: site.visitRewardVisits,
          visitRewardLabel: site.visitRewardLabel,
        })
      }
      onDelete={(site) => removeBackendSite({ siteId: site.id as Id<"sites"> })}
    />
  );
}

function SitesPageContent({
  mode,
  onCreate,
  onUpdate,
  onDelete,
}: {
  mode: "local" | "backend";
  onCreate?: (site: BranchPayload) => Promise<unknown>;
  onUpdate?: (site: Site, patch: { name: string; address?: string; phone?: string }) => Promise<unknown>;
  onDelete?: (site: Site) => Promise<unknown>;
}) {
  const { sites: allSites, addSite, updateSite, removeSite } = useSite();
  const [addOpen, setAddOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Site | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleAdd = async (b: BranchPayload) => {
    setError(null);
    try {
      if (onCreate) await onCreate(b);
      if (mode === "local" || !onCreate) addSite({ name: b.name, phone: b.phone, address: b.address });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add site.");
    }
  };
  const handleEdit = async (site: Site, patch: { name: string; address?: string; phone?: string }) => {
    setError(null);
    try {
      if (onUpdate) await onUpdate(site, patch);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save site.");
      return;
    }
    updateSite(site.id, patch);
  };
  const handleDelete = async (site: Site) => {
    setError(null);
    if (deletingId !== site.id) {
      setDeletingId(site.id);
      return;
    }
    try {
      if (onDelete) await onDelete(site);
      removeSite(site.id);
      setDeletingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete site.");
    }
  };
  const visibleSites = allSites;

  return (
    <div className="screen-desktop">
      <DesktopHeader
        eyebrow="Sites"
        title="Restaurant sites."
        sub="All branches for this restaurant. Site context elsewhere can still focus the CRM on one branch."
        right={
          <button type="button" className="btn btn-terracotta" onClick={() => setAddOpen(true)}>
            <Icon.Plus s={16} c="#fff" /> Add a branch
          </button>
        }
      />
      <div className="desk-content">
        {error && (
          <div role="alert" className="chip chip-crimson" style={{ marginBottom: 14, whiteSpace: "normal" }}>
            {error}
          </div>
        )}
        <div className="responsive-grid-3" style={{ marginBottom: 22 }}>
          {visibleSites.map((s) => (
            <div key={s.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon.Building s={18} c="var(--ink-3)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 17 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                    {s.address || "No address saved"}
                  </div>
                  {s.phone && (
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                      {s.phone}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn-soft"
                    onClick={() => setEditing(s)}
                    style={{ padding: "7px 10px", borderRadius: 8, fontSize: 12, display: "inline-flex", gap: 6, alignItems: "center" }}
                  >
                    <Icon.Edit s={13} /> Edit
                  </button>
                  <button
                    type="button"
                    className={deletingId === s.id ? "btn btn-terracotta" : "icon-btn"}
                    onClick={() => handleDelete(s)}
                    style={{ width: deletingId === s.id ? "auto" : 32, height: 32, padding: deletingId === s.id ? "7px 10px" : 0, fontSize: 12 }}
                    aria-label={deletingId === s.id ? `Confirm delete ${s.name}` : `Delete ${s.name}`}
                  >
                    {deletingId === s.id ? "Confirm" : <Icon.Trash s={14} />}
                  </button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginTop: 14 }}>
                <div style={{ padding: 10, borderRadius: 8, background: "var(--paper-2)" }}>
                  <div style={{ fontSize: 18, lineHeight: 1, fontFamily: "var(--serif)" }}>{s.covers}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>covers today</div>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: "var(--sage-tint)" }}>
                  <div style={{ fontSize: 18, lineHeight: 1, fontFamily: "var(--serif)", color: "var(--sage)" }}>
                    {s.visitRewardVisits ?? 3} visits
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>
                    unlock {s.visitRewardLabel ?? "20% off"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddBranchSheet open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      <SiteSettingsSheet
        site={editing}
        onClose={() => setEditing(null)}
        onSave={(patch) => {
          if (editing) void handleEdit(editing, patch);
          setEditing(null);
        }}
      />
    </div>
  );
}

function SiteSettingsSheet({
  site,
  onClose,
  onSave,
}: {
  site: Site | null;
  onClose: () => void;
  onSave: (patch: { name: string; address?: string; phone?: string }) => void;
}) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setName(site?.name ?? "");
    setPhone(site?.phone ?? "");
    setAddress(site?.address ?? "");
    setError(null);
  }, [site]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Site name is required.");
      return;
    }
    onSave({ name: name.trim(), phone: phone.trim() || undefined, address: address.trim() || undefined });
  };

  if (!site) return null;

  return (
    <div
      className="sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-settings-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form className="sheet" onSubmit={submit}>
        <div className="sheet-handle" aria-hidden />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Site settings</div>
            <h2
              id="site-settings-title"
              style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.15, margin: 0, fontWeight: 400 }}
            >
              Edit {site.name}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
            <Icon.X s={18} />
          </button>
        </div>

        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="site-edit-name">Site name</label>
          <input
            id="site-edit-name"
            className="big-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="site-edit-phone">Site phone</label>
          <input
            id="site-edit-phone"
            className="input"
            placeholder="+44 20 7946 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
          />
        </div>
        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="site-edit-address">Address</label>
          <input
            id="site-edit-address"
            className="input"
            placeholder="Street, city, postcode"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {error && (
          <div role="alert" style={{ fontSize: 13, color: "var(--crimson)", background: "var(--crimson-tint)", padding: "10px 12px", borderRadius: 10, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-terracotta" style={{ width: "100%", padding: "14px", fontSize: 15 }}>
          <Icon.Check s={14} c="#fff" /> Save site
        </button>
      </form>
    </div>
  );
}
