"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DesktopHeader } from "@/components/shell/DesktopHeader";
import { useSite } from "@/lib/site-context";
import { isConvexReady } from "@/lib/convex";

export default function SettingsPage() {
  const { sites, activeSite, activeSiteName } = useSite();
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
          <VisitQrCard activeSiteId={activeSite?.id} activeSiteName={activeSiteName} />
        ) : (
          <LocalVisitQrCard activeSiteName={activeSiteName} />
        )}

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

function VisitQrCard({
  activeSiteId,
  activeSiteName,
}: {
  activeSiteId?: string;
  activeSiteName: string;
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
  const visitUrl =
    origin && groupId && site?._id
      ? `${origin}/visit?groupId=${encodeURIComponent(groupId)}&siteId=${encodeURIComponent(site._id)}&site=${encodeURIComponent(siteName)}`
      : `${origin || ""}/visit?site=${encodeURIComponent(siteName)}`;

  return (
    <QrCard
      title="Visit and review QR"
      siteName={siteName}
      visitUrl={visitUrl}
      copied={copied}
      onCopy={async () => {
        await navigator.clipboard.writeText(visitUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      mode={groupId && site?._id ? "Logs to customer visit history" : "Demo link until setup finishes"}
    />
  );
}

function LocalVisitQrCard({ activeSiteName }: { activeSiteName: string }) {
  const [origin, setOrigin] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const siteName = activeSiteName === "All sites" ? "Main site" : activeSiteName;
  const visitUrl = `${origin || ""}/visit?site=${encodeURIComponent(siteName)}`;

  return (
    <QrCard
      title="Visit and review QR"
      siteName={siteName}
      visitUrl={visitUrl}
      copied={copied}
      onCopy={async () => {
        await navigator.clipboard.writeText(visitUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      mode="Demo link until Convex is configured"
    />
  );
}

function QrCard({
  title,
  siteName,
  visitUrl,
  copied,
  onCopy,
  mode,
}: {
  title: string;
  siteName: string;
  visitUrl: string;
  copied: boolean;
  onCopy: () => void | Promise<void>;
  mode: string;
}) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=12&data=${encodeURIComponent(visitUrl)}`;

  return (
    <div className="card" style={{ padding: 22, marginBottom: 14 }}>
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
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 26, lineHeight: 1.1 }}>
            3 visits unlock 20% off.
          </div>
          <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 8 }}>
            Put this at the counter. Customers scan it after a visit, leave quick feedback, and the visit is logged on their customer profile.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <span className="chip">{siteName}</span>
            <span className="chip chip-sage">{mode}</span>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a className="btn btn-ghost" href={visitUrl} target="_blank" rel="noreferrer" style={{ padding: "9px 12px", fontSize: 13 }}>
              Open form
            </a>
            <button type="button" className="btn btn-terracotta" onClick={onCopy} style={{ padding: "9px 12px", fontSize: 13 }}>
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
