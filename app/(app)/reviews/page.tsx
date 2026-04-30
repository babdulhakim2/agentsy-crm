"use client";

import * as React from "react";
import { FORGE } from "@/lib/data";
import { Icon } from "@/components/icons";
import { StarRow } from "@/components/atoms";
import type { Review } from "@/lib/types";

const TABS = [
  { id: "needs", label: "Needs reply" },
  { id: "sent", label: "Sent" },
  { id: "all", label: "All" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const SENT_REVIEWS = [
  { who: "Iris M.", site: "Hackney", stars: 5, age: "47m ago", txt: "Iris, thank you — couldn't agree more about the bread. Hope to see you again." },
  { who: "Tom B.", site: "Peckham", stars: 5, age: "3h ago", txt: "Tom — really kind of you to say. Pass our thanks to the team you came with." },
  { who: "Anonymous", site: "King's Cross", stars: 4, age: "yesterday", txt: "Thank you for the lovely note about the wine list. We'll keep it sharp." },
];

export default function ReviewsPage() {
  const F = FORGE;
  const [tab, setTab] = React.useState<TabId>("needs");
  const [done, setDone] = React.useState<Record<string, boolean>>({});
  const [autosend, setAutosend] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>(F.reviews[0]?.id);
  const [drafts, setDrafts] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(F.reviews.map((r) => [r.id, r.draft]))
  );

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const remaining = F.reviews.filter((r) => !done[r.id]);
  const selected = F.reviews.find((r) => r.id === selectedId) ?? remaining[0];

  return (
    <div className="screen-twocol paper-grain">
      <div className="screen-twocol__list">
        <div className="page-title">
          <div className="eyebrow">Reviews</div>
          <div className="h">Reply within 24h, in your voice.</div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "10px 14px 0",
            borderBottom: "1px solid var(--rule)",
            overflowX: "auto",
          }}
        >
          {TABS.map((t) => {
            const count = t.id === "needs" ? remaining.length : t.id === "sent" ? 47 : 184;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  border: "none",
                  background: "none",
                  padding: "10px 14px",
                  fontFamily: "var(--sans)",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: tab === t.id ? "var(--ink)" : "var(--ink-3)",
                  borderBottom: tab === t.id ? "2px solid var(--terracotta)" : "2px solid transparent",
                  marginBottom: -1,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label} <span style={{ color: "var(--ink-4)", marginLeft: 4 }}>{count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }}>
          {tab === "needs" && (
            <>
              <div style={{ display: "flex", gap: 6, padding: "12px 14px 0", flexWrap: "wrap" }}>
                <button type="button" className="chip" style={{ cursor: "pointer" }}>
                  <Icon.Filter s={12} /> All sites
                </button>
                <button type="button" className="chip" style={{ cursor: "pointer" }}>
                  ★ Any rating
                </button>
                <button type="button" className="chip" style={{ cursor: "pointer" }}>
                  Source · GBP
                </button>
              </div>
              {isDesktop ? (
                /* Compact list rows for desktop master-detail */
                <div style={{ marginTop: 8 }}>
                  {remaining.map((r) => {
                    const active = r.id === selectedId;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedId(r.id)}
                        className={"list-row" + (active ? " active" : "")}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <StarRow value={r.stars} />
                            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.author}</span>
                            <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                              · {r.site} · {r.age}
                            </span>
                            {r.flagged && (
                              <span className="chip chip-crimson" style={{ marginLeft: "auto", fontSize: 10.5 }}>
                                Take a beat
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 12.5,
                              color: "var(--ink-3)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {r.excerpt}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {remaining.length === 0 && (
                    <AllClearEmpty />
                  )}
                </div>
              ) : (
                /* Mobile: full cards inline */
                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {remaining.map((r) => (
                    <FullReviewCard
                      key={r.id}
                      review={r}
                      draft={drafts[r.id] ?? r.draft}
                      onApprove={() => setDone((d) => ({ ...d, [r.id]: true }))}
                    />
                  ))}
                  {remaining.length === 0 && <AllClearEmpty />}
                  <div className="card" style={{ marginTop: 6, padding: 14, background: "var(--card-2)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <button
                        type="button"
                        className={"toggle" + (autosend ? " on" : "")}
                        onClick={() => setAutosend((v) => !v)}
                        aria-label="Toggle auto-send"
                      />
                      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.45 }}>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>Auto-send replies to 4★ and 5★</div>
                        <div style={{ color: "var(--ink-3)" }}>
                          I&apos;ll switch this on for you after 30 days of high approval.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "sent" && (
            <div style={{ display: "flex", flexDirection: "column", padding: "12px 14px", gap: 10 }}>
              {SENT_REVIEWS.map((s, i) => (
                <article key={i} className="card" style={{ padding: 12, opacity: 0.85 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <StarRow value={s.stars} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.who}</span>
                    <span style={{ fontSize: 12, color: "var(--ink-3)" }}>· {s.site}</span>
                    <span className="chip chip-sage" style={{ marginLeft: "auto" }}>
                      <Icon.Check s={11} /> Sent {s.age}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{s.txt}</div>
                </article>
              ))}
            </div>
          )}

          {tab === "all" && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--ink-3)", fontSize: 13 }}>
              All 184 reviews · filter to a site or rating to drill in.
            </div>
          )}
        </div>
      </div>

      {/* Desktop detail panel */}
      <div className="screen-twocol__detail">
        {selected && tab === "needs" && !done[selected.id] ? (
          <ReviewDraftEditor
            review={selected}
            draft={drafts[selected.id] ?? selected.draft}
            onChangeDraft={(v) => setDrafts((d) => ({ ...d, [selected.id]: v }))}
            onApprove={() => setDone((d) => ({ ...d, [selected.id]: true }))}
          />
        ) : (
          <div className="detail-empty">
            <div className="h">All replies sent.</div>
            <div className="serif-i">No reviews waiting — last reply 47 minutes ago.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function AllClearEmpty() {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--ink-3)" }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)", marginBottom: 6 }}>
        All clear.
      </div>
      <div className="serif-i">No reviews waiting — last reply 47 minutes ago.</div>
    </div>
  );
}

function FullReviewCard({
  review: r,
  draft,
  onApprove,
}: {
  review: Review;
  draft: string;
  onApprove: () => void;
}) {
  return (
    <article className="card" style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        <StarRow value={r.stars} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{r.author}</span>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
          · {r.site} · {r.age}
        </span>
        {r.flagged && (
          <span className="chip chip-crimson" style={{ marginLeft: "auto" }}>
            Take a beat
          </span>
        )}
      </div>
      <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginBottom: 10, lineHeight: 1.45 }}>
        &ldquo;{r.excerpt}&rdquo;
      </div>
      <div style={{ borderLeft: "2px solid var(--terracotta)", paddingLeft: 10, marginBottom: 10 }}>
        <div className="eyebrow" style={{ marginBottom: 4, display: "flex", gap: 5, alignItems: "center" }}>
          <Icon.Sparkle s={11} c="var(--terracotta)" /> Draft · in your voice
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{draft}</div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="button" className="soft-pill" style={{ flex: 1 }} aria-label="Refresh draft">
          <Icon.Refresh s={13} />
        </button>
        <button type="button" className="soft-pill" style={{ flex: 1.5 }}>
          Edit
        </button>
        <button type="button" className="approve-pill" style={{ flex: 2 }} onClick={onApprove}>
          Approve &amp; post
        </button>
      </div>
    </article>
  );
}

function ReviewDraftEditor({
  review,
  draft,
  onChangeDraft,
  onApprove,
}: {
  review: Review;
  draft: string;
  onChangeDraft: (v: string) => void;
  onApprove: () => void;
}) {
  return (
    <div style={{ flex: 1, padding: "20px 28px 32px", maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <StarRow value={review.stars} size={16} />
        <span style={{ fontSize: 18, fontFamily: "var(--serif)" }}>{review.author}</span>
        <span style={{ fontSize: 13, color: "var(--ink-3)" }}>
          · {review.site} · {review.age}
        </span>
        {review.flagged && (
          <span className="chip chip-crimson" style={{ marginLeft: "auto" }}>
            Take a beat
          </span>
        )}
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 16, background: "var(--card-2)" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          What they wrote
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-2)" }}>
          &ldquo;{review.excerpt}&rdquo;
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
          <Icon.Sparkle s={11} c="var(--terracotta)" /> Draft reply · in your voice
        </div>
        <textarea
          className="textarea"
          style={{ minHeight: 160, fontSize: 14.5, lineHeight: 1.55 }}
          value={draft}
          onChange={(e) => onChangeDraft(e.target.value)}
          aria-label="Draft reply"
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-ghost">
          <Icon.Refresh s={14} /> Refresh draft
        </button>
        <button type="button" className="btn btn-ghost">
          Skip
        </button>
        <button
          type="button"
          className="btn btn-terracotta"
          onClick={onApprove}
          style={{ marginLeft: "auto" }}
        >
          <Icon.Check s={16} c="#fff" /> Approve &amp; post
        </button>
      </div>

      <div
        style={{
          marginTop: 22,
          padding: 14,
          background: "var(--card-2)",
          borderRadius: 12,
          border: "1px solid var(--rule)",
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          What I&apos;ll post
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
          Posted to Google Business Profile for <b>{review.site}</b>. You can undo for 5 minutes after.
        </div>
      </div>
    </div>
  );
}
