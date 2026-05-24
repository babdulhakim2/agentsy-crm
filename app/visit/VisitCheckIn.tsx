"use client";

import * as React from "react";
import { Icon } from "@/components/icons";

interface Props {
  groupId?: string;
  siteId?: string;
  siteName?: string;
}

interface Result {
  mode?: "convex" | "demo";
  visitCount?: number;
  rewardUnlocked?: boolean;
  visitsUntilReward?: number;
  visitsRequired?: number;
  rewardLabel?: string;
}

interface VisitContext {
  restaurantName: string;
  logoUrl?: string;
  siteName?: string;
  visitsRequired?: number;
  rewardLabel?: string;
}

interface MatchedCustomer {
  id: string;
  name: string;
  phone: string;
  birthMonth?: number;
  birthDay?: number;
  visitCount: number;
}

export function VisitCheckIn({ groupId, siteId, siteName }: Props) {
  const [context, setContext] = React.useState<VisitContext>({
    restaurantName: "Thanks for visiting",
    siteName,
  });
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [birthMonth, setBirthMonth] = React.useState<number | undefined>(undefined);
  const [birthDay, setBirthDay] = React.useState<number | undefined>(undefined);
  const [matchedCustomer, setMatchedCustomer] = React.useState<MatchedCustomer | null>(null);
  const [lookupState, setLookupState] = React.useState<"idle" | "looking" | "found" | "none">("idle");
  const [rating, setRating] = React.useState<number | undefined>(5);
  const [feedback, setFeedback] = React.useState("");
  const [consent, setConsent] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<Result | null>(null);
  const displaySiteName = context.siteName || siteName;
  const visitsRequired = result?.visitsRequired ?? context.visitsRequired ?? 3;
  const rewardLabel = result?.rewardLabel ?? context.rewardLabel ?? "20% off";

  React.useEffect(() => {
    if (!groupId) return;
    const params = new URLSearchParams({ groupId });
    if (siteId) params.set("siteId", siteId);
    fetch(`/api/visits/context?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: VisitContext | null) => {
        if (!data) return;
        setContext({
          restaurantName: data.restaurantName || "Thanks for visiting",
          logoUrl: data.logoUrl,
          siteName: data.siteName || siteName,
          visitsRequired: data.visitsRequired ?? 3,
          rewardLabel: data.rewardLabel || "20% off",
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
      setError("Add your name so the visit can count.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 9) {
      setError("Add a WhatsApp number so we can count your visits.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/visits/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          siteId,
          name,
          phone,
          rating,
          feedback,
          consentWhatsapp: consent,
          birthMonth,
          birthDay,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not log this visit.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log this visit.");
    } finally {
      setSaving(false);
    }
  };

  const visitCount = result?.visitCount ?? 0;
  const visitsUntilReward = result?.visitsUntilReward ?? 2;

  return (
    <main className="screen-bleed paper-grain" style={{ minHeight: "100dvh", padding: 18 }}>
      <div style={{ maxWidth: 460, margin: "0 auto", paddingTop: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <VisitBrandMark name={context.restaurantName} logoUrl={context.logoUrl} />
          <div>
            <div className="eyebrow">Agentsy visit pass</div>
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

        <div
          className="card"
          style={{
            padding: 18,
            background: "var(--terracotta-tint)",
            borderColor: "rgba(184,95,58,0.18)",
            marginBottom: 14,
          }}
        >
          <div className="eyebrow" style={{ color: "var(--terracotta)", marginBottom: 6 }}>
            Loyalty
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 26, lineHeight: 1.1 }}>
            {visitsRequired} visits unlock {rewardLabel}.
          </div>
          <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.45, marginTop: 8 }}>
            Log this visit, leave quick feedback, and the restaurant can look after you properly next time.
          </div>
        </div>

        {result ? (
          <div className="card" style={{ padding: 22, textAlign: "center" }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--sage-tint)",
                marginBottom: 12,
              }}
            >
              <Icon.Check s={30} c="var(--sage)" />
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 26 }}>
              Visit logged.
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5, marginTop: 8 }}>
              {result.rewardUnlocked
                ? `You have unlocked ${rewardLabel} on your next visit. Show this screen at the till.`
                : `You are on visit ${visitCount}. ${visitsUntilReward} more to unlock ${rewardLabel}.`}
            </div>
            {result.mode === "demo" && (
              <div className="chip" style={{ marginTop: 14 }}>
                Demo mode
              </div>
            )}
          </div>
        ) : (
          <form className="card" style={{ padding: 18 }} onSubmit={submit}>
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="visit-phone">WhatsApp number</label>
              <input
                id="visit-phone"
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
                Checking your visit history...
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
                    {matchedCustomer.visitCount > 0
                      ? `${matchedCustomer.visitCount} previous visit${matchedCustomer.visitCount === 1 ? "" : "s"}`
                      : "Customer found"}
                  </div>
                </div>
              </button>
            )}
            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="visit-name">Name</label>
              <input
                id="visit-name"
                className="big-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="First name is fine"
                autoComplete="name"
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
                How was it today?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={rating === n ? "chip chip-terra" : "chip"}
                    style={{ justifyContent: "center", padding: "9px 0", cursor: "pointer" }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="visit-feedback">Quick feedback</label>
              <textarea
                id="visit-feedback"
                className="textarea"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Anything we should know?"
                style={{ minHeight: 86 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
                Birthday discounts
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)", gap: 8 }}>
                <select
                  className="select"
                  value={birthMonth ?? ""}
                  onChange={(event) => {
                    const next = event.target.value ? Number(event.target.value) : undefined;
                    setBirthMonth(next);
                    if (!next) setBirthDay(undefined);
                  }}
                  aria-label="Birthday month"
                >
                  <option value="">Month optional</option>
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  className="select"
                  value={birthDay ?? ""}
                  onChange={(event) => setBirthDay(event.target.value ? Number(event.target.value) : undefined)}
                  disabled={!birthMonth}
                  aria-label="Birthday day"
                >
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 5 }}>
                Add it if you want birthday rewards from the restaurant.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "10px 0",
                marginBottom: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setConsent((v) => !v)}
                className={"toggle" + (consent ? " on" : "")}
                aria-label="WhatsApp consent"
                aria-checked={consent}
                role="switch"
              />
              <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.35 }}>
                I am happy to receive WhatsApp updates about rewards and offers.
              </div>
            </div>

            {error && (
              <div role="alert" className="chip chip-crimson" style={{ marginBottom: 12, whiteSpace: "normal" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-terracotta" disabled={saving} style={{ width: "100%", padding: 15 }}>
              {saving ? "Logging visit..." : "Log my visit"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function VisitBrandMark({
  name,
  logoUrl,
  size = 44,
}: {
  name: string;
  logoUrl?: string;
  size?: number;
}) {
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
