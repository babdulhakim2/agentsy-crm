// QuickAddCustomer — service-floor capture sheet.
// Two big fields (phone + name), WhatsApp consent toggle, one-tap save.
// Falls back to a local callback when Convex isn't configured yet.

"use client";

import * as React from "react";
import { Icon } from "../icons";
import { SOURCES } from "@/lib/pipeline";
import type { CustomerSource } from "@/lib/types";

export interface QuickAddPayload {
  phone: string;
  name: string;
  consentWhatsapp: boolean;
  source: "host_stand" | "qr" | "manual" | "booking_widget";
  tags?: string[];
  /** Optional email for receipts, newsletters, future re-engagement. */
  email?: string;
  /** Optional birth month (1-12). Captured for birthday-treat campaigns. */
  birthMonth?: number;
  /** Optional acquisition channel — where they came from. */
  customerSource?: CustomerSource;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  open: boolean;
  onClose: () => void;
  onCapture?: (payload: QuickAddPayload) => void | Promise<void>;
  source?: QuickAddPayload["source"];
  defaultTags?: string[];
  title?: string;
  subtitle?: string;
}

function formatPhone(raw: string): string {
  // Display-friendly UK format. Stores raw on submit; backend normalizes.
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+44")) {
    const rest = digits.slice(3);
    return `+44 ${rest.slice(0, 4)}${rest.length > 4 ? " " + rest.slice(4, 10) : ""}`.trim();
  }
  if (digits.startsWith("0") && digits.length > 5) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return digits;
}

/**
 * POSTs to /api/customers/quick-add — that route handles the Convex mutation
 * server-side using NEXT_PUBLIC_CONVEX_URL + DEFAULT_GROUP_ID. If the route
 * returns 503 (backend not configured), we fall back to the local onCapture.
 */
async function postToBackend(payload: QuickAddPayload): Promise<{ ok: boolean; backend: boolean; error?: string }> {
  try {
    const r = await fetch("/api/customers/quick-add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (r.status === 503) return { ok: true, backend: false };
    if (!r.ok) {
      const data = await r.json().catch(() => ({ error: "Unknown error" }));
      return { ok: false, backend: true, error: data.error };
    }
    return { ok: true, backend: true };
  } catch {
    return { ok: true, backend: false };
  }
}

export function QuickAddCustomer({
  open,
  onClose,
  onCapture,
  source = "manual",
  defaultTags,
  title = "Add a customer",
  subtitle = "Two seconds. Phone, name, done.",
}: Props) {
  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [showEmail, setShowEmail] = React.useState(false);
  const [consent, setConsent] = React.useState(true);
  const [birthMonth, setBirthMonth] = React.useState<number | null>(null);
  const [showBirthMonth, setShowBirthMonth] = React.useState(false);
  const [customerSource, setCustomerSource] = React.useState<CustomerSource | null>(null);
  const [showSource, setShowSource] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const phoneRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (open) {
      setError(null);
      setDone(false);
      setTimeout(() => phoneRef.current?.focus(), 60);
    } else {
      setPhone("");
      setName("");
      setEmail("");
      setShowEmail(false);
      setConsent(true);
      setBirthMonth(null);
      setShowBirthMonth(false);
      setCustomerSource(null);
      setShowSource(false);
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Need a name, even just a first name.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) {
      setError("That phone number looks too short.");
      return;
    }

    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("That email looks off — double-check or skip it.");
      return;
    }

    setSubmitting(true);
    const payload: QuickAddPayload = {
      phone: phone.trim(),
      name: name.trim(),
      consentWhatsapp: consent,
      source,
      tags: defaultTags,
      email: email.trim() || undefined,
      birthMonth: birthMonth ?? undefined,
      customerSource: customerSource ?? undefined,
    };
    try {
      const result = await postToBackend(payload);
      if (!result.ok && result.error) {
        throw new Error(result.error);
      }
      // Whether or not Convex is wired, also call the local handler so the UI
      // updates instantly (e.g. add to demo customer list during design mode).
      await onCapture?.(payload);
      setDone(true);
      setTimeout(() => onClose(), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save — try again.");
    } finally {
      setSubmitting(false);
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
      aria-labelledby="quick-add-title"
    >
      <form className="sheet" onSubmit={handleSubmit}>
        <div className="sheet-handle" aria-hidden />
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>
              {source === "host_stand" ? "Host stand" : "Quick add"}
            </div>
            <h2
              id="quick-add-title"
              style={{
                fontFamily: "var(--serif)",
                fontSize: 24,
                lineHeight: 1.15,
                margin: 0,
                fontWeight: 400,
              }}
            >
              {title}
            </h2>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>{subtitle}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn"
            aria-label="Close"
          >
            <Icon.X s={18} />
          </button>
        </div>

        {done ? (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                background: "var(--sage-tint)",
                color: "var(--sage)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon.Check s={28} c="var(--sage)" />
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>Saved.</div>
            <div className="serif-i" style={{ color: "var(--ink-3)" }}>
              {name.split(" ")[0]} is in your customer book.
            </div>
          </div>
        ) : (
          <>
            <div className="field" style={{ marginBottom: 12 }}>
              <label
                htmlFor="qa-phone"
                style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}
              >
                Phone (WhatsApp)
              </label>
              <input
                id="qa-phone"
                ref={phoneRef}
                className="big-input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="07700 900123"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                aria-required
              />
            </div>

            <div className="field" style={{ marginBottom: 14 }}>
              <label
                htmlFor="qa-name"
                style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}
              >
                Name
              </label>
              <input
                id="qa-name"
                className="big-input"
                type="text"
                autoComplete="name"
                placeholder="First name is fine"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-required
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                background: "var(--card-2)",
                borderRadius: 12,
                border: "1px solid var(--rule)",
                marginBottom: 14,
              }}
            >
              <button
                type="button"
                onClick={() => setConsent((c) => !c)}
                className={"toggle" + (consent ? " on" : "")}
                aria-checked={consent}
                role="switch"
                aria-label="WhatsApp opt-in"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Send me WhatsApp updates</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                  Reminders, win-backs, the occasional menu drop. Easy to opt out.
                </div>
              </div>
            </div>

            {/* Optional email — collapsed by default. Encourages strong CRM coverage
                without slowing down the host-stand flow. */}
            {!showEmail ? (
              <button
                type="button"
                onClick={() => setShowEmail(true)}
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
                  marginBottom: 10,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Icon.Mail s={14} c="var(--ink-3)" />
                <span style={{ flex: 1 }}>
                  Add email (optional) — for receipts and seasonal menus
                </span>
              </button>
            ) : (
              <div className="field" style={{ marginBottom: 10 }}>
                <label
                  htmlFor="qa-email"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "var(--ink-3)",
                    marginBottom: 6,
                  }}
                >
                  Email (optional)
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmail(false);
                      setEmail("");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--ink-3)",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    Skip
                  </button>
                </label>
                <input
                  id="qa-email"
                  className="big-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            {/* Optional birth month — collapsed by default to keep capture fast */}
            {!showBirthMonth ? (
              <button
                type="button"
                onClick={() => setShowBirthMonth(true)}
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
                  marginBottom: 14,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Icon.Plus s={14} c="var(--ink-3)" />
                <span style={{ flex: 1 }}>Add birthday month (optional) — for a future treat</span>
              </button>
            ) : (
              <div
                style={{
                  padding: "10px 12px 12px",
                  background: "var(--card-2)",
                  border: "1px solid var(--rule)",
                  borderRadius: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>Birthday month</div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBirthMonth(false);
                      setBirthMonth(null);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--ink-3)",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    Skip
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                  {MONTHS.map((m, i) => {
                    const active = birthMonth === i + 1;
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setBirthMonth(i + 1)}
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
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.4 }}>
                  We&apos;ll text them a birthday treat the week of — a free starter, dessert or
                  10% off, you pick the offer in Campaigns.
                </div>
              </div>
            )}

            {/* Optional source — where did they come from? */}
            {!showSource ? (
              <button
                type="button"
                onClick={() => setShowSource(true)}
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
                  marginBottom: 14,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Icon.Tag s={14} c="var(--ink-3)" />
                <span style={{ flex: 1 }}>How did they find you? (optional)</span>
              </button>
            ) : (
              <div
                style={{
                  padding: "10px 12px 12px",
                  background: "var(--card-2)",
                  border: "1px solid var(--rule)",
                  borderRadius: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>Source</div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSource(false);
                      setCustomerSource(null);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--ink-3)",
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    Skip
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SOURCES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setCustomerSource(s.id)}
                      className={customerSource === s.id ? "chip chip-terra" : "chip"}
                      style={{ cursor: "pointer", padding: "7px 10px" }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--crimson)",
                  background: "var(--crimson-tint)",
                  padding: "10px 12px",
                  borderRadius: 10,
                  marginBottom: 12,
                }}
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-terracotta"
              style={{ width: "100%", padding: "16px", fontSize: 16 }}
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save customer"}
            </button>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-3)",
                textAlign: "center",
                marginTop: 10,
                lineHeight: 1.5,
              }}
            >
              By tapping save you confirm the customer agreed to be contacted on this number.
            </div>
          </>
        )}
      </form>
    </div>
  );
}

/** A round + button to trigger the sheet. */
export function QuickAddFab({ onClick, label = "Add customer" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="fab" onClick={onClick} aria-label={label}>
      <Icon.Plus s={26} c="#fff" w={2.5} />
    </button>
  );
}
