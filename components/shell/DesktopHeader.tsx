import * as React from "react";

interface Props {
  eyebrow: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
}

export function DesktopHeader({ eyebrow, title, sub, right }: Props) {
  return (
    <div className="desk-header">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          {eyebrow}
        </div>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(22px, 4vw, 30px)",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            margin: 0,
            fontWeight: 400,
          }}
        >
          {title}
        </h1>
        {sub && (
          <div style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 6 }}>{sub}</div>
        )}
      </div>
      {right}
    </div>
  );
}
