"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { DesktopHeader } from "@/components/shell/DesktopHeader";

const SAMPLES = [
  { kind: "Review reply · 5★", body: "Iris, thank you — couldn't agree more about the bread. Hope to see you again. — Maya" },
  { kind: "Review reply · 2★", body: "I'm sorry, that's not the night we wanted you to have. The wine should never go out warm. I'd love a chance to put it right." },
  { kind: "WhatsApp reminder", body: "Quick reminder — table for 4 tomorrow at 19:30, Hackney. Reply CHANGE if you need to move it." },
  { kind: "Win-back", body: "It's been a minute. Spring menu lands Thursday — saved you a Friday two-top in case." },
  { kind: "IG caption", body: "Brown butter, capers, a quiet Tuesday. The lamb is back on Thursday — first come, no holds." },
  { kind: "No-show check", body: "Hey — your table's still here, no rush. Running late or do you need to move?" },
];

export default function VoicePage() {
  const [toggles, setToggles] = React.useState<Record<string, boolean>>({
    "Never use emojis": true,
    'Always sign with "Maya"': true,
    "Cap sentences at 22 words": false,
    "Use Oxford comma": false,
  });

  return (
    <div className="screen-desktop">
      <DesktopHeader
        eyebrow="Brand voice"
        title="How I sound when I write for you."
        sub="Trained on 184 examples · last refreshed 4 days ago"
        right={
          <button type="button" className="btn btn-ghost">
            <Icon.Refresh s={16} /> Re-train
          </button>
        }
      />
      <div className="desk-content">
        <div className="responsive-2col-sticky">
          <div>
            <div className="card" style={{ padding: 22, marginBottom: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Voice summary
              </div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.35 }}>
                Warm, plain-spoken, with dry British humour.
                <br />
                <span className="serif-i" style={{ color: "var(--ink-3)" }}>
                  Never exclamation marks. Always signs off &ldquo;Maya&rdquo;.
                </span>
              </div>
            </div>

            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Sample bench · rate to tune
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SAMPLES.map((s, i) => (
                <div key={i} className="card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span className="chip">{s.kind}</span>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="btn-soft"
                        style={{ width: 30, height: 30, borderRadius: 8 }}
                        aria-label="Like"
                      >
                        👍
                      </button>
                      <button
                        type="button"
                        className="btn-soft"
                        style={{ width: 30, height: 30, borderRadius: 8 }}
                        aria-label="Dislike"
                      >
                        👎
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)" }}>{s.body}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="card" style={{ padding: 18, marginBottom: 14 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Learned from
              </div>
              {[
                ["Google reviews + replies", "184 examples"],
                ["Instagram captions", "47 examples"],
                ["Manual paste", "3 captions"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--rule)",
                    fontSize: 13,
                  }}
                >
                  <span>{k}</span>
                  <span style={{ color: "var(--ink-3)" }}>{v}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 18, marginBottom: 14 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Toggles
              </div>
              {Object.entries(toggles).map(([k, on]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--rule)",
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13 }}>{k}</span>
                  <button
                    type="button"
                    className={"toggle" + (on ? " on" : "")}
                    onClick={() => setToggles((t) => ({ ...t, [k]: !t[k] }))}
                    aria-label={`Toggle ${k}`}
                  />
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Banned words
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["delicious", "journey", "unleash", "curated", "elevate"].map((w) => (
                  <span key={w} className="chip chip-crimson">
                    {w} <Icon.X s={11} />
                  </span>
                ))}
                <button className="chip chip-ghost" style={{ border: "1px dashed var(--rule-2)" }}>
                  <Icon.Plus s={11} /> Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
