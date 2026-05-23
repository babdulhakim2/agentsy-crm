// OfferComposer — small modal sheet to send a personal offer in WhatsApp.
// Pick an offer, edit the message, send. Demo-mode falls back to local state.

"use client";

import * as React from "react";
import { Icon } from "../icons";
import type { Customer } from "@/lib/types";
import { nextActionForCustomer, stageForCustomer } from "@/lib/pipeline";

interface Props {
  open: boolean;
  onClose: () => void;
  customer: Customer;
}

const OFFERS: { id: string; label: string; voucher: string }[] = [
  { id: "starter", label: "Free starter", voucher: "free starter on us" },
  { id: "dessert", label: "Free dessert", voucher: "free dessert of your choice" },
  { id: "tenpct", label: "10% off the bill", voucher: "10% off your next visit" },
  { id: "bubble", label: "Free bubble tea", voucher: "free bubble tea" },
  { id: "tasting", label: "Free tasting plate", voucher: "free tasting plate" },
];

function buildDraft(customer: Customer, offer: typeof OFFERS[number]): string {
  const first = customer.name.split(" ")[0];
  if (customer.visits === 0 || stageForCustomer(customer) === "lead") {
    return `Hi ${first}, lovely to meet you. If you fancy trying us, show this message next time you come in and we'll sort ${offer.voucher}.`;
  }
  return `${first} — quick one. We've missed you and want to say so. Next time you're in, ${offer.voucher} on the house. Just show this message at the till.`;
}

function buildWhatsAppUrl(phone: string, body: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
}

export function OfferComposer({ open, onClose, customer }: Props) {
  const [offerId, setOfferId] = React.useState(OFFERS[2].id);
  const [body, setBody] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [drafting, setDrafting] = React.useState(false);
  const [draftMode, setDraftMode] = React.useState<"llm" | "fallback">("fallback");

  React.useEffect(() => {
    if (open) {
      setDone(false);
      setCopied(false);
      setError(null);
      setDraftMode("fallback");
      const offer = OFFERS.find((o) => o.id === offerId) ?? OFFERS[0];
      const fallback = buildDraft(customer, offer);
      setBody(fallback);
      setDrafting(true);

      let active = true;
      fetch("/api/ai/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "message",
          customer,
          offer,
          nextAction: nextActionForCustomer(customer),
          restaurant: { name: "New Wok's Cooking" },
        }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("AI draft failed"))))
        .then((data: { message?: string; mode?: "llm" | "fallback" }) => {
          if (!active) return;
          if (data.message) setBody(data.message);
          setDraftMode(data.mode ?? "fallback");
        })
        .catch(() => {
          if (!active) return;
          setBody(fallback);
          setDraftMode("fallback");
        })
        .finally(() => {
          if (active) setDrafting(false);
        });

      return () => {
        active = false;
      };
    }
  }, [open, offerId, customer]);

  const handleOfferChange = (id: string) => {
    setOfferId(id);
    const offer = OFFERS.find((o) => o.id === id) ?? OFFERS[0];
    setBody(buildDraft(customer, offer));
  };

  const handleSend = async () => {
    setError(null);
    const trimmed = body.trim();
    if (!trimmed) {
      setError("Write a message before sending.");
      return;
    }

    if (customer.phone) {
      window.open(buildWhatsAppUrl(customer.phone, trimmed), "_blank", "noopener,noreferrer");
      setCopied(false);
      setDone(true);
      setTimeout(onClose, 1100);
      return;
    }

    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      setDone(true);
      setTimeout(onClose, 1100);
    } catch {
      setError("No phone number saved. Copy the message manually or add the customer's phone.");
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
    >
      <div className="sheet" style={{ maxWidth: 520 }}>
        <div className="sheet-handle" aria-hidden />
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14, gap: 10 }}>
          <div className="avatar">{customer.initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow">Send personal offer · customer</div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: 22,
                lineHeight: 1.15,
                margin: 0,
                fontWeight: 400,
              }}
            >
              {customer.name}
            </h2>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
              {customer.phone ? `WhatsApp ${customer.phone}` : "No WhatsApp number saved"}
            </div>
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
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
              <Icon.Send s={24} c="var(--sage)" />
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>
              {copied ? "Copied." : "Opened WhatsApp."}
            </div>
            <div className="serif-i" style={{ color: "var(--ink-3)" }}>
              {copied
                ? "Paste the message into WhatsApp once a number is added."
                : `${customer.name.split(" ")[0]}'s message is ready to send.`}
            </div>
          </div>
        ) : (
          <>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Pick an offer
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
              {OFFERS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => handleOfferChange(o.id)}
                  className={offerId === o.id ? "chip chip-terra" : "chip"}
                  style={{ cursor: "pointer", padding: "7px 12px" }}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="eyebrow" style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon.Sparkle s={11} c="var(--terracotta)" />
              <span>
                Message · {drafting ? "drafting with Gemini" : draftMode === "llm" ? "Gemini draft" : "local draft"}
              </span>
            </div>
            <textarea
              className="textarea"
              style={{ minHeight: 120, fontSize: 14, marginBottom: 10 }}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label="Offer message"
            />

            <div
              style={{
                fontSize: 11.5,
                color: "var(--ink-3)",
                marginBottom: 14,
                lineHeight: 1.4,
              }}
            >
              Voucher is text-only. They show this WhatsApp at the till; staff apply it manually.
              Tracked in their profile so you don&apos;t double-send.
            </div>

            {error && (
              <div className="chip chip-crimson" style={{ marginBottom: 10, whiteSpace: "normal" }}>
                {error}
              </div>
            )}

            <button
              type="button"
              className="btn btn-terracotta"
              onClick={handleSend}
              style={{ width: "100%", padding: "16px", fontSize: 16 }}
            >
              <Icon.Send s={16} c="#fff" /> {customer.phone ? "Open WhatsApp" : "Copy message"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
