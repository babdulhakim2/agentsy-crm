import * as React from "react";
import Link from "next/link";
import { AgentsyMark } from "@/components/atoms";

// Admin lives outside the operator shell — different audience, different chrome.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      <header
        style={{
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid var(--rule)",
          background: "var(--card)",
        }}
      >
        <Link
          href="/admin"
          style={{ display: "flex", alignItems: "center", gap: 10, color: "inherit" }}
        >
          <AgentsyMark size={22} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.1 }}>Agentsy</div>
            <div
              className="tag-mono"
              style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              Platform admin
            </div>
          </div>
        </Link>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/today" className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>
            Operator view
          </Link>
        </span>
      </header>
      {children}
    </div>
  );
}
