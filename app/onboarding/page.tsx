"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { AgentsyMark, ProviderMark } from "@/components/atoms";

interface OnboardingState {
  group: string;
  tz: string;
  phone: string;
  booking: string;
  pos: string;
  voice: string;
}

const initialState: OnboardingState = {
  group: "The Forge Group",
  tz: "Europe/London",
  phone: "+44 7700 900123",
  booking: "ResDiary",
  pos: "Square",
  voice: "warm",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<OnboardingState>(initialState);

  const set = <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const next = () => setStep((s) => Math.min(8, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));
  const finish = () => router.push("/today");

  return (
    <div className="screen-bleed paper-grain" style={{ maxWidth: 540, margin: "0 auto" }}>
      <div style={{ padding: "14px 20px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        <AgentsyMark size={26} />
        <div style={{ fontFamily: "var(--serif)", fontSize: 16 }}>Agentsy</div>
        <div
          style={{
            marginLeft: "auto",
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--ink-3)",
          }}
        >
          Step {step} of 8
        </div>
      </div>
      <div style={{ padding: "0 20px 16px" }}>
        <div className="steps">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={"step " + (i + 1 < step ? "done" : i + 1 === step ? "active" : "")}
            />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 20px 16px" }}>
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 data={data} set={set} />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 data={data} set={set} />}
        {step === 5 && <Step5 data={data} set={set} />}
        {step === 6 && <Step6 />}
        {step === 7 && <Step7 />}
        {step === 8 && <Step8 data={data} set={set} />}
      </div>

      <div className="cta-bar">
        {step > 1 && (
          <button type="button" className="btn btn-ghost" onClick={prev} style={{ flex: "0 0 auto" }}>
            Back
          </button>
        )}
        {step < 8 ? (
          <button type="button" className="btn btn-terracotta" onClick={next} style={{ flex: 1 }}>
            {step === 1 ? "Let's go" : "Continue"}
          </button>
        ) : (
          <button type="button" className="btn btn-terracotta" onClick={finish} style={{ flex: 1 }}>
            <Icon.Sparkle s={14} c="#fff" /> Train and finish setup
          </button>
        )}
      </div>
    </div>
  );
}

function StepHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <div style={{ marginTop: 8, marginBottom: 22 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: 30,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 14,
            color: "var(--ink-3)",
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function Step1() {
  return (
    <div>
      <StepHeader
        eyebrow="Welcome"
        title={
          <>
            Your back office,
            <br />
            <span className="serif-i">while you run the floor.</span>
          </>
        }
        sub="Eight steps. About 30 minutes. By the last one I'll have a draft review reply waiting for you."
      />
      <div className="card" style={{ padding: 16, background: "var(--card-2)" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          What you&apos;ll connect
        </div>
        {[
          ["Bookings", "ResDiary, Collins, OpenTable…"],
          ["POS (optional)", "Square, Lightspeed, Toast"],
          ["Google Business Profile", "so I can reply to reviews in your voice"],
          ["WhatsApp", "so I can send you the morning brief"],
        ].map(([k, v], i, a) => (
          <div
            key={k}
            style={{
              display: "flex",
              gap: 10,
              padding: "10px 0",
              borderBottom: i < a.length - 1 ? "1px solid var(--rule)" : "none",
            }}
          >
            <Icon.Check s={16} c="var(--sage)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{k}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step2({
  data,
  set,
}: {
  data: OnboardingState;
  set: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 2 · Group"
        title="Tell me about your group."
        sub="Two minutes, then we're moving."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label htmlFor="group">Group name</label>
          <input
            id="group"
            className="input"
            value={data.group}
            onChange={(e) => set("group", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="tz">Time zone</label>
          <select
            id="tz"
            className="select"
            value={data.tz}
            onChange={(e) => set("tz", e.target.value)}
          >
            <option>Europe/London</option>
            <option>Europe/Dublin</option>
            <option>Europe/Paris</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="phone">
            Where should I send your daily brief?{" "}
            <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>(your WhatsApp)</span>
          </label>
          <input
            id="phone"
            className="input"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function Step3() {
  const sites = [
    { name: "Hackney", addr: "142 Mare St, London E8", gbp: "verified" as const },
    { name: "King's Cross", addr: "14 Caledonian Rd, London N1", gbp: "verified" as const },
    { name: "Peckham", addr: "57 Rye Lane, London SE15", gbp: "pending" as const },
  ];
  return (
    <div>
      <StepHeader
        eyebrow="Step 3 · Sites"
        title="Add your sites."
        sub="I'll match each to a Google Business Profile so I can read reviews."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sites.map((s) => (
          <div key={s.name} className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon.Building s={20} c="var(--ink-3)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{s.addr}</div>
              </div>
              {s.gbp === "verified" ? (
                <span className="chip chip-sage">
                  <Icon.Check s={11} /> GBP matched
                </span>
              ) : (
                <span className="chip chip-amber">Match GBP</span>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="card"
          style={{
            padding: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px dashed var(--rule-2)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <Icon.Plus s={18} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Add another site</span>
        </button>
      </div>
    </div>
  );
}

const BOOKING_PROVIDERS = [
  { id: "ResDiary", auth: "OAuth · 2 min" },
  { id: "Access Collins", auth: "API key · 5 min" },
  { id: "OpenTable", auth: "Email export · daily" },
  { id: "SevenRooms", auth: "OAuth · partner programme" },
  { id: "Eat App", auth: "API key · 5 min" },
  { id: "Other", auth: "CSV upload" },
];

function Step4({
  data,
  set,
}: {
  data: OnboardingState;
  set: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 4 · Bookings"
        title="Where do bookings live today?"
        sub="Pick one. I'll pull guests, bookings and history."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {BOOKING_PROVIDERS.map((p) => (
          <div
            key={p.id}
            onClick={() => set("booking", p.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                set("booking", p.id);
              }
            }}
            role="button"
            tabIndex={0}
            className={"radio-card" + (data.booking === p.id ? " selected" : "")}
          >
            <div className="ring" />
            <ProviderMark name={p.id} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.id}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{p.auth}</div>
            </div>
          </div>
        ))}
      </div>
      {data.booking && (
        <div className="card fade-up" style={{ padding: 14, marginTop: 14, background: "var(--card-2)" }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Test connection
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 10 }}>
            Once connected, I&apos;ll show your 3 most recent bookings here as proof.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "Tonight 19:30 · Park / Anniversary · 4",
              "Tonight 19:00 · Mehta · 3 (allergy)",
              "Tomorrow 12:30 · Kelly · 2",
            ].map((t) => (
              <div
                key={t}
                style={{ fontSize: 12.5, fontFamily: "var(--mono)", color: "var(--ink-3)" }}
              >
                · {t}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const POS_PROVIDERS = [
  { id: "Square", auth: "OAuth · 60 seconds" },
  { id: "Lightspeed", auth: "OAuth · K-Series" },
  { id: "Toast", auth: "OAuth · US-leaning" },
  { id: "Other", auth: "Skip — spend stats stay blank" },
];

function Step5({
  data,
  set,
}: {
  data: OnboardingState;
  set: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 5 · POS (optional)"
        title="Where do payments land?"
        sub="Skip if your till's old. POS only adds spend data."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {POS_PROVIDERS.map((p) => (
          <div
            key={p.id}
            onClick={() => set("pos", p.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                set("pos", p.id);
              }
            }}
            role="button"
            tabIndex={0}
            className={"radio-card" + (data.pos === p.id ? " selected" : "")}
          >
            <div className="ring" />
            <ProviderMark name={p.id} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.id}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{p.auth}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step6() {
  const sites = [
    { name: "Hackney", status: "connected" as const },
    { name: "King's Cross", status: "connected" as const },
    { name: "Peckham", status: "verify" as const },
  ];
  return (
    <div>
      <StepHeader
        eyebrow="Step 6 · Reviews"
        title="Connect Google Business Profile."
        sub="One per site, so I can reply in your voice. We never auto-post until you say so."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sites.map((s) => (
          <div
            key={s.name}
            className="card"
            style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}
          >
            <ProviderMark name="Google Business Profile" size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                Reply to reviews · read performance
              </div>
            </div>
            {s.status === "connected" ? (
              <span className="chip chip-sage">
                <Icon.Check s={11} /> Connected
              </span>
            ) : (
              <button
                type="button"
                className="btn btn-terracotta"
                style={{ padding: "7px 12px", fontSize: 12.5 }}
              >
                Verify
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Step7() {
  return (
    <div>
      <StepHeader
        eyebrow="Step 7 · WhatsApp"
        title="Hook up WhatsApp."
        sub="I'll handle the BSP wiring. Takes 1–5 days, but the rest of Agentsy works without it."
      />
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <ProviderMark name="WhatsApp" size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>WhatsApp Business API</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>via 360dialog · UK pricing</div>
          </div>
          <span className="chip chip-amber">In review</span>
        </div>
        <div className="field">
          <label htmlFor="biz-phone">Business phone for the brief</label>
          <input id="biz-phone" className="input" defaultValue="+44 7700 900123" />
        </div>
        <div
          style={{
            marginTop: 14,
            padding: 12,
            background: "var(--paper-2)",
            borderRadius: 8,
            fontSize: 12.5,
            color: "var(--ink-2)",
            lineHeight: 1.5,
          }}
        >
          <span className="serif-i">
            While we wait — I&apos;ll send your brief by email until WhatsApp clears review.
          </span>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Templates I&apos;ll pre-submit for approval
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[
            "booking_confirmation",
            "booking_reminder_24h",
            "no_show_check",
            "post_visit_thanks",
            "win_back_60d",
            "birthday",
            "seasonal_push",
          ].map((t) => (
            <span key={t} className="chip" style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step8({
  data,
  set,
}: {
  data: OnboardingState;
  set: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 8 · Voice"
        title="Train your voice."
        sub="I'll write in your voice — review replies, WhatsApp, captions. To do that, I need a few examples."
      />

      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Easiest
      </div>
      <div
        className="card"
        style={{ padding: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}
      >
        <Icon.Sparkle s={16} c="var(--terracotta)" />
        <div style={{ flex: 1, fontSize: 13.5, minWidth: 0 }}>
          Use my Google reviews + GBP replies{" "}
          <span style={{ color: "var(--ink-3)" }}>(I&apos;ll fetch them — 184 found)</span>
        </div>
        <span className="chip chip-sage">
          <Icon.Check s={11} /> Ready
        </span>
      </div>

      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Better
      </div>
      <div className="card" style={{ padding: 14, marginBottom: 18 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 8 }}>
          Paste 3 captions you&apos;ve written
        </div>
        <textarea className="textarea" rows={3} placeholder="One caption per line…" />
      </div>

      <div className="eyebrow" style={{ marginBottom: 8 }}>
        3 vibe questions
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 8 }}>
          Pick the one that sounds most like you.
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["warm", "cheeky", "formal", "plain-spoken"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set("voice", v)}
              className={data.voice === v ? "chip chip-terra" : "chip"}
              style={{ cursor: "pointer", padding: "7px 14px" }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 14,
          background: "var(--terracotta-tint)",
          borderColor: "rgba(184,95,58,0.2)",
        }}
      >
        <div className="eyebrow" style={{ color: "var(--terracotta)", marginBottom: 6 }}>
          Time-to-value · what&apos;s next
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--ink)" }}>
          When you tap <b>Train and finish setup</b>, I&apos;ll show you a real past review of yours
          with a draft reply written in the voice we just learned.{" "}
          <span className="serif-i">That&apos;s the moment.</span>
        </div>
      </div>
    </div>
  );
}
