"use client";

import * as React from "react";
import { Icon } from "../icons";
import { OfferComposer } from "./OfferComposer";
import { SiteTag } from "./SiteTag";
import type { Customer, CustomerSource, PipelineStage } from "@/lib/types";
import { nextActionForCustomer, SOURCES, STAGES, STAGE_BY_ID, SOURCE_LABEL } from "@/lib/pipeline";
import { isConvexReady } from "@/lib/convex";

const VISIT_HISTORY = [
  { d: "18 Feb", site: "Islington", party: 2, spend: "£72", notes: '"Great visit" — Jess', svr: "Anya" },
  { d: "03 Jan", site: "Islington", party: 4, spend: "£148", notes: "Family Sunday", svr: "Marco" },
  { d: "12 Dec", site: "Islington", party: 2, spend: "£54", notes: "—", svr: "Lou" },
  { d: "24 Nov", site: "Islington", party: 6, spend: "£220", notes: "Birthday", svr: "Anya" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_CHIPS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function whatsappUrl(phone?: string): string | undefined {
  const digits = phone?.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : undefined;
}

interface Props {
  customer: Customer;
  onBack?: () => void;
  showBack?: boolean;
  onEditCustomer?: (customer: Customer) => void | Promise<void>;
  onDeleteCustomer?: (customer: Customer) => void | Promise<void>;
}

/**
 * Derive a small set of insights per customer. In production these come from
 * Convex queries over the visit history; for the demo we synthesize from the
 * customer's tag, recency, visits and spend so each profile feels real.
 */
function deriveInsights(g: Customer): string[] {
  const out: string[] = [];
  if (g.recency === "crimson") {
    out.push(
      `Used to come every 2–3 weeks. Hasn't booked since ${g.last}. Strong candidate for a personal check-in.`
    );
  }
  if (g.visits >= 10) {
    const avg = Math.round(g.spend / g.visits);
    out.push(`Top-decile loyalty — ${g.visits} visits with an average spend of £${avg} per cover.`);
  }
  if (g.tag.toLowerCase().includes("wine") || g.tag.toLowerCase().includes("spice")) {
    out.push(
      `Pattern: orders ${g.tag.toLowerCase()} on most visits. Try inviting them to next chef's tasting.`
    );
  }
  if (g.tag.toLowerCase().includes("vip")) {
    out.push(`Tagged VIP. Reserve corner table and brief the kitchen on dietary preferences.`);
  }
  if (g.birthMonth) {
    const m = MONTH_NAMES[g.birthMonth - 1];
    out.push(
      `Birthday in ${m}${g.birthDay ? ` (the ${g.birthDay}${["st", "nd", "rd"][g.birthDay - 1] ?? "th"})` : ""} — birthday treat queues automatically.`
    );
  }
  if (g.visits <= 2 && g.recency === "sage") {
    out.push(`First or second visit — they're at the make-or-break moment for becoming a regular.`);
  }
  if (out.length === 0) {
    out.push(`Steady regular. Spend is consistent and visits are well-spaced.`);
  }
  return out.slice(0, 3);
}

export function CustomerDetailView({ customer: g, onBack, showBack, onEditCustomer, onDeleteCustomer }: Props) {
  const [offerOpen, setOfferOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [stagePickerOpen, setStagePickerOpen] = React.useState(false);
  const [stage, setStage] = React.useState<PipelineStage | undefined>(g.pipelineStage);
  const effectiveCustomer = { ...g, pipelineStage: stage };
  const nextAction = nextActionForCustomer(effectiveCustomer);
  const [insights, setInsights] = React.useState<string[]>(() => deriveInsights(g));
  const [insightMode, setInsightMode] = React.useState<"loading" | "llm" | "fallback">("fallback");
  const stageMeta = stage ? STAGE_BY_ID[stage] : undefined;

  React.useEffect(() => {
    setStage(g.pipelineStage);
    setStagePickerOpen(false);
  }, [g.id, g.pipelineStage]);

  React.useEffect(() => {
    let active = true;
    const fallback = deriveInsights(effectiveCustomer);
    setInsights(fallback);
    setInsightMode("loading");

    fetch("/api/ai/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "insights",
        customer: effectiveCustomer,
        restaurant: { name: "New Wok's Cooking" },
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("AI request failed"))))
      .then((data: { insights?: string[]; mode?: "llm" | "fallback" }) => {
        if (!active) return;
        if (data.insights?.length) setInsights(data.insights);
        setInsightMode(data.mode ?? "fallback");
      })
      .catch(() => {
        if (!active) return;
        setInsights(fallback);
        setInsightMode("fallback");
      });

    return () => {
      active = false;
    };
  }, [g.id, stage]);

  const updateStage = async (nextStage: PipelineStage | undefined) => {
    const previousStage = stage;
    setStage(nextStage);
    setStagePickerOpen(false);
    try {
      await onEditCustomer?.({ ...g, pipelineStage: nextStage });
    } catch {
      setStage(previousStage);
    }
  };

  return (
    <div style={{ flex: 1, padding: "20px 28px 32px", maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        {showBack && (
          <button type="button" onClick={onBack} className="icon-btn" aria-label="Back to customers">
            <Icon.ChevronLeft s={18} />
          </button>
        )}
        <span className="eyebrow" style={{ marginLeft: showBack ? "auto" : 0 }}>
          Customer · #{g.id}
        </span>
        {!showBack && <span style={{ marginLeft: "auto" }} />}
        {onEditCustomer && (
          <button type="button" className="icon-btn" aria-label="Edit customer" onClick={() => setEditOpen(true)}>
            <Icon.Edit s={17} />
          </button>
        )}
        {onDeleteCustomer && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Delete customer"
            onClick={() => setDeleteOpen(true)}
            style={{ color: "var(--crimson)" }}
          >
            <Icon.Trash s={16} />
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
          {g.initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 28, lineHeight: 1.1 }}>{g.name}</div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--ink-3)",
              marginTop: 4,
              display: "flex",
              gap: 6,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span className={`dot dot-${g.recency}`} /> Last seen {g.last}
            <SiteTag site={g.site} subtle />
            {g.birthMonth && (
              <>
                <span style={{ opacity: 0.4 }}>·</span>
                🎂 {MONTH_NAMES[g.birthMonth - 1]}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline stage — clickable chip with inline picker.
          When the owner picks a stage, it locks (manual override).
          When unset, the daily Convex cron infers it from visit data. */}
      <div style={{ marginTop: 14, position: "relative" }}>
        <div
          className="eyebrow"
          style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}
        >
          Pipeline stage
          <span style={{ color: "var(--ink-4)", fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>
            · {stage ? "set" : "auto"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setStagePickerOpen((v) => !v)}
          className={stageMeta ? stageMeta.chip : "chip chip-ghost"}
          style={{
            cursor: "pointer",
            padding: "7px 12px",
            border: stageMeta ? "none" : "1px dashed var(--rule-2)",
          }}
        >
          {stageMeta ? stageMeta.label : "Set stage"}
          <Icon.ChevronDown s={12} />
        </button>
        {stagePickerOpen && (
          <div
            className="card fade-up"
            style={{
              marginTop: 8,
              padding: 8,
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              background: "var(--card-2)",
            }}
          >
            {STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => void updateStage(s.id)}
                className={stage === s.id ? s.chip : "chip"}
                style={{ cursor: "pointer", padding: "6px 10px" }}
                title={s.hint}
              >
                {s.label}
              </button>
            ))}
            {stage && (
              <button
                type="button"
                onClick={() => void updateStage(undefined)}
                className="chip chip-ghost"
                style={{ cursor: "pointer", padding: "6px 10px", border: "1px dashed var(--rule-2)" }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className="card"
        style={{
          marginTop: 14,
          padding: 14,
          background: "var(--terracotta-tint)",
          borderColor: "rgba(184,95,58,0.2)",
        }}
      >
        <div
          className="eyebrow"
          style={{ color: "var(--terracotta)", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon.Sparkle s={11} c="var(--terracotta)" /> Next action
        </div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.15 }}>
          {nextAction.label}
        </div>
        <div style={{ marginTop: 5, fontSize: 13.5, lineHeight: 1.45, color: "var(--ink-2)" }}>
          {nextAction.detail}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
          <button
            type="button"
            className="btn btn-terracotta"
            onClick={() => setOfferOpen(true)}
            style={{ padding: "9px 12px", fontSize: 13 }}
          >
            <Icon.Send s={13} c="#fff" /> {nextAction.cta}
          </button>
          <span className="chip">
            {g.source ? SOURCE_LABEL[g.source] : "No source"}
          </span>
        </div>
      </div>

      {g.recency === "crimson" && (
        <div
          className="card"
          style={{
            marginTop: 14,
            padding: 12,
            background: "var(--crimson-tint)",
            borderColor: "rgba(162,58,46,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Icon.AlertTriangle s={16} c="var(--crimson)" />
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
            <b>{g.last}</b> — I&apos;d say hi.
          </span>
        </div>
      )}

      {/* Primary action — send a personal offer */}
      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-terracotta"
          onClick={() => setOfferOpen(true)}
          style={{ flex: "1 1 220px" }}
        >
          <Icon.Sparkle s={14} c="#fff" /> Send a personal offer
        </button>
        {whatsappUrl(g.phone) && (
          <a href={whatsappUrl(g.phone)} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ flex: "0 0 auto" }}>
            <Icon.Send s={14} /> WhatsApp
          </a>
        )}
      </div>

      <div className="card" style={{ marginTop: 14, padding: "14px 16px", background: "var(--card-2)" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Contact
        </div>
        <div style={{ display: "grid", gap: 9, fontSize: 13.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
            <span style={{ color: "var(--ink-3)" }}>WhatsApp</span>
            <span style={{ fontWeight: 600 }}>{g.phone ?? "No number saved"}</span>
          </div>
          {g.email && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
              <span style={{ color: "var(--ink-3)" }}>Email</span>
              <span style={{ fontWeight: 600 }}>{g.email}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
            <span style={{ color: "var(--ink-3)" }}>Preferred site</span>
            <span style={{ fontWeight: 600 }}>{g.site}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
            <span style={{ color: "var(--ink-3)" }}>Tag</span>
            <span style={{ fontWeight: 600 }}>{g.tag}</span>
          </div>
        </div>
      </div>

      {/* Agentsy-noticed insights — the "real CRM" moment */}
      <div
        className="card"
        style={{
          marginTop: 18,
          padding: 16,
          background: "var(--terracotta-tint)",
          borderColor: "rgba(184,95,58,0.18)",
        }}
      >
        <div
          className="eyebrow"
          style={{ color: "var(--terracotta)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}
        >
          <Icon.Sparkle s={11} c="var(--terracotta)" /> Agentsy noticed
          <span style={{ color: "var(--ink-4)", fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>
            · {insightMode === "llm" ? "Gemini" : insightMode === "loading" ? "drafting" : "local"}
          </span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {insights.map((i, idx) => (
            <li
              key={idx}
              style={{
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "var(--ink)",
              }}
            >
              {i}
            </li>
          ))}
        </ul>
      </div>

      {/* Stats */}
      <div className="card" style={{ marginTop: 14, padding: "14px 0" }}>
        {[
          ["Lifetime visits", `${g.visits}`],
          ["Lifetime spend", `£${g.spend}`],
          ["Avg per visit", g.visits > 0 ? `£${Math.round(g.spend / g.visits)}` : "—"],
          ["Source", g.source ? SOURCE_LABEL[g.source] : "—"],
        ].map(([k, v], i, arr) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 18px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--rule)" : "none",
              fontSize: 13.5,
            }}
          >
            <span style={{ color: "var(--ink-3)" }}>{k}</span>
            <span style={{ fontFamily: "var(--serif)", fontSize: 15 }}>{v}</span>
          </div>
        ))}
      </div>

      <div
        className="card"
        style={{
          marginTop: 14,
          padding: 14,
          background: "var(--amber-tint)",
          borderColor: "rgba(184,133,50,0.3)",
        }}
      >
        <div className="eyebrow" style={{ color: "var(--amber)", marginBottom: 4 }}>
          Dietary · pinned
        </div>
        <div style={{ fontSize: 14.5, fontFamily: "var(--serif)" }}>
          No known allergies. Strong wine preferences.
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
        <span className="chip chip-terra">{g.tag}</span>
        <span className="chip">Côte de boeuf · 3x</span>
        <span className="chip">Reduces noise</span>
        <button className="chip chip-ghost" style={{ border: "1px dashed var(--rule-2)" }}>
          <Icon.Plus s={11} /> Tag
        </button>
      </div>

      <div style={{ marginTop: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Visits
        </div>
        <CustomerVisitHistory customer={g} />
      </div>

      <OfferComposer open={offerOpen} onClose={() => setOfferOpen(false)} customer={g} />
      {onEditCustomer && (
        <EditCustomerSheet
          open={editOpen}
          onClose={() => setEditOpen(false)}
          customer={g}
          onSubmit={async (next) => {
            await onEditCustomer(next);
            setEditOpen(false);
          }}
        />
      )}
      {onDeleteCustomer && (
        <DeleteCustomerSheet
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          customer={g}
          onDelete={async () => {
            await onDeleteCustomer(g);
            setDeleteOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CustomerVisitHistory({ customer }: { customer: Customer }) {
  const canQueryBackend =
    isConvexReady() &&
    !customer.id.startsWith("local-") &&
    !/^g\d+$/i.test(customer.id);

  if (canQueryBackend) {
    return <BackendVisitHistory customerId={customer.id} fallbackSite={customer.site} />;
  }

  return <FallbackVisitHistory customer={customer} />;
}

function BackendVisitHistory({
  customerId,
  fallbackSite,
}: {
  customerId: string;
  fallbackSite: string;
}) {
  const [state, setState] = React.useState<{
    loading: boolean;
    rows: Array<{
      _id: string;
      at: number;
      siteName?: string;
      party: number;
      spendCents: number;
      source: string;
      notes?: string;
      rating?: number;
      feedback?: string;
    }>;
    pendingDeployment?: boolean;
  }>({ loading: true, rows: [] });

  React.useEffect(() => {
    let active = true;
    setState({ loading: true, rows: [] });
    fetch(`/api/customers/visits?customerId=${encodeURIComponent(customerId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Could not load visits"))))
      .then((data: { visits?: typeof state.rows; pendingDeployment?: boolean }) => {
        if (!active) return;
        setState({
          loading: false,
          rows: data.visits ?? [],
          pendingDeployment: data.pendingDeployment,
        });
      })
      .catch(() => {
        if (!active) return;
        setState({ loading: false, rows: [], pendingDeployment: true });
      });
    return () => {
      active = false;
    };
  }, [customerId]);

  if (state.loading) {
    return <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Loading visit history...</div>;
  }

  if (state.rows.length === 0) {
    return (
      <div className="card" style={{ padding: 14, background: "var(--card-2)" }}>
        <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
          {state.pendingDeployment
            ? "Visit history is ready in the app, but the new Convex function still needs to be deployed."
            : "No visits logged yet. The QR visit pass in Settings will add visits here."}
        </div>
      </div>
    );
  }

  return (
    <>
      {state.rows.map((visit) => (
        <VisitRow
          key={visit._id}
          date={formatVisitDate(visit.at)}
          site={visit.siteName ?? fallbackSite}
          party={visit.party}
          spend={visit.spendCents ? `£${Math.round(visit.spendCents / 100)}` : "—"}
          notes={visit.feedback || visit.notes || (visit.rating ? `${visit.rating}/5 feedback` : visit.source)}
        />
      ))}
    </>
  );
}

function FallbackVisitHistory({ customer }: { customer: Customer }) {
  if (customer.visits === 0) {
    return (
      <div className="card" style={{ padding: 14, background: "var(--card-2)" }}>
        <div style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
          No visits logged yet. Once they scan the visit QR, their history will appear here.
        </div>
      </div>
    );
  }

  return (
    <>
      {VISIT_HISTORY.map((v) => ({ ...v, site: customer.site })).map((v) => (
        <VisitRow
          key={v.d}
          date={v.d}
          site={v.site}
          party={v.party}
          spend={v.spend}
          notes={`${v.notes} · server ${v.svr}`}
        />
      ))}
    </>
  );
}

function VisitRow({
  date,
  site,
  party,
  spend,
  notes,
}: {
  date: string;
  site: string;
  party: number;
  spend: string;
  notes: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div style={{ width: 64, fontSize: 12.5, color: "var(--ink-3)" }}>{date}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <SiteTag site={site} subtle />
            <span>party of {party}</span>
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
          {notes}
        </div>
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 14 }}>{spend}</div>
    </div>
  );
}

function formatVisitDate(at: number): string {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(at));
}

function EditCustomerSheet({
  open,
  onClose,
  customer,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  customer: Customer;
  onSubmit: (customer: Customer) => void | Promise<void>;
}) {
  const [phone, setPhone] = React.useState(customer.phone ?? "");
  const [name, setName] = React.useState(customer.name);
  const [email, setEmail] = React.useState(customer.email ?? "");
  const [tag, setTag] = React.useState(customer.tag);
  const [birthMonth, setBirthMonth] = React.useState<number | null>(customer.birthMonth ?? null);
  const [birthDay, setBirthDay] = React.useState(customer.birthDay ? String(customer.birthDay) : "");
  const [customerSource, setCustomerSource] = React.useState<CustomerSource | undefined>(customer.source);
  const [showMoreDetails, setShowMoreDetails] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const phoneRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setPhone(customer.phone ?? "");
    setName(customer.name);
    setEmail(customer.email ?? "");
    setTag(customer.tag);
    setBirthMonth(customer.birthMonth ?? null);
    setBirthDay(customer.birthDay ? String(customer.birthDay) : "");
    setCustomerSource(customer.source);
    setShowMoreDetails(true);
    setBusy(false);
    setError(null);
    if (open) setTimeout(() => phoneRef.current?.focus(), 60);
  }, [customer, open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (phone.trim() && digits.length < 9) {
      setError("That phone number looks too short.");
      return;
    }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("That email looks off — double-check or skip it.");
      return;
    }
    const month = birthMonth ?? undefined;
    const day = birthDay ? Number(birthDay) : undefined;
    if (day !== undefined && (!Number.isInteger(day) || day < 1 || day > 31)) {
      setError("Birthday day should be between 1 and 31.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        ...customer,
        initial: name.trim()[0]?.toUpperCase() ?? "?",
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        tag: tag.trim() || "Regular",
        birthMonth: month,
        birthDay: month ? day : undefined,
        source: customerSource,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this customer.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-customer-title"
    >
      <form className="sheet" onSubmit={submit}>
        <div className="sheet-handle" aria-hidden />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Customer</div>
            <h2
              id="edit-customer-title"
              style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.15, margin: 0, fontWeight: 400 }}
            >
              Edit customer
            </h2>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
              Update the same details captured when adding a customer.
            </div>
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
            <Icon.X s={18} />
          </button>
        </div>

        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="edit-phone" style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
            Phone (WhatsApp)
          </label>
          <input
            id="edit-phone"
            ref={phoneRef}
            className="big-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="07700 900123"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="field" style={{ marginBottom: 14 }}>
          <label htmlFor="edit-name" style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
            Name
          </label>
          <input
            id="edit-name"
            className="big-input"
            type="text"
            autoComplete="name"
            placeholder="First name is fine"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="edit-tag" style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
            Tag
          </label>
          <input
            id="edit-tag"
            className="input"
            placeholder="VIP, birthday treat, spice fan"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <button
            type="button"
            onClick={() => setShowMoreDetails((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "10px 12px",
              background: "transparent",
              border: "1px dashed var(--rule-2)",
              borderRadius: 10,
              color: "var(--ink-3)",
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
            }}
            aria-expanded={showMoreDetails}
          >
            <Icon.ChevronDown s={14} c="var(--ink-3)" />
            <span style={{ flex: 1 }}>Details</span>
            <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>
              Email, birthday, source
            </span>
          </button>
          {showMoreDetails && (
            <div
              style={{
                marginTop: 8,
                padding: "12px",
                background: "var(--card-2)",
                border: "1px solid var(--rule)",
                borderRadius: 12,
              }}
            >
              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="edit-email" style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  id="edit-email"
                  className="input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
                  Birthday
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 6 }}>
                  {MONTH_CHIPS.map((m, i) => {
                    const active = birthMonth === i + 1;
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => {
                          const next = birthMonth === i + 1 ? null : i + 1;
                          setBirthMonth(next);
                          if (next === null) setBirthDay("");
                        }}
                        className={active ? "chip chip-terra" : "chip"}
                        style={{
                          cursor: "pointer",
                          justifyContent: "center",
                          padding: "8px 0",
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
                {birthMonth && (
                  <div className="field" style={{ marginTop: 8 }}>
                    <label htmlFor="edit-birth-day" style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
                      Day of month
                    </label>
                    <input
                      id="edit-birth-day"
                      className="input"
                      inputMode="numeric"
                      placeholder="e.g. 14"
                      value={birthDay}
                      onChange={(e) => setBirthDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    />
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
                  Source
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SOURCES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCustomerSource((current) => (current === s.id ? undefined : s.id))}
                      className={customerSource === s.id ? "chip chip-terra" : "chip"}
                      style={{ cursor: "pointer", padding: "7px 10px" }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {(email || birthMonth || customerSource) && (
                <button
                  type="button"
                  onClick={() => {
                    setEmail("");
                    setBirthMonth(null);
                    setBirthDay("");
                    setCustomerSource(undefined);
                  }}
                  className="chip chip-ghost"
                  style={{ marginTop: 12, border: "1px dashed var(--rule-2)", cursor: "pointer" }}
                >
                  Clear optional details
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div role="alert" style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "var(--crimson-tint)", color: "var(--crimson)", fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-terracotta"
          disabled={busy}
          style={{ width: "100%", padding: "15px", marginTop: 14, fontSize: 15 }}
        >
          {busy ? "Saving..." : "Save customer"}
        </button>
      </form>
    </div>
  );
}

function DeleteCustomerSheet({
  open,
  onClose,
  customer,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  customer: Customer;
  onDelete: () => void | Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setBusy(false);
      setError(null);
    }
  }, [open]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this customer.");
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-customer-title"
    >
      <div className="sheet">
        <div className="sheet-handle" aria-hidden />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ color: "var(--crimson)", marginBottom: 4 }}>Delete customer</div>
            <h2
              id="delete-customer-title"
              style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.15, margin: 0, fontWeight: 400 }}
            >
              Remove {customer.name}?
            </h2>
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
            <Icon.X s={18} />
          </button>
        </div>

        <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 14 }}>
          This removes the customer from this customer list on this device. You can add them again later if needed.
        </div>

        {error && (
          <div role="alert" style={{ padding: "10px 12px", borderRadius: 10, background: "var(--crimson-tint)", color: "var(--crimson)", fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="btn btn-terracotta"
            style={{ flex: 1, background: "var(--crimson)" }}
          >
            <Icon.Trash s={14} c="#fff" /> {busy ? "Deleting..." : "Delete customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
