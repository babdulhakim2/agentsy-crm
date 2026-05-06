"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icon } from "@/components/icons";
import { AgentsyMark, ProviderMark } from "@/components/atoms";
import { isConvexReady } from "@/lib/convex";
import { writeTenantToStorage, type StoredTenant } from "@/lib/tenant-storage";

interface OnboardingState {
  group: string;
  tz: string;
  phone: string;
  ownerName: string;
  ownerEmail: string;
  siteName: string;
  siteAddress: string;
  siteCity: string;
  sitePostcode: string;
  booking: string;
  pos: string;
  voice: string;
  captions: string;
}

const initialState: OnboardingState = {
  group: "New Wok's Cooking",
  tz: "Europe/London",
  phone: "+44 7700 900123",
  ownerName: "Juliet",
  ownerEmail: "juliet@newwokscooking.co",
  siteName: "Islington",
  siteAddress: "220 Upper Street",
  siteCity: "London",
  sitePostcode: "N1 1RU",
  booking: "ResDiary",
  pos: "Square",
  voice: "warm",
  captions: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<OnboardingState>(initialState);

  React.useEffect(() => {
    if (!isLoaded || !user) return;
    setData((d) => ({
      ...d,
      ownerName: d.ownerName || user.fullName || user.firstName || "",
      ownerEmail: d.ownerEmail || user.primaryEmailAddress?.emailAddress || "",
    }));
  }, [isLoaded, user]);

  const set = <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const next = () => setStep((s) => Math.min(8, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));
  const finish = React.useCallback(() => {
    writeTenantToStorage(buildStoredTenant(data, user));
    router.push("/today");
  }, [data, router, user]);

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
        {step === 3 && <Step3 data={data} set={set} />}
        {step === 4 && <Step4 data={data} set={set} />}
        {step === 5 && <Step5 data={data} set={set} />}
        {step === 6 && <Step6 data={data} />}
        {step === 7 && <Step7 data={data} set={set} />}
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
          <FinishSetupButton data={data} onFinish={finish} />
        )}
      </div>
    </div>
  );
}

function buildStoredTenant(data: OnboardingState, user: ReturnType<typeof useUser>["user"]): StoredTenant {
  const ownerEmail = data.ownerEmail.trim() || user?.primaryEmailAddress?.emailAddress || undefined;
  return {
    groupName: data.group.trim() || "My restaurant",
    ownerName: data.ownerName.trim() || user?.fullName || user?.firstName || "Owner",
    ownerEmail,
    timezone: data.tz,
    primaryPhone: data.phone.trim() || undefined,
    bookingProvider: data.booking || undefined,
    posProvider: data.pos || undefined,
    voiceTone: data.voice || undefined,
    sites: [
      {
        name: data.siteName.trim() || "Main site",
        address: data.siteAddress.trim() || undefined,
        city: data.siteCity.trim() || undefined,
        postcode: data.sitePostcode.trim() || undefined,
      },
    ],
    createdAt: Date.now(),
  };
}

function FinishSetupButton({ data, onFinish }: { data: OnboardingState; onFinish: () => void }) {
  if (isConvexReady()) {
    return <ConvexFinishSetupButton data={data} onFinish={onFinish} />;
  }
  return (
    <button type="button" className="btn btn-terracotta" onClick={onFinish} style={{ flex: 1 }}>
      <Icon.Sparkle s={14} c="#fff" /> Train and finish setup
    </button>
  );
}

function ConvexFinishSetupButton({ data, onFinish }: { data: OnboardingState; onFinish: () => void }) {
  const { user } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const complete = useMutation(api.onboarding.complete);
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      if (isAuthenticated) {
        await complete({
          groupName: data.group,
          timezone: data.tz,
          primaryPhone: data.phone,
          ownerName: data.ownerName || user?.fullName || user?.firstName || undefined,
          ownerEmail: data.ownerEmail || user?.primaryEmailAddress?.emailAddress || undefined,
          imageUrl: user?.imageUrl,
          sites: [
            {
              name: data.siteName,
              address: data.siteAddress,
              city: data.siteCity,
              postcode: data.sitePostcode,
            },
          ],
          bookingProvider: data.booking,
          posProvider: data.pos,
          voiceTone: data.voice,
          voiceExamples: data.captions
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        });
      }
    } catch (err) {
      console.error("Onboarding saved locally but Convex sync failed.", err);
    } finally {
      onFinish();
    }
  };

  return (
    <button
      type="button"
      className="btn btn-terracotta"
      onClick={submit}
      disabled={saving || isLoading}
      style={{ flex: 1, opacity: saving || isLoading ? 0.72 : 1 }}
    >
      <Icon.Sparkle s={14} c="#fff" /> {saving ? "Saving setup..." : "Train and finish setup"}
    </button>
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
          <label htmlFor="owner-name">Owner name</label>
          <input
            id="owner-name"
            className="input"
            value={data.ownerName}
            onChange={(e) => set("ownerName", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="owner-email">Owner email</label>
          <input
            id="owner-email"
            className="input"
            type="email"
            value={data.ownerEmail}
            onChange={(e) => set("ownerEmail", e.target.value)}
          />
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

function Step3({
  data,
  set,
}: {
  data: OnboardingState;
  set: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  const address = [data.siteAddress, data.siteCity, data.sitePostcode].filter(Boolean).join(", ");
  return (
    <div>
      <StepHeader
        eyebrow="Step 3 · Sites"
        title="Add your sites."
        sub="I'll match each to a Google Business Profile so I can read reviews."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Icon.Building s={20} c="var(--ink-3)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{data.siteName || "First site"}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{address || "Add address"}</div>
            </div>
            <span className="chip chip-amber">Match GBP</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <div className="field">
              <label htmlFor="site-name">Site name</label>
              <input
                id="site-name"
                className="input"
                value={data.siteName}
                onChange={(e) => set("siteName", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="site-address">Street address</label>
              <input
                id="site-address"
                className="input"
                value={data.siteAddress}
                onChange={(e) => set("siteAddress", e.target.value)}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 10 }}>
              <div className="field">
                <label htmlFor="site-city">Town/city</label>
                <input
                  id="site-city"
                  className="input"
                  value={data.siteCity}
                  onChange={(e) => set("siteCity", e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="site-postcode">Postcode</label>
                <input
                  id="site-postcode"
                  className="input"
                  value={data.sitePostcode}
                  onChange={(e) => set("sitePostcode", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="card"
          disabled
          style={{
            padding: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px dashed var(--rule-2)",
            background: "transparent",
            cursor: "not-allowed",
            opacity: 0.72,
          }}
        >
          <Icon.Plus s={18} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>Add more sites after setup</span>
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
        sub="Pick one. I'll pull customers, bookings and history."
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

function Step6({ data }: { data: OnboardingState }) {
  const sites: Array<{ name: string; status: "connected" | "verify" }> = [
    { name: data.siteName || "First site", status: "verify" },
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

function Step7({
  data,
  set,
}: {
  data: OnboardingState;
  set: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
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
          <input
            id="biz-phone"
            className="input"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
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
        <textarea
          className="textarea"
          rows={3}
          placeholder="One caption per line…"
          value={data.captions}
          onChange={(e) => set("captions", e.target.value)}
        />
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
