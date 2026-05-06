// MobileSiteBar — visible only <1024px. Sticky at top so site context is
// always one tap away on phones. Hidden on desktop where the sidebar holds it.

"use client";

import * as React from "react";
import { SiteSwitcher } from "./SiteSwitcher";

interface Props {
  onAddBranch: () => void;
}

export function MobileSiteBar({ onAddBranch }: Props) {
  return (
    <div
      className="hide-desktop"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        padding: "8px 12px",
        background: "var(--paper)",
        borderBottom: "1px solid var(--rule)",
        backdropFilter: "saturate(140%) blur(6px)",
        WebkitBackdropFilter: "saturate(140%) blur(6px)",
      }}
    >
      <SiteSwitcher onAddBranch={onAddBranch} compact />
    </div>
  );
}
