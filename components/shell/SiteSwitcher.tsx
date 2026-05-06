// Site switcher — used in both the desktop sidebar and the mobile top bar.
// Lets the operator scope the entire app to one branch, see "All sites",
// or add a new branch right from the dropdown.

"use client";

import * as React from "react";
import { useSite } from "@/lib/site-context";
import { Icon } from "../icons";

interface Props {
  onAddBranch?: () => void;
  /** If true, the trigger renders compact (used in mobile top bar). */
  compact?: boolean;
}

export function SiteSwitcher({ onAddBranch, compact }: Props) {
  const { sites, activeSiteId, setActiveSiteId, activeSiteName } = useSite();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  // Close on outside click.
  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: compact ? "6px 10px" : "8px 10px",
          background: "var(--paper-2)",
          border: "1px solid var(--rule)",
          borderRadius: 999,
          fontSize: 12.5,
          color: "var(--ink)",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <Icon.Building s={13} c="var(--ink-3)" />
        <span
          style={{
            flex: 1,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {activeSiteName}
        </span>
        <Icon.ChevronDown s={12} c="var(--ink-3)" />
      </button>

      {open && (
        <div
          role="listbox"
          className="card fade-up"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            minWidth: 220,
            zIndex: 80,
            background: "var(--card-2)",
            padding: 4,
            boxShadow: "0 12px 32px rgba(26,22,18,0.14)",
          }}
        >
          <Item
            label="All sites"
            sub="Whole-business view"
            active={activeSiteId === null}
            onClick={() => {
              setActiveSiteId(null);
              setOpen(false);
            }}
          />
          {sites.map((s) => (
            <Item
              key={s.id}
              label={s.name}
              sub={s.address.split(",")[0] || "—"}
              active={activeSiteId === s.id}
              onClick={() => {
                setActiveSiteId(s.id);
                setOpen(false);
              }}
            />
          ))}
          {onAddBranch && (
            <>
              <div style={{ height: 1, background: "var(--rule)", margin: "4px 8px" }} />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAddBranch();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 8,
                  color: "var(--terracotta)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <Icon.Plus s={14} c="var(--terracotta)" w={2.4} />
                Add a branch
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Item({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="option"
      aria-selected={active}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        background: active ? "var(--terracotta-tint)" : "transparent",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: active ? "var(--terracotta)" : "var(--ink)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {sub}
        </div>
      </div>
      {active && <Icon.Check s={13} c="var(--terracotta)" />}
    </button>
  );
}
