// ConnectSheet — opens when the operator taps a marketplace tile.
// Tells them what we'll pull, what permissions, then routes to the right
// onboarding (OAuth start, API key entry, or manual setup).

"use client";

import * as React from "react";
import { Sheet, Field } from "./Sheet";
import { Icon } from "../icons";
import { ProviderMark } from "../atoms";

type Mode = "oauth" | "api_key" | "manual";

interface ProviderInfo {
  name: string;
  mode: Mode;
  blurb: string;
  fields?: Array<{ id: string; label: string; placeholder: string; hint?: string }>;
  oauthHint?: string;
}

const PROVIDERS: Record<string, ProviderInfo> = {
  "Google Business Profile": {
    name: "Google Business Profile",
    mode: "oauth",
    blurb: "Pull reviews and post replies in your voice. We never auto-publish until you opt in.",
    oauthHint: "We'll bounce you to Google to consent — takes about 30 seconds.",
  },
  Trustpilot: {
    name: "Trustpilot",
    mode: "api_key",
    blurb: "Sync Trustpilot reviews and post replies. Requires a Business API key + secret.",
    fields: [
      { id: "apiKey", label: "API key", placeholder: "Trustpilot API key" },
      { id: "apiSecret", label: "API secret", placeholder: "Trustpilot API secret" },
      {
        id: "businessUnitId",
        label: "Business Unit ID",
        placeholder: "abc123",
        hint: "Find this on your Trustpilot business dashboard.",
      },
    ],
  },
  ResDiary: {
    name: "ResDiary",
    mode: "oauth",
    blurb: "Pull bookings, customers and dietary notes. We don't push edits back at MVP.",
    oauthHint: "OAuth flow opens in a new tab.",
  },
  "Access Collins": {
    name: "Access Collins",
    mode: "api_key",
    blurb: "Bookings, customers, payments. Find your API key in Collins admin.",
    fields: [{ id: "apiKey", label: "Collins API key", placeholder: "ck_..." }],
  },
  WhatsApp: {
    name: "WhatsApp Business API",
    mode: "manual",
    blurb:
      "Set the access token, phone number ID and webhook verify token in your Convex env vars (we wire the rest).",
  },
  Square: {
    name: "Square",
    mode: "oauth",
    blurb: "Spend data per customer. Skippable if you don't have a modern till.",
  },
};

interface Props {
  provider: string | null;
  onClose: () => void;
}

export function ConnectSheet({ provider, onClose }: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>({});

  const info = provider ? PROVIDERS[provider] : null;

  React.useEffect(() => {
    if (!provider) {
      setSubmitting(false);
      setDone(false);
      setValues({});
    }
  }, [provider]);

  if (!provider || !info) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Real flow: POST to /api/connections/[provider]/connect with `values`,
    // backend calls trustpilot.connect or initiates OAuth.
    // For demo: just simulate success.
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    setDone(true);
    setTimeout(onClose, 900);
  };

  return (
    <Sheet
      open={!!provider}
      onClose={onClose}
      eyebrow="Connect"
      title={info.name}
      subtitle={info.blurb}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <ProviderMark name={provider} size={48} />
      </div>

      {done ? (
        <div style={{ padding: "16px 0", textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              background: "var(--sage-tint)",
              color: "var(--sage)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <Icon.Check s={22} c="var(--sage)" />
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 20 }}>Connected.</div>
          <div className="serif-i" style={{ color: "var(--ink-3)", marginTop: 4 }}>
            First sync runs in the next minute.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {info.mode === "oauth" && (
            <>
              <div
                style={{
                  padding: 14,
                  background: "var(--card-2)",
                  border: "1px solid var(--rule)",
                  borderRadius: 12,
                  marginBottom: 14,
                  fontSize: 13,
                  color: "var(--ink-2)",
                  lineHeight: 1.5,
                }}
              >
                {info.oauthHint}
              </div>
              <button
                type="submit"
                className="btn btn-terracotta"
                style={{ width: "100%", padding: "14px", fontSize: 15 }}
                disabled={submitting}
              >
                {submitting ? "Opening…" : `Continue to ${provider}`}
              </button>
            </>
          )}

          {info.mode === "api_key" && info.fields && (
            <>
              {info.fields.map((f) => (
                <Field key={f.id} label={f.label} htmlFor={`c-${f.id}`} hint={f.hint}>
                  <input
                    id={`c-${f.id}`}
                    className="input"
                    placeholder={f.placeholder}
                    value={values[f.id] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.id]: e.target.value }))
                    }
                  />
                </Field>
              ))}
              <button
                type="submit"
                className="btn btn-terracotta"
                style={{ width: "100%", padding: "14px", fontSize: 15, marginTop: 6 }}
                disabled={submitting}
              >
                {submitting ? "Connecting…" : "Connect & sync"}
              </button>
            </>
          )}

          {info.mode === "manual" && (
            <div
              style={{
                padding: 14,
                background: "var(--amber-tint)",
                border: "1px solid rgba(184,133,50,0.3)",
                borderRadius: 12,
                fontSize: 13,
                color: "var(--ink-2)",
                lineHeight: 1.5,
              }}
            >
              See INTEGRATIONS.md for the env vars you need to set with{" "}
              <code style={{ fontFamily: "var(--mono)", fontSize: 12 }}>npx convex env set</code>.
            </div>
          )}
        </form>
      )}
    </Sheet>
  );
}
