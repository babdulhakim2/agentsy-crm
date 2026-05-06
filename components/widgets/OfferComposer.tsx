// OfferComposer — small modal sheet to send a personal offer in WhatsApp.
// Pick an offer, edit the message, send. Demo-mode falls back to local state.

"use client";

import * as React from "react";
import { Icon } from "../icons";
import type { Customer } from "@/lib/types";

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
  return `${first} — quick one. We&apos;ve missed you and want to say so. Next time you&apos;re in, a ${offer.voucher} on the house — just show this message at the till. — Juliet`
    .replace("&apos;", "'");
}

export function OfferComposer({ open, onClose, customer }: Props) {
  const [offerId, setOfferId] = React.useState(OFFERS[2].id);
  const [body, setBody] = React.useState("");
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDone(false);
      const offer = OFFERS.find((o) => o.id === offerId) ?? OFFERS[0];
      setBody(buildDraft(customer, offer));
    }
  }, [open, offerId, customer]);

  const handleOfferChange = (id: string) => {
    setOfferId(id);
    const offer = OFFERS.find((o) => o.id === id) ?? OFFERS[0];
    setBody(buildDraft(customer, offer));
  };

  const handleSend = () => {
    setDone(true);
    setTimeout(onClose, 1000);
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
            <div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>Sent.</div>
            <div className="serif-i" style={{ color: "var(--ink-3)" }}>
              {customer.name.split(" ")[0]} will get this on WhatsApp.
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
              <span>Message · in your voice</span>
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

            <button
              type="button"
              className="btn btn-terracotta"
              onClick={handleSend}
              style={{ width: "100%", padding: "16px", fontSize: 16 }}
            >
              <Icon.Send s={16} c="#fff" /> Send WhatsApp
            </button>
          </>
        )}
      </div>
    </div>
  );
}
