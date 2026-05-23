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
}

export function VisitCheckIn({ groupId, siteId, siteName }: Props) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [rating, setRating] = React.useState<number | undefined>(5);
  const [feedback, setFeedback] = React.useState("");
  const [consent, setConsent] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<Result | null>(null);

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
          <div className="avatar" style={{ background: "var(--terracotta)", color: "#fff" }}>
            A
          </div>
          <div>
            <div className="eyebrow">Agentsy visit pass</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 24, lineHeight: 1.1 }}>
              {siteName || "Thanks for visiting"}
            </div>
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
            3 visits unlock 20% off.
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
                ? "You have unlocked 20% off your next visit. Show this screen at the till."
                : `You are on visit ${visitCount}. ${visitsUntilReward} more to unlock 20% off.`}
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
