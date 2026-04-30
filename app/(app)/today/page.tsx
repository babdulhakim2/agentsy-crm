"use client";

import * as React from "react";
import Link from "next/link";
import { FORGE } from "@/lib/data";
import { Icon } from "@/components/icons";
import { AgentsyMark, SectionHeader, StarRow, HealthPill } from "@/components/atoms";

export default function TodayPage() {
  const F = FORGE;
  const [open, setOpen] = React.useState({
    reviews: true,
    winbacks: false,
    social: false,
    anomalies: false,
  });
  const [approved, setApproved] = React.useState<Record<string, boolean>>({});
  const [skipped, setSkipped] = React.useState<Record<string, boolean>>({});
  const [editing, setEditing] = React.useState<string | null>(null);
  const [allClear, setAllClear] = React.useState(false);

  const reviewsLeft = F.reviews.filter((r) => !approved[r.id] && !skipped[r.id]);
  const winbacksLeft = F.winbacks.filter((r) => !approved[r.id] && !skipped[r.id]);
  const socialLeft = F.social.filter((r) => !approved[r.id] && !skipped[r.id]);

  const flash = (id: string) => setApproved((a) => ({ ...a, [id]: true }));
  const skip = (id: string) => setSkipped((s) => ({ ...s, [id]: true }));

  return (
    <div className="screen-dashboard paper-grain">
      <div className="screen-dashboard__main">
        {/* Header */}
        <div style={{ padding: "14px 4px 10px", display: "flex", alignItems: "center", gap: 10 }}>
          <AgentsyMark size={26} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow">
              {F.date} · {F.group}
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.1, marginTop: 2 }}>
              Good morning, {F.owner}.
            </div>
          </div>
          <Link href="/settings" className="icon-btn" aria-label="Settings">
            <Icon.Settings s={18} />
          </Link>
        </div>

        <div style={{ flex: 1, padding: "4px 0 12px" }}>
          {/* Hero */}
          <div style={{ padding: "0 4px 18px" }}>
            <div className="card" style={{ padding: "18px 22px 18px", background: "var(--card-2)" }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Today&apos;s covers
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                <span
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 56,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {F.totalCovers}
                </span>
                <span style={{ color: "var(--ink-3)", fontSize: 14 }}>across {F.sites.length} sites</span>
              </div>
              <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
                {F.sites.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      flex: 1,
                      paddingRight: 10,
                      paddingLeft: i > 0 ? 10 : 0,
                      borderRight: i < F.sites.length - 1 ? "1px solid var(--rule)" : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        fontFamily: "var(--serif)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {s.covers}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>{s.name}</div>
                  </div>
                ))}
              </div>
              {!allClear ? (
                <button
                  type="button"
                  className="btn btn-terracotta"
                  onClick={() => setAllClear(true)}
                  style={{ width: "100%" }}
                >
                  <Icon.Check s={17} c="#fff" /> Approve everything I&apos;ve drafted
                </button>
              ) : (
                <div
                  className="chip chip-sage"
                  style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 13 }}
                >
                  <Icon.Check s={15} /> Sent. Undo for 5 minutes.
                </div>
              )}
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--ink-3)",
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                <span className="serif-i">Last refreshed 3 min ago — pull to refresh.</span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <SectionHeader
            title="Reviews to send"
            count={`${reviewsLeft.length} of ${F.reviews.length}`}
            expanded={open.reviews}
            onClick={() => setOpen((o) => ({ ...o, reviews: !o.reviews }))}
          />
          {open.reviews && (
            <div style={{ padding: "4px 0 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {F.reviews.map((r) => {
                if (skipped[r.id]) return null;
                const isApproved = approved[r.id];
                return (
                  <article
                    key={r.id}
                    className={"card fade-up" + (isApproved ? " approve-flash" : "")}
                    style={{ padding: 16, opacity: isApproved ? 0.55 : 1 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <StarRow value={r.stars} />
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{r.author}</span>
                      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
                        · {r.site} · {r.age}
                      </span>
                      {r.flagged && (
                        <span className="chip chip-crimson" style={{ marginLeft: "auto" }}>
                          Soft start
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 13.5,
                        color: "var(--ink-2)",
                        marginBottom: 10,
                        lineHeight: 1.45,
                      }}
                    >
                      &ldquo;{r.excerpt}&rdquo;
                    </div>

                    <div style={{ borderLeft: "2px solid var(--terracotta)", paddingLeft: 10, marginBottom: 10 }}>
                      <div className="eyebrow" style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon.Sparkle s={11} c="var(--terracotta)" /> Draft reply
                      </div>
                      {editing === r.id ? (
                        <textarea className="textarea" defaultValue={r.draft} autoFocus style={{ fontSize: 13.5 }} />
                      ) : (
                        <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{r.draft}</div>
                      )}
                    </div>

                    {!isApproved && (
                      <div className="action-row">
                        <button
                          type="button"
                          className="soft-pill"
                          onClick={() => setEditing(editing === r.id ? null : r.id)}
                        >
                          <Icon.Edit s={14} /> {editing === r.id ? "Done" : "Edit"}
                        </button>
                        <button type="button" className="approve-pill" onClick={() => flash(r.id)}>
                          <Icon.Check s={14} c="#fff" /> Approve
                        </button>
                        <button type="button" className="soft-pill" onClick={() => skip(r.id)}>
                          Skip
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* Win-backs */}
          <SectionHeader
            title="Regulars I'd nudge today"
            count={`${winbacksLeft.length} of ${F.winbacks.length}`}
            expanded={open.winbacks}
            onClick={() => setOpen((o) => ({ ...o, winbacks: !o.winbacks }))}
          />
          {open.winbacks && (
            <div style={{ padding: "4px 0 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {F.winbacks.map((w) => {
                if (skipped[w.id]) return null;
                const ok = approved[w.id];
                return (
                  <article
                    key={w.id}
                    className={"card fade-up" + (ok ? " approve-flash" : "")}
                    style={{ padding: 16, opacity: ok ? 0.55 : 1 }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                      <div className="avatar">{w.name[0]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                          {w.site} · last seen {w.last}
                        </div>
                      </div>
                      <span className="chip">{w.tag}</span>
                    </div>
                    <div
                      style={{
                        borderLeft: "2px solid var(--terracotta)",
                        paddingLeft: 10,
                        marginBottom: 10,
                        fontSize: 13.5,
                        lineHeight: 1.5,
                      }}
                    >
                      {w.draft}
                    </div>
                    {!ok && (
                      <div className="action-row">
                        <button type="button" className="soft-pill">
                          Edit
                        </button>
                        <button type="button" className="approve-pill" onClick={() => flash(w.id)}>
                          Send WhatsApp
                        </button>
                        <button type="button" className="soft-pill" onClick={() => skip(w.id)}>
                          Skip
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* Social */}
          <SectionHeader
            title="Social posts drafted"
            count={socialLeft.length}
            expanded={open.social}
            onClick={() => setOpen((o) => ({ ...o, social: !o.social }))}
          />
          {open.social && (
            <div style={{ padding: "4px 0 14px" }}>
              {F.social.map((s) => (
                <article key={s.id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <div className="placeholder-img" style={{ width: 86, height: 86, fontSize: 9 }}>
                      IG photo
                      <br />· lamb shot ·
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                        {s.kind} · {s.site}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                        Phase 2 · I&apos;ll show you the draft, you copy &amp; paste
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      borderLeft: "2px solid var(--terracotta)",
                      paddingLeft: 10,
                      fontSize: 13.5,
                      lineHeight: 1.5,
                    }}
                  >
                    {s.draft}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Anomalies */}
          <SectionHeader
            title="Anomalies"
            count={F.anomalies.length}
            expanded={open.anomalies}
            onClick={() => setOpen((o) => ({ ...o, anomalies: !o.anomalies }))}
          />
          {open.anomalies && (
            <div style={{ padding: "4px 0 14px" }}>
              {F.anomalies.map((a) => (
                <article
                  key={a.id}
                  className="card"
                  style={{
                    padding: 16,
                    background: "var(--crimson-tint)",
                    borderColor: "rgba(162, 58, 46, 0.2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                    <Icon.AlertTriangle s={18} c="var(--crimson)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--crimson)" }}>{a.label}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.4 }}>
                        {a.detail}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/sites"
                    className="btn btn-terracotta"
                    style={{ marginTop: 4, padding: "8px 14px", fontSize: 13, borderRadius: 8 }}
                  >
                    Reconnect Square
                  </Link>
                </article>
              ))}
            </div>
          )}

          <div style={{ height: 24 }} />
        </div>
      </div>

      {/* Desktop side rail — at-a-glance context */}
      <aside className="screen-dashboard__rail" aria-label="At a glance">
        <TodayRail />
      </aside>
    </div>
  );
}

function TodayRail() {
  const F = FORGE;
  const broken = F.integrations.filter((i) => i.status === "red").length;
  const stale = F.integrations.filter((i) => i.status === "amber").length;
  const upcoming = F.campaigns.filter((c) => c.status === "scheduled" || c.status === "sending");

  return (
    <>
      <div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Sites · today
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {F.sites.map((s) => (
            <div
              key={s.id}
              className="card"
              style={{
                padding: "12px 14px",
                background: "var(--card-2)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Icon.Building s={16} c="var(--ink-3)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{s.address.split(",")[0]}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 22,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}
                >
                  {s.covers}
                </div>
                <div className="tag-mono" style={{ fontSize: 10 }}>
                  covers
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Integrations
        </div>
        <div className="card" style={{ padding: 14, background: "var(--card-2)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span style={{ fontFamily: "var(--serif)", fontSize: 28, lineHeight: 1 }}>
              {F.integrations.length - broken - stale}/{F.integrations.length}
            </span>
            <span className="tag-mono">healthy</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            <HealthPill status="green" />
            {stale > 0 && <HealthPill status="amber" />}
            {broken > 0 && <HealthPill status="red" />}
          </div>
          {broken > 0 && (
            <Link
              href="/sites"
              className="btn-soft"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12.5,
                width: "100%",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <Icon.AlertTriangle s={14} c="var(--crimson)" /> Reconnect Square
            </Link>
          )}
        </div>
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Upcoming campaigns
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {upcoming.map((c) => (
            <Link
              key={c.id}
              href="/campaigns"
              className="card"
              style={{
                padding: "12px 14px",
                background: "var(--card-2)",
                display: "block",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                {c.when ?? `${c.sent ?? 0} of ${c.recipients} sent`} · {c.channel} · {c.cost}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Quick jump
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { href: "/inbox", label: "Inbox", I: Icon.Inbox },
            { href: "/reviews", label: "Reviews", I: Icon.Star },
            { href: "/guests", label: "Guests", I: Icon.Users },
            { href: "/campaigns", label: "Campaigns", I: Icon.Send },
          ].map((q) => {
            const I = q.I;
            return (
              <Link
                key={q.href}
                href={q.href}
                className="card"
                style={{
                  padding: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--card-2)",
                  textDecoration: "none",
                  color: "inherit",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <I s={16} c="var(--ink-3)" />
                {q.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
