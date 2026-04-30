// Shared atoms — AgentsyMark, ProviderMark, StarRow, SectionHeader, Avatar.

import * as React from "react";
import { Icon } from "./icons";

export function AgentsyMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="15" stroke="#b85f3a" strokeWidth="1.5" />
      <path
        d="M10 22 L16 8 L22 22 M12.5 17 H19.5"
        stroke="#b85f3a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PROVIDER_MAP: Record<string, { letter: string; bg: string; fg: string }> = {
  ResDiary: { letter: "R", bg: "#e9d5cc", fg: "#a23a2e" },
  "Access Collins": { letter: "C", bg: "#dde1d3", fg: "#5a6a3f" },
  OpenTable: { letter: "O", bg: "#f0d8c5", fg: "#b85f3a" },
  SevenRooms: { letter: "7", bg: "#e3d8c0", fg: "#3a342c" },
  "Eat App": { letter: "E", bg: "#f0e3c4", fg: "#b88532" },
  Other: { letter: "+", bg: "#ede5d3", fg: "#6b6258" },
  Square: { letter: "◻", bg: "#dee5e8", fg: "#3e5b6e" },
  Lightspeed: { letter: "L", bg: "#e3d8c0", fg: "#a23a2e" },
  Toast: { letter: "T", bg: "#f0d8c5", fg: "#b85f3a" },
  "Google Business Profile": { letter: "G", bg: "#fbf7ef", fg: "#b88532" },
  WhatsApp: { letter: "◉", bg: "#d8ddc9", fg: "#5a6a3f" },
  Instagram: { letter: "⊙", bg: "#f1ddd0", fg: "#b85f3a" },
  Email: { letter: "@", bg: "#ede5d3", fg: "#3a342c" },
};

export function ProviderMark({ name, size = 36 }: { name: string; size?: number }) {
  const m = PROVIDER_MAP[name] ?? PROVIDER_MAP.Other;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 9,
        background: m.bg,
        color: m.fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--serif)",
        fontWeight: 500,
        fontSize: size * 0.46,
        flexShrink: 0,
        border: "1px solid rgba(26,22,18,0.06)",
      }}
      aria-hidden
    >
      {m.letter}
    </div>
  );
}

export function StarRow({ value, size = 13, color = "#b88532" }: { value: number; size?: number; color?: string }) {
  return (
    <div style={{ display: "inline-flex", gap: 1.5 }} aria-label={`${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon.Star key={i} s={size} c={i <= value ? color : "rgba(26,22,18,0.18)"} filled={i <= value} w={1.4} />
      ))}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  count?: string | number;
  expanded?: boolean;
  onClick?: () => void;
}

export function SectionHeader({ title, count, expanded = true, onClick }: SectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`section-header${expanded ? "" : " collapsed"}`}
      aria-expanded={expanded}
    >
      <span className="chev">
        <Icon.ChevronDown s={14} w={2} />
      </span>
      <span className="label">{title}</span>
      {count !== undefined && (
        <span className="tag-mono" style={{ fontVariantNumeric: "tabular-nums" }}>
          {count}
        </span>
      )}
    </button>
  );
}

export function HealthPill({ status }: { status: "green" | "amber" | "red" }) {
  const map = {
    green: { bg: "var(--sage-tint)", fg: "var(--sage)", dot: "sage", label: "Healthy" },
    amber: { bg: "var(--amber-tint)", fg: "var(--amber)", dot: "amber", label: "Stale" },
    red: { bg: "var(--crimson-tint)", fg: "var(--crimson)", dot: "crimson", label: "Broken" },
  } as const;
  const m = map[status];
  return (
    <span className="health" style={{ background: m.bg, color: m.fg, border: "none" }}>
      <span className={`dot dot-${m.dot}`} />
      {m.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: "sending" | "scheduled" | "sent" | "paused" }) {
  const cls =
    status === "sending"
      ? "chip chip-amber"
      : status === "sent"
        ? "chip chip-sage"
        : status === "paused"
          ? "chip chip-crimson"
          : "chip";
  return (
    <span className={cls}>
      {status === "sending" && <span className="dot dot-amber" />}
      {status}
    </span>
  );
}
