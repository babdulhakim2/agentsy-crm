// Generic bottom-sheet / modal wrapper. All form modals reuse this.

"use client";

import * as React from "react";
import { Icon } from "../icons";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  maxWidth?: number;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, title, eyebrow, subtitle, maxWidth = 520, children }: Props) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="sheet-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet" style={{ maxWidth }}>
        <div className="sheet-handle" aria-hidden />
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 14, gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {eyebrow && (
              <div className="eyebrow" style={{ marginBottom: 4 }}>
                {eyebrow}
              </div>
            )}
            <h2
              id="sheet-title"
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
            {subtitle && (
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>{subtitle}</div>
            )}
          </div>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close">
            <Icon.X s={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, htmlFor, children, hint }: FieldProps) {
  return (
    <div className="field" style={{ marginBottom: 12 }}>
      <label htmlFor={htmlFor} style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.4 }}>{hint}</div>
      )}
    </div>
  );
}
