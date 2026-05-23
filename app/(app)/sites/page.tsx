"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { DesktopHeader } from "@/components/shell/DesktopHeader";
import { AddBranchSheet, type BranchPayload } from "@/components/widgets/AddBranchSheet";
import { useSite } from "@/lib/site-context";
import type { Site } from "@/lib/types";

export default function SitesPage() {
  const { sites: allSites, activeSite, isAllSites, activeSiteName, addSite, updateSite } = useSite();
  const [addOpen, setAddOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Site | null>(null);

  const handleAdd = (b: BranchPayload) => {
    addSite({ name: b.name, address: b.address });
  };
  const handleEdit = (site: Site, patch: { name: string; address?: string }) => {
    updateSite(site.id, patch);
  };
  const visibleSites = isAllSites ? allSites : activeSite ? [activeSite] : allSites;

  return (
    <div className="screen-desktop">
      <DesktopHeader
        eyebrow="Sites"
        title="Restaurant sites."
        sub={`${activeSiteName}. Keep branch names and addresses clean.`}
        right={
          <button type="button" className="btn btn-terracotta" onClick={() => setAddOpen(true)}>
            <Icon.Plus s={16} c="#fff" /> Add a branch
          </button>
        }
      />
      <div className="desk-content">
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
                </div>
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => setEditing(s)}
                  style={{ padding: "7px 10px", borderRadius: 8, fontSize: 12, display: "inline-flex", gap: 6, alignItems: "center" }}
                >
                  <Icon.Edit s={13} /> Edit
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginTop: 14 }}>
                <div style={{ padding: 10, borderRadius: 8, background: "var(--paper-2)" }}>
                  <div style={{ fontSize: 18, lineHeight: 1, fontFamily: "var(--serif)" }}>{s.covers}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>covers today</div>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: "var(--sage-tint)" }}>
                  <div style={{ fontSize: 18, lineHeight: 1, fontFamily: "var(--serif)", color: "var(--sage)" }}>Open</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>site status</div>
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
          if (editing) handleEdit(editing, patch);
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
  onSave: (patch: { name: string; address?: string }) => void;
}) {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setName(site?.name ?? "");
    setAddress(site?.address ?? "");
    setError(null);
  }, [site]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Site name is required.");
      return;
    }
    onSave({ name: name.trim(), address: address.trim() || undefined });
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
