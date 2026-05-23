"use client";

import * as React from "react";
import Link from "next/link";
import { FORGE } from "@/lib/data";
import { Icon } from "@/components/icons";
import { SectionHeader, StarRow } from "@/components/atoms";
import { RestaurantSymbol } from "@/components/atoms/RestaurantMark";
import { QuickAddCustomer, QuickAddFab } from "@/components/widgets/QuickAddCustomer";
import { FoodImage } from "@/components/widgets/FoodImage";
import { useSite } from "@/lib/site-context";
import { ImageLightbox } from "@/components/widgets/ImageLightbox";
import { SiteTag } from "@/components/widgets/SiteTag";

export default function TodayPage() {
  const F = FORGE;
  const { activeSiteName, tenantName, ownerName, sites, activeSite, isAllSites, filterByActiveSite } = useSite();
  const visibleSites = isAllSites ? sites : activeSite ? [activeSite] : sites;
  const totalCovers = visibleSites.reduce((sum, site) => sum + site.covers, 0) || F.totalCovers;
  const [open, setOpen] = React.useState({
    reviews: true,
    birthdays: false,
    winbacks: false,
    social: false,
  });
  const [approved, setApproved] = React.useState<Record<string, boolean>>({});
  const [skipped, setSkipped] = React.useState<Record<string, boolean>>({});
  const [editing, setEditing] = React.useState<string | null>(null);
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [allClear, setAllClear] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [preview, setPreview] = React.useState<{ src?: string; alt?: string; caption?: string } | null>(null);

  const draftFor = (id: string, fallback: string) => drafts[id] ?? fallback;
  const updateDraft = (id: string, value: string) =>
    setDrafts((d) => ({ ...d, [id]: value }));

  const reviews = filterByActiveSite(F.reviews);
  const winbacks = filterByActiveSite(F.winbacks);
  const social = filterByActiveSite(F.social);
  const birthdays = filterByActiveSite(F.birthdays);
  const reviewsLeft = reviews.filter((r) => !approved[r.id] && !skipped[r.id]);
  const winbacksLeft = winbacks.filter((r) => !approved[r.id] && !skipped[r.id]);
  const socialLeft = social.filter((r) => !approved[r.id] && !skipped[r.id]);
  const birthdaysLeft = birthdays.filter((r) => !approved[r.id] && !skipped[r.id]);

  const flash = (id: string) => setApproved((a) => ({ ...a, [id]: true }));
  const skip = (id: string) => setSkipped((s) => ({ ...s, [id]: true }));

  return (
    <div className="screen-dashboard paper-grain">
      <div className="screen-dashboard__main">
        {/* Header — restaurant brand first, owner greeting underneath */}
        <div style={{ padding: "14px 4px 12px", display: "flex", alignItems: "center", gap: 12 }}>
          <RestaurantSymbol size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: 18,
                lineHeight: 1.1,
                fontWeight: 500,
              }}
            >
              {tenantName}
            </div>
            <div className="eyebrow" style={{ marginTop: 2 }}>
              {F.date} · {activeSiteName}
            </div>
          </div>
          <Link href="/settings" className="icon-btn" aria-label="Settings">
            <Icon.Settings s={18} />
          </Link>
        </div>
        <div style={{ padding: "0 4px 14px" }}>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 26,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            Good morning, {ownerName}.
          </div>
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
                  {totalCovers}
                </span>
                <span style={{ color: "var(--ink-3)", fontSize: 14 }}>
                  {visibleSites.length === 1 ? `at ${visibleSites[0].name}` : `across ${visibleSites.length} sites`}
                </span>
              </div>
              {visibleSites.length > 1 && (
                <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
                  {visibleSites.map((s, i) => (
                    <div
                      key={s.id}
                      style={{
                        flex: 1,
                        paddingRight: 10,
                        paddingLeft: i > 0 ? 10 : 0,
                        borderRight: i < visibleSites.length - 1 ? "1px solid var(--rule)" : "none",
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
              )}
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
            count={`${reviewsLeft.length} of ${reviews.length}`}
            expanded={open.reviews}
            onClick={() => setOpen((o) => ({ ...o, reviews: !o.reviews }))}
          />
          {open.reviews && (
            <div style={{ padding: "4px 0 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {reviews.map((r) => {
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
                      <SiteTag site={r.site} subtle />
                      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>· {r.age}</span>
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
                        <textarea
                          className="textarea"
                          autoFocus
                          style={{ fontSize: 13.5 }}
                          value={draftFor(r.id, r.draft)}
                          onChange={(e) => updateDraft(r.id, e.target.value)}
                        />
                      ) : (
                        <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{draftFor(r.id, r.draft)}</div>
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
            title="Regulars to contact today"
            count={`${winbacksLeft.length} of ${winbacks.length}`}
            expanded={open.winbacks}
            onClick={() => setOpen((o) => ({ ...o, winbacks: !o.winbacks }))}
          />
          {open.winbacks && (
            <div style={{ padding: "4px 0 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {winbacks.map((w) => {
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
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                          <SiteTag site={w.site} subtle />
                          <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>last seen {w.last}</span>
                        </div>
                      </div>
                      <span className="chip">{w.tag}</span>
                    </div>
                    <div
                      style={{
                        borderLeft: "2px solid var(--terracotta)",
                        paddingLeft: 10,
                        marginBottom: 10,
                      }}
                    >
                      {editing === w.id ? (
                        <textarea
                          className="textarea"
                          autoFocus
                          style={{ fontSize: 13.5 }}
                          value={draftFor(w.id, w.draft)}
                          onChange={(e) => updateDraft(w.id, e.target.value)}
                        />
                      ) : (
                        <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{draftFor(w.id, w.draft)}</div>
                      )}
                    </div>
                    {!ok && (
                      <div className="action-row">
                        <button
                          type="button"
                          className="soft-pill"
                          onClick={() => setEditing(editing === w.id ? null : w.id)}
                        >
                          <Icon.Edit s={14} /> {editing === w.id ? "Done" : "Edit"}
                        </button>
                        <button type="button" className="approve-pill" onClick={() => flash(w.id)}>
                          <Icon.Send s={14} c="#fff" /> Send WhatsApp
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

          {/* Birthdays this week */}
          <SectionHeader
            title="Birthdays this week"
            count={`${birthdaysLeft.length} of ${birthdays.length}`}
            expanded={open.birthdays}
            onClick={() => setOpen((o) => ({ ...o, birthdays: !o.birthdays }))}
          />
          {open.birthdays && (
            <div style={{ padding: "4px 0 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {birthdays.map((b) => {
                const ok = approved[b.id];
                if (skipped[b.id]) return null;
                return (
                  <article
                    key={b.id}
                    className={"card fade-up" + (ok ? " approve-flash" : "")}
                    style={{ padding: 16, opacity: ok ? 0.55 : 1 }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                      <div
                        className="avatar amber"
                        style={{ background: "var(--amber-tint)", color: "var(--amber)" }}
                      >
                        🎂
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{b.customerName}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                          <SiteTag site={b.site} subtle />
                          <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                            Birthday {b.when} · WhatsApp opt-in
                          </span>
                        </div>
                      </div>
                      <span className="chip chip-amber" style={{ flexShrink: 0 }}>
                        On us: {b.voucher}
                      </span>
                    </div>
                    <div
                      style={{
                        borderLeft: "2px solid var(--terracotta)",
                        paddingLeft: 10,
                        marginBottom: 10,
                      }}
                    >
                      {editing === b.id ? (
                        <textarea
                          className="textarea"
                          autoFocus
                          style={{ fontSize: 13.5 }}
                          value={draftFor(b.id, b.draft)}
                          onChange={(e) => updateDraft(b.id, e.target.value)}
                        />
                      ) : (
                        <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{draftFor(b.id, b.draft)}</div>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--ink-3)",
                        marginBottom: 10,
                        fontStyle: "italic",
                      }}
                    >
                      Voucher is text-only — they show this WhatsApp at the till. We track
                      redemption next month when POS catches up.
                    </div>
                    {!ok && (
                      <div className="action-row">
                        <button
                          type="button"
                          className="soft-pill"
                          onClick={() => setEditing(editing === b.id ? null : b.id)}
                        >
                          <Icon.Edit s={14} /> {editing === b.id ? "Done" : "Edit"}
                        </button>
                        <button type="button" className="approve-pill" onClick={() => flash(b.id)}>
                          <Icon.Send s={14} c="#fff" /> Send treat
                        </button>
                        <button type="button" className="soft-pill" onClick={() => skip(b.id)}>
                          Skip
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
              <div
                className="card"
                style={{
                  padding: 14,
                  background: "var(--card-2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 12.5,
                  color: "var(--ink-2)",
                  lineHeight: 1.5,
                }}
              >
                <Icon.Sparkle s={16} c="var(--terracotta)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  Don&apos;t have birthdays for everyone? I&apos;ll quietly ask each customer in their
                  next WhatsApp thank-you. Already collected 38 birthdays this month.
                </div>
              </div>
            </div>
          )}

          {/* Social */}
          <SectionHeader
            title="Social posts drafted"
            count={`${socialLeft.length} of ${social.length}`}
            expanded={open.social}
            onClick={() => setOpen((o) => ({ ...o, social: !o.social }))}
          />
          {open.social && (
            <div style={{ padding: "4px 0 14px", display: "flex", flexDirection: "column", gap: 12 }}>
              {social.map((s) => {
                const ok = approved[s.id];
                if (skipped[s.id]) return null;
                return (
                  <article
                    key={s.id}
                    className={"card fade-up" + (ok ? " approve-flash" : "")}
                    style={{ padding: 0, opacity: ok ? 0.55 : 1, overflow: "hidden" }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setPreview({ src: s.imageUrl, alt: s.imageAlt, caption: draftFor(s.id, s.draft) })
                      }
                      aria-label="Preview image"
                      style={{
                        display: "block",
                        width: "100%",
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        cursor: "zoom-in",
                      }}
                    >
                      <FoodImage
                        src={s.imageUrl}
                        alt={s.imageAlt}
                        caption={s.imageAlt}
                        height={200}
                        rounded={0}
                      />
                    </button>
                    <div style={{ padding: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span className="chip chip-terra">{s.kind}</span>
                        <SiteTag site={s.site} subtle />
                      </div>
                      {editing === s.id ? (
                        <textarea
                          className="textarea"
                          autoFocus
                          style={{ fontSize: 13.5, marginBottom: 12 }}
                          value={draftFor(s.id, s.draft)}
                          onChange={(e) => updateDraft(s.id, e.target.value)}
                        />
                      ) : (
                        <div
                          style={{
                            borderLeft: "2px solid var(--terracotta)",
                            paddingLeft: 10,
                            fontSize: 13.5,
                            lineHeight: 1.55,
                            marginBottom: 12,
                          }}
                        >
                          {draftFor(s.id, s.draft)}
                        </div>
                      )}
                      {!ok && (
                        <div className="action-row">
                          <button
                            type="button"
                            className="soft-pill"
                            onClick={() => setEditing(editing === s.id ? null : s.id)}
                          >
                            <Icon.Edit s={14} /> {editing === s.id ? "Done" : "Edit"}
                          </button>
                          <button type="button" className="approve-pill" onClick={() => flash(s.id)}>
                            <Icon.Send s={14} c="#fff" /> Schedule post
                          </button>
                          <button type="button" className="soft-pill" onClick={() => skip(s.id)}>
                            Skip
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div style={{ height: 24 }} />
        </div>
      </div>

      {/* Desktop side rail — at-a-glance context */}
      <aside className="screen-dashboard__rail" aria-label="At a glance">
        <TodayRail />
      </aside>

      <QuickAddFab onClick={() => setAddOpen(true)} />
      <QuickAddCustomer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        source="manual"
        title="Add a customer"
        subtitle="Capture a walk-in or new contact."
      />
      <ImageLightbox
        open={!!preview}
        onClose={() => setPreview(null)}
        src={preview?.src}
        alt={preview?.alt}
        caption={preview?.caption}
      />
    </div>
  );
}

function TodayRail() {
  const F = FORGE;
  const { sites, activeSite, isAllSites, filterByActiveSite } = useSite();
  const visibleSites = isAllSites ? sites : activeSite ? [activeSite] : sites;
  const upcoming = F.campaigns.filter(
    (c) =>
      (c.status === "scheduled" || c.status === "sending") &&
      (!activeSite || c.site === activeSite.name || c.site === "All sites")
  );
  const birthdaysThisWeek = filterByActiveSite(F.birthdays).slice(0, 3);

  return (
    <>
      {/* Birthdays this week — small, glanceable, drives data collection */}
      <div>
        <div
          className="eyebrow"
          style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}
        >
          🎂 Birthdays this week
        </div>
        <div className="card" style={{ padding: 12, background: "var(--card-2)" }}>
          {birthdaysThisWeek.map((b, i, arr) => (
            <div
              key={b.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--rule)" : "none",
              }}
            >
              <div
                className="avatar"
                style={{
                  width: 28,
                  height: 28,
                  fontSize: 12,
                  background: "var(--amber-tint)",
                  color: "var(--amber)",
                }}
              >
                {b.customerName[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{b.customerName}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2, minWidth: 0 }}>
                  <SiteTag site={b.site} subtle />
                  <span
                    style={{
                      fontSize: 10.5,
                      color: "var(--ink-3)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.when} · {b.voucher}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: "var(--ink-3)",
              fontStyle: "italic",
              lineHeight: 1.4,
            }}
          >
            38 birthdays captured this month — open the brief to send treats.
          </div>
        </div>
      </div>

      <div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Sites · today
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visibleSites.map((s) => (
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
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                <SiteTag site={c.site} subtle />
              </div>
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
            { href: "/customers", label: "Customers", I: Icon.Users },
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
