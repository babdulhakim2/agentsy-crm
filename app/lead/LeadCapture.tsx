"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import type { CustomerSource } from "@/lib/types";

interface Props {
  groupId?: string;
  siteId?: string;
  siteName?: string;
}

interface LeadContext {
  restaurantName: string;
  logoUrl?: string;
  siteName?: string;
}

interface MatchedCustomer {
  id: string;
  name: string;
  phone: string;
  birthMonth?: number;
  birthDay?: number;
  visitCount: number;
}

const MONTH_CHIPS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LEAD_SOURCES: Array<{ id: CustomerSource; label: string }> = [
  { id: "delivery", label: "Delivery" },
  { id: "referral", label: "Friend" },
  { id: "instagram", label: "Instagram" },
  { id: "google", label: "Google" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "event", label: "Event" },
  { id: "outreach", label: "Met staff" },
  { id: "other", label: "Other" },
];

export function LeadCapture({ groupId, siteId, siteName }: Props) {
  const [context, setContext] = React.useState<LeadContext>({
    restaurantName: "Join our customer list",
    siteName,
  });
  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [source, setSource] = React.useState<CustomerSource>("delivery");
  const [notes, setNotes] = React.useState("");
  const [birthMonth, setBirthMonth] = React.useState<number | undefined>();
  const [birthDay, setBirthDay] = React.useState<number | undefined>();
  const [consent, setConsent] = React.useState(true);
  const [matchedCustomer, setMatchedCustomer] = React.useState<MatchedCustomer | null>(null);
  const [lookupState, setLookupState] = React.useState<"idle" | "looking" | "found" | "none">("idle");
  const [showMore, setShowMore] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState<{ mode?: "convex" | "demo"; created?: boolean } | null>(null);
  const displaySiteName = context.siteName || siteName;

  React.useEffect(() => {
    if (!groupId) return;
    const params = new URLSearchParams({ groupId });
    if (siteId) params.set("siteId", siteId);
    fetch(`/api/visits/context?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LeadContext | null) => {
        if (!data) return;
        setContext({
          restaurantName: data.restaurantName || "Join our customer list",
          logoUrl: data.logoUrl,
          siteName: data.siteName || siteName,
        });
      })
      .catch(() => {
        /* keep URL-provided fallback */
      });
  }, [groupId, siteId, siteName]);

  React.useEffect(() => {
    const digits = phone.replace(/\D/g, "");
    setMatchedCustomer(null);
    if (!groupId || digits.length < 7) {
      setLookupState("idle");
      return;
    }

    const controller = new AbortController();
    setLookupState("looking");
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ groupId, phone });
      fetch(`/api/visits/lookup?${params.toString()}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("lookup failed"))))
        .then((data: { customer?: MatchedCustomer | null }) => {
          const customer = data.customer ?? null;
          setMatchedCustomer(customer);
          setLookupState(customer ? "found" : "none");
          if (customer) {
            setName((current) => current || customer.name);
            setBirthMonth((current) => current ?? customer.birthMonth);
            setBirthDay((current) => current ?? customer.birthDay);
          }
        })
        .catch((err) => {
          if ((err as Error).name !== "AbortError") setLookupState("idle");
        });
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [groupId, phone]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Add your name so the restaurant knows who to contact.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 9) {
      setError("Add a WhatsApp number so the restaurant can reach you.");
      return;
    }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("That email looks off. Double-check it or leave it blank.");
      return;
    }
    if (birthMonth && birthDay && (birthDay < 1 || birthDay > 31)) {
      setError("Birthday day should be between 1 and 31.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/leads/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          siteId,
          name,
          phone,
          email,
          address,
          notes,
          customerSource: source,
          consentWhatsapp: consent,
          birthMonth,
          birthDay,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save your details.");
      setSaved(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="screen-bleed paper-grain" style={{ minHeight: "100dvh", padding: 18 }}>
      <div style={{ maxWidth: 460, margin: "0 auto", paddingTop: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <LeadBrandMark name={context.restaurantName} logoUrl={context.logoUrl} />
          <div>
            <div className="eyebrow">Customer loyalty</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.1 }}>
              {context.restaurantName}
            </div>
            {displaySiteName && (
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>
                {displaySiteName}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 18, background: "var(--terracotta-tint)", borderColor: "rgba(184,95,58,0.18)", marginBottom: 14 }}>
          <div className="eyebrow" style={{ color: "var(--terracotta)", marginBottom: 6 }}>
            Join the list
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 26, lineHeight: 1.1 }}>
            Get personal offers, delivery updates and birthday treats.
          </div>
        </div>

        {saved ? (
          <div className="card" style={{ padding: 22, textAlign: "center" }}>
            <div style={{ width: 58, height: 58, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--sage-tint)", marginBottom: 12 }}>
              <Icon.Check s={30} c="var(--sage)" />
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 26 }}>
              You are on the list.
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 8 }}>
              {saved.created === false
                ? "We updated your customer profile."
                : "The restaurant saved your details for future offers and updates."}
            </div>
            {saved.mode === "demo" && (
              <div className="chip" style={{ marginTop: 14 }}>
                Demo mode
              </div>
            )}
          </div>
        ) : (
          <form className="card" style={{ padding: 18 }} onSubmit={submit}>
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="lead-phone">WhatsApp number</label>
              <input
                id="lead-phone"
                className="big-input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="07700 900123"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            {lookupState === "looking" && (
              <div className="chip" style={{ marginBottom: 12 }}>
                Checking customer list...
              </div>
            )}
            {matchedCustomer && (
              <button
                type="button"
                className="radio-card selected"
                onClick={() => {
                  setName(matchedCustomer.name);
                  setBirthMonth(matchedCustomer.birthMonth);
                  setBirthDay(matchedCustomer.birthDay);
                }}
                style={{ width: "100%", textAlign: "left", marginBottom: 12 }}
              >
                <div className="ring" />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{matchedCustomer.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                    Existing customer found
                  </div>
                </div>
              </button>
            )}

            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="lead-name">Name</label>
              <input
                id="lead-name"
                className="big-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="First name is fine"
                autoComplete="name"
              />
            </div>

            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="lead-address">Delivery address</label>
              <textarea
                id="lead-address"
                className="textarea"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Optional, for delivery customers"
                autoComplete="street-address"
                style={{ minHeight: 84 }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
                How did you hear about us?
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {LEAD_SOURCES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSource(item.id)}
                    className={source === item.id ? "chip chip-terra" : "chip"}
                    style={{ cursor: "pointer", padding: "8px 11px" }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="chip chip-ghost"
              onClick={() => setShowMore((value) => !value)}
              style={{ border: "1px dashed var(--rule-2)", marginBottom: 12, cursor: "pointer" }}
              aria-expanded={showMore}
            >
              <Icon.ChevronDown s={13} /> Optional details
            </button>

            {showMore && (
              <div style={{ padding: 12, border: "1px solid var(--rule)", borderRadius: 12, background: "var(--card-2)", marginBottom: 12 }}>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label htmlFor="lead-email">Email</label>
                  <input
                    id="lead-email"
                    className="input"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
                    Birthday discounts
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 6 }}>
                    {MONTH_CHIPS.map((month, index) => {
                      const active = birthMonth === index + 1;
                      return (
                        <button
                          key={month}
                          type="button"
                          onClick={() => {
                            const next = active ? undefined : index + 1;
                            setBirthMonth(next);
                            if (!next) setBirthDay(undefined);
                          }}
                          className={active ? "chip chip-terra" : "chip"}
                          style={{ cursor: "pointer", justifyContent: "center", padding: "8px 0" }}
                        >
                          {month}
                        </button>
                      );
                    })}
                  </div>
                  {birthMonth && (
                    <div className="field" style={{ marginTop: 8 }}>
                      <label htmlFor="lead-birth-day">Day of month</label>
                      <input
                        id="lead-birth-day"
                        className="input"
                        inputMode="numeric"
                        placeholder="e.g. 14"
                        value={birthDay ?? ""}
                        onChange={(event) => {
                          const next = event.target.value.replace(/\D/g, "").slice(0, 2);
                          setBirthDay(next ? Number(next) : undefined);
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="lead-notes">Anything useful?</label>
                  <textarea
                    id="lead-notes"
                    className="textarea"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Dietary needs, best time to deliver, or who referred you"
                    style={{ minHeight: 78 }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", marginBottom: 10 }}>
              <button
                type="button"
                onClick={() => setConsent((value) => !value)}
                className={"toggle" + (consent ? " on" : "")}
                aria-label="WhatsApp consent"
                aria-checked={consent}
                role="switch"
              />
              <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.35 }}>
                I am happy to receive WhatsApp updates about offers and loyalty rewards.
              </div>
            </div>

            {error && (
              <div role="alert" className="chip chip-crimson" style={{ marginBottom: 12, whiteSpace: "normal" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-terracotta" disabled={saving} style={{ width: "100%", padding: 15 }}>
              {saving ? "Saving..." : "Join loyalty list"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function LeadBrandMark({ name, logoUrl, size = 44 }: { name: string; logoUrl?: string; size?: number }) {
  const [failed, setFailed] = React.useState(false);
  const letter = name.replace(/^the\s+/i, "").charAt(0).toUpperCase() || "R";
  React.useEffect(() => setFailed(false), [logoUrl]);

  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: Math.max(10, size * 0.24),
        background: "var(--terracotta)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "var(--serif)",
        fontSize: size * 0.48,
        flexShrink: 0,
        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 4px 10px rgba(26,22,18,0.10)",
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
