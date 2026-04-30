"use client";

import * as React from "react";
import { Icon } from "../icons";
import type { Thread } from "@/lib/types";

interface Props {
  thread: Thread;
  onBack?: () => void;
  showBack?: boolean;
}

export function ThreadView({ thread, onBack, showBack }: Props) {
  return (
    <>
      <div
        style={{
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--rule)",
          background: "var(--card-2)",
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        {showBack && (
          <button type="button" onClick={onBack} className="icon-btn" aria-label="Back to inbox">
            <Icon.ChevronLeft s={18} />
          </button>
        )}
        <div className="avatar">{thread.name[0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>{thread.name}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
            WhatsApp · 24h window: 18h left
          </div>
        </div>
        <button type="button" className="icon-btn" aria-label="Call">
          <Icon.Phone s={16} />
        </button>
      </div>

      <div
        className="chat-bg"
        style={{
          flex: 1,
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minHeight: "60vh",
        }}
      >
        <div className="chat-bubble">
          Hi! Could I move my Saturday booking to 8pm instead of 7? Three of us.
          <div className="chat-time">10:32</div>
        </div>
        <div className="chat-bubble me">
          Hi {thread.name.split(" ")[0]} — yes, you&apos;re moved to 8pm Saturday for 3. See you then.
          <div className="chat-time">10:33 ✓✓</div>
        </div>
        <div
          style={{
            alignSelf: "center",
            fontSize: 11,
            color: "var(--ink-3)",
            background: "rgba(255,255,255,0.6)",
            padding: "3px 10px",
            borderRadius: 999,
          }}
        >
          <span className="serif-i">I drafted that one. Maya approved.</span>
        </div>
        <div className="chat-bubble">
          Perfect, thanks. Also — is the chef&apos;s tasting still running?
          <div className="chat-time">10:35</div>
        </div>
        <div style={{ alignSelf: "center", fontSize: 11, color: "var(--terracotta)", padding: "6px 10px" }}>
          <Icon.Sparkle s={11} c="var(--terracotta)" /> Suggested reply, tap to send
        </div>
        <div
          className="chat-bubble"
          style={{ border: "1.5px dashed var(--terracotta)", background: "var(--terracotta-tint)" }}
        >
          Yes — runs Wednesday and Thursday this week. £65 a head, 7 courses. Want me to add it to your Saturday booking?
          <div className="chat-time">draft</div>
        </div>
      </div>

      <div
        style={{
          padding: "10px 12px max(18px, env(safe-area-inset-bottom))",
          background: "var(--card-2)",
          borderTop: "1px solid var(--rule)",
          display: "flex",
          gap: 8,
          alignItems: "center",
          position: "sticky",
          bottom: 0,
        }}
      >
        <button type="button" className="icon-btn" aria-label="Add attachment">
          <Icon.Plus s={18} />
        </button>
        <input
          className="input"
          placeholder="Message"
          style={{ flex: 1, borderRadius: 999, padding: "10px 14px" }}
          aria-label="Message"
        />
        <button
          type="button"
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            border: "none",
            background: "var(--terracotta)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Send"
        >
          <Icon.Send s={16} c="#fff" />
        </button>
      </div>
    </>
  );
}
