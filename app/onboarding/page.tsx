"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icon } from "@/components/icons";
import { AgentsyMark, ProviderMark } from "@/components/atoms";
import { isConvexReady } from "@/lib/convex";
import { readTenantFromStorage, writeTenantToStorage, type StoredTenant } from "@/lib/tenant-storage";

const TOTAL_STEPS = 4;
const ONBOARDING_DRAFT_PREFIX = "agentsy.onboardingDraft.v1";
type WhatsAppMode = "basic" | "connected" | "managed";
type WhatsAppSiteScope = "all_sites" | "first_site";

interface OnboardingState {
  group: string;
  tz: string;
  phone: string;
  whatsappMode: WhatsAppMode;
  whatsappNumber: string;
  whatsappDisplayName: string;
  whatsappSiteScope: WhatsAppSiteScope;
  ownerName: string;
  ownerEmail: string;
  siteName: string;
  siteAddress: string;
  siteCity: string;
  sitePostcode: string;
}

const initialState: OnboardingState = {
  group: "",
  tz: "Europe/London",
  phone: "",
  whatsappMode: "basic",
  whatsappNumber: "",
  whatsappDisplayName: "",
  whatsappSiteScope: "all_sites",
  ownerName: "",
  ownerEmail: "",
  siteName: "",
  siteAddress: "",
  siteCity: "London",
  sitePostcode: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<OnboardingState>(initialState);
  const [mounted, setMounted] = React.useState(false);
  const [loadedDraftKey, setLoadedDraftKey] = React.useState<string | null>(null);

  React.useEffect(() => setMounted(true), []);

  const draftKey = React.useMemo(() => {
    if (!isLoaded) return null;
    return onboardingDraftKey(user);
  }, [isLoaded, user?.id, user?.primaryEmailAddress?.emailAddress]);

  React.useEffect(() => {
    if (!draftKey || loadedDraftKey === draftKey) return;
    const stored = readTenantFromStorage();
    const draft = readOnboardingDraft(draftKey);
    setData((current) => {
      let next = stored ? storedTenantToState(stored, current) : current;
      if (draft?.data) next = { ...next, ...draft.data };
      return {
        ...next,
        ownerName: next.ownerName || user?.fullName || user?.firstName || "",
        ownerEmail: user?.primaryEmailAddress?.emailAddress || next.ownerEmail,
      };
    });
    if (draft?.step) setStep(clampStep(draft.step));
    setLoadedDraftKey(draftKey);
  }, [draftKey, loadedDraftKey, user]);

  React.useEffect(() => {
    if (!draftKey || loadedDraftKey !== draftKey) return;
    writeOnboardingDraft(draftKey, {
      step,
      data: {
        ...data,
        ownerEmail: user?.primaryEmailAddress?.emailAddress || data.ownerEmail,
      },
      updatedAt: Date.now(),
    });
  }, [data, draftKey, loadedDraftKey, step, user?.primaryEmailAddress?.emailAddress]);

  // Pre-fill owner identity from Clerk.
  React.useEffect(() => {
    if (!isLoaded || !user) return;
    setData((d) => ({
      ...d,
      ownerName: d.ownerName || user.fullName || user.firstName || "",
      ownerEmail: user.primaryEmailAddress?.emailAddress || d.ownerEmail || "",
    }));
  }, [isLoaded, user]);

  const set = <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));
  const [oauthError, setOauthError] = React.useState<string | null>(null);

  // Required-field rules per step. The Continue button stays disabled until satisfied.
  const stepValid =
    step === 2
      ? data.group.trim().length > 0
      : step === 3
        ? data.siteName.trim().length > 0
        : true;
  const stepHint =
    step === 2 && !stepValid
      ? "Restaurant name is required to continue."
      : step === 3 && !stepValid
        ? "Site name is required so we can scope reviews and bookings to it."
        : null;

  return (
    <div className="screen-bleed paper-grain" style={{ maxWidth: 540, margin: "0 auto" }}>
      <div
        style={{
          padding: "14px 20px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <AgentsyMark size={26} />
        <div style={{ fontFamily: "var(--serif)", fontSize: 16 }}>Agentsy</div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <SignOutLink />
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--ink-3)",
            }}
          >
            Step {step} of {TOTAL_STEPS}
          </div>
        </div>
      </div>
      <div style={{ padding: "0 20px 16px" }}>
        <div className="steps">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={"step " + (i + 1 < step ? "done" : i + 1 === step ? "active" : "")}
            />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 20px 16px" }}>
        {mounted && isConvexReady() && <OnboardingUserSync isLoaded={isLoaded} user={user} />}
        {step === 1 && <Step1Welcome />}
        {step === 2 && <Step2Group data={data} set={set} />}
        {step === 3 && <Step3Site data={data} set={set} />}
        {step === 4 && <Step4Channels data={data} set={set} error={oauthError} />}
        {step === 4 && <Step4AuthStatus />}
      </div>

      <div className="cta-bar" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
        {stepHint && (
          <div
            role="alert"
            style={{
              fontSize: 12,
              color: "var(--crimson)",
              background: "var(--crimson-tint)",
              padding: "8px 12px",
              borderRadius: 8,
              lineHeight: 1.4,
            }}
          >
            {stepHint}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          {step > 1 && (
            <button type="button" className="btn btn-ghost" onClick={prev} style={{ flex: "0 0 auto" }}>
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              className="btn btn-terracotta"
              onClick={next}
              disabled={!stepValid}
              style={{ flex: 1, opacity: stepValid ? 1 : 0.6, cursor: stepValid ? "pointer" : "not-allowed" }}
            >
              {step === 1 ? "Let's go" : "Continue"}
            </button>
          ) : (
            <FinishButtons data={data} router={router} user={user} setError={setOauthError} />
          )}
        </div>
      </div>
    </div>
  );
}

function OnboardingUserSync({
  isLoaded,
  user,
}: {
  isLoaded: boolean;
  user: ReturnType<typeof useUser>["user"];
}) {
  const upsertCurrent = useMutation(api.users.upsertCurrent);

  React.useEffect(() => {
    if (!isLoaded || !user) return;
    upsertCurrent({
      email: user.primaryEmailAddress?.emailAddress ?? undefined,
      name: user.fullName ?? undefined,
      imageUrl: user.imageUrl,
    }).catch((err) => console.error("users.upsertCurrent failed", err));
  }, [isLoaded, user, upsertCurrent]);

  return null;
}

// ── Live Convex auth status pill (only on step 4) ───────────

function Step4AuthStatus() {
  // Only useful when Convex is configured.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted || !isConvexReady()) return null;
  return <Step4AuthStatusInner />;
}

function Step4AuthStatusInner() {
  const { getToken } = useAuth();
  const { isLoaded: clerkLoaded, isSignedIn } = useUser();
  const [status, setStatus] = React.useState<{
    loading: boolean;
    ok: boolean;
    label: string;
  }>({ loading: true, ok: false, label: "Checking Clerk token..." });

  React.useEffect(() => {
    let active = true;
    if (!clerkLoaded) return;
    if (!isSignedIn) {
      setStatus({ loading: false, ok: false, label: "Not signed in to Clerk" });
      return;
    }
    setStatus({ loading: true, ok: false, label: "Checking Clerk token..." });
    getToken({ template: "convex", skipCache: true })
      .then((token) => {
        if (!active) return;
        if (!token) {
          setStatus({
            loading: false,
            ok: false,
            label: "Clerk JWT template named convex did not return a token.",
          });
          return;
        }
        const claims = decodeJwtClaims(token);
        const aud = Array.isArray(claims?.aud) ? claims.aud.join(", ") : claims?.aud;
        const issuer = claims?.iss;
        const ok = Boolean(issuer && aud === "convex");
        setStatus({
          loading: false,
          ok,
          label: ok
            ? `Clerk token ready. Issuer: ${issuer}`
            : `Check Clerk token claims. Issuer: ${issuer ?? "missing"} · audience: ${aud ?? "missing"}`,
        });
      })
      .catch((err) => {
        if (!active) return;
        setStatus({
          loading: false,
          ok: false,
          label: err instanceof Error ? err.message : "Could not read Clerk convex token.",
        });
      });
    return () => {
      active = false;
    };
  }, [clerkLoaded, getToken, isSignedIn]);

  const tint = status.loading ? "var(--ink-3)" : status.ok ? "var(--sage)" : "var(--crimson)";
  const tintBg = status.loading ? "var(--paper-2)" : status.ok ? "var(--sage-tint)" : "var(--crimson-tint)";

  return (
    <div
      style={{
        marginTop: 12,
        padding: "10px 12px",
        background: tintBg,
        borderRadius: 10,
        fontSize: 12,
        color: tint,
        fontFamily: "var(--mono)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: tint,
          flexShrink: 0,
        }}
      />
      {status.label}
    </div>
  );
}

// ── Sign out (re-auth from inside onboarding) ────────────────

function SignOutLink() {
  const { signOut } = useClerk();
  const { user } = useUser();
  if (!user) return null;
  const email = user.primaryEmailAddress?.emailAddress;
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/" })}
      title={email ? `Signed in as ${email}` : "Sign out"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 10px",
        background: "transparent",
        border: "1px solid var(--rule-2)",
        borderRadius: 999,
        fontSize: 11.5,
        color: "var(--ink-2)",
        cursor: "pointer",
        fontFamily: "var(--sans)",
        maxWidth: 220,
      }}
    >
      <span
        style={{
          maxWidth: 130,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {email ?? user.fullName ?? "Signed in"}
      </span>
      <span style={{ color: "var(--ink-3)" }}>·</span>
      <span style={{ color: "var(--terracotta)" }}>Sign out</span>
    </button>
  );
}

// ── Steps ─────────────────────────────────────────────────────

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
        <div style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.5 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Step1Welcome() {
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
        sub="Four quick steps. By the end you'll have your restaurant, a site, and Google reviews syncing in your voice."
      />
      <div className="card" style={{ padding: 16, background: "var(--card-2)" }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          What we&apos;ll do
        </div>
        {[
          ["Your restaurant", "Name, time zone, phone"],
          ["Your first site", "Where it is on Google Maps"],
          ["WhatsApp growth pilot", "QR links, enquiry flow and sender setup"],
          ["Google Business Profile", "So I can read reviews and reply in your voice"],
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

function Step2Group({
  data,
  set,
}: {
  data: OnboardingState;
  set: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 2 · Restaurant"
        title="Tell me about your restaurant."
        sub="Your email already comes from sign-in."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="field">
          <label htmlFor="group">
            Restaurant name <span style={{ color: "var(--terracotta)" }}>*</span>
          </label>
          <input
            id="group"
            className="input"
            placeholder="e.g. New Wok's Cooking"
            value={data.group}
            onChange={(e) => set("group", e.target.value)}
            required
            aria-required
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
          <label htmlFor="phone">Owner phone (for the daily brief)</label>
          <input
            id="phone"
            className="input"
            placeholder="+44 7700 900123"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function Step3Site({
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
        eyebrow="Step 3 · Site"
        title="Add your first site."
        sub="You can add more branches from the dashboard later."
      />
      <div className="card" style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Icon.Building s={20} c="var(--ink-3)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{data.siteName || "First site"}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{address || "Add address"}</div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <div className="field">
            <label htmlFor="site-name">
              Site name <span style={{ color: "var(--terracotta)" }}>*</span>
            </label>
            <input
              id="site-name"
              className="input"
              placeholder="e.g. Islington"
              value={data.siteName}
              onChange={(e) => set("siteName", e.target.value)}
              required
              aria-required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="site-address">Street address</label>
            <input
              id="site-address"
              className="input"
              placeholder="220 Upper Street"
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
                placeholder="N1 1RU"
                value={data.sitePostcode}
                onChange={(e) => set("sitePostcode", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4Channels({
  data,
  set,
  error,
}: {
  data: OnboardingState;
  set: <K extends keyof OnboardingState>(k: K, v: OnboardingState[K]) => void;
  error: string | null;
}) {
  const displayName = data.whatsappDisplayName || data.group || "Your restaurant";
  const whatsappNumber = data.whatsappNumber || data.phone;
  const previewDigits = whatsappNumber.replace(/[^\d]/g, "");
  const previewUrl = previewDigits
    ? `wa.me/${previewDigits}?text=${encodeURIComponent(`Hi ${displayName}, I'd like to ask about catering.`)}`
    : "Add a business WhatsApp number to create the QR/click link.";
  const modes: Array<{
    id: WhatsAppMode;
    title: string;
    sub: string;
    status: string;
  }> = [
    {
      id: "basic",
      title: "Use their current number",
      sub: "QR codes, click links and enquiry tracking. The owner replies in WhatsApp Business.",
      status: "Best for the first 30 days",
    },
    {
      id: "connected",
      title: "Connect Cloud API",
      sub: "The business connects its own Meta WhatsApp account and sender number.",
      status: "For automation",
    },
    {
      id: "managed",
      title: "Set up for them",
      sub: "Mark as managed while you help them register a dedicated business number.",
      status: "Agency-assisted",
    },
  ];
  return (
    <div>
      <StepHeader
        eyebrow="Step 4 · Channels"
        title="Set up WhatsApp first."
        sub="Each restaurant uses its own customer-facing number. Your number stays for your demos and sales."
      />
      <div className="card" style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <ProviderMark name="WhatsApp" size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>WhatsApp booking/order channel</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
              Basic works immediately; connected mode is stored for Embedded Signup/API handoff.
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`radio-card${data.whatsappMode === mode.id ? " selected" : ""}`}
              onClick={() => set("whatsappMode", mode.id)}
              style={{ textAlign: "left" }}
              aria-pressed={data.whatsappMode === mode.id}
            >
              <div className="ring" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{mode.title}</span>
                  <span className="chip" style={{ fontSize: 10.5, padding: "3px 7px" }}>
                    {mode.status}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                  {mode.sub}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div className="field">
            <label htmlFor="wa-display">WhatsApp display name</label>
            <input
              id="wa-display"
              className="input"
              placeholder={data.group || "Restaurant name"}
              value={data.whatsappDisplayName}
              onChange={(e) => set("whatsappDisplayName", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="wa-phone">Business WhatsApp number</label>
            <input
              id="wa-phone"
              className="input"
              placeholder={data.phone || "+44 7700 900123"}
              value={data.whatsappNumber}
              onChange={(e) => set("whatsappNumber", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="wa-scope">Sender scope</label>
            <select
              id="wa-scope"
              className="select"
              value={data.whatsappSiteScope}
              onChange={(e) => set("whatsappSiteScope", e.target.value as WhatsAppSiteScope)}
            >
              <option value="all_sites">One number for all sites</option>
              <option value="first_site">This first site has its own number</option>
            </select>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "var(--sage-tint)",
            borderRadius: 8,
            fontSize: 12.5,
            color: "var(--ink-2)",
            lineHeight: 1.55,
            wordBreak: "break-word",
          }}
        >
          <b>Click-to-WhatsApp preview:</b> {previewUrl}
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <ProviderMark name="Google Business Profile" size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{data.siteName || "Your site"}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
              We&apos;ll match your business listing on Google.
            </div>
          </div>
        </div>
        <div
          style={{
            padding: 12,
            background: "var(--paper-2)",
            borderRadius: 8,
            fontSize: 12.5,
            color: "var(--ink-2)",
            lineHeight: 1.55,
          }}
        >
          When you tap <b>Connect Google</b> below, we save your restaurant + site, then bounce you
          to Google for consent. You&apos;ll come straight back to your dashboard once it&apos;s done.
          You can also skip and connect later from{" "}
          <span className="serif-i">Sites &amp; integrations</span>.
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="card"
          style={{
            marginTop: 14,
            padding: 14,
            background: "var(--crimson-tint)",
            borderColor: "rgba(162,58,46,0.2)",
            color: "var(--ink-2)",
          }}
        >
          <div className="eyebrow" style={{ color: "var(--crimson)", marginBottom: 6 }}>
            Couldn&apos;t finish setup
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{error}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.5 }}>
            Most common causes: <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>GOOGLE_CLIENT_ID</code>,{" "}
            <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>GOOGLE_CLIENT_SECRET</code> or{" "}
            <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>GOOGLE_REDIRECT_URI</code> isn&apos;t set on the
            Convex deployment (run <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>npx convex env set NAME value</code>),
            or the redirect URI in Google Cloud Console doesn&apos;t match{" "}
            <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
              {typeof window !== "undefined" ? window.location.origin : ""}
            </code>
            -&gt; <code style={{ fontFamily: "var(--mono)", fontSize: 11 }}>/oauth/google/callback</code> on the Convex side.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Finish actions ────────────────────────────────────────────

interface FinishProps {
  data: OnboardingState;
  router: ReturnType<typeof useRouter>;
  user: ReturnType<typeof useUser>["user"];
  setError: (msg: string | null) => void;
}

function FinishButtons(props: FinishProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (mounted && isConvexReady()) return <ConvexFinishButtons {...props} />;
  return <LocalFinishButton {...props} />;
}

function LocalFinishButton({ data, router, user }: FinishProps) {
  const handle = () => {
    writeTenantToStorage(buildStoredTenant(data, user));
    router.push("/customers");
  };
  return (
    <button type="button" className="btn btn-terracotta" onClick={handle} style={{ flex: 1 }}>
      <Icon.Check s={14} c="#fff" /> Finish setup
    </button>
  );
}

function ConvexFinishButtons({ data, router, user, setError }: FinishProps) {
  const [busy, setBusy] = React.useState<"connect" | "skip" | null>(null);
  const draftKey = onboardingDraftKey(user);

  const persist = async () => {
    const fullPayload = {
      groupName: data.group,
      timezone: data.tz,
      primaryPhone: data.phone || undefined,
      ownerName: data.ownerName || user?.fullName || undefined,
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
      whatsappMode: data.whatsappMode,
      whatsappPhone: data.whatsappNumber || data.phone || undefined,
      whatsappDisplayName: data.whatsappDisplayName || data.group || undefined,
      whatsappSiteScope: data.whatsappSiteScope,
    };
    const res = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullPayload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error ?? "Could not save onboarding.");
    return body.result as { groupId: string; siteIds: string[] };
  };

  const finishLocally = () => {
    writeTenantToStorage(buildStoredTenant(data, user));
    clearOnboardingDraft(draftKey);
    router.push("/customers");
  };

  const handleSkip = async () => {
    setBusy("skip");
    setError(null);
    try {
      await persist();
      finishLocally();
    } catch (err) {
      console.error("Onboarding sync failed", err);
      let msg = err instanceof Error ? err.message : "Unknown error";
      const match = msg.match(/Uncaught Error:\s*(.+?)(\n|$)/);
      if (match) msg = match[1].trim();
      setError(msg);
      setBusy(null);
    }
  };

  const handleConnect = async () => {
    setBusy("connect");
    setError(null);
    try {
      const result = await persist();
      if (!result?.siteIds?.[0]) {
        throw new Error(
          "Convex didn't return a site id. The mutation succeeded but the response is empty — check `convex/onboarding.ts` logs."
        );
      }
      const oauth = await startGoogleOAuth({
        groupId: result.groupId,
        siteId: result.siteIds[0],
        redirectAfter: `${window.location.origin}/customers`,
      });
      if (!oauth?.url) {
        throw new Error("Google didn't return a consent URL. Check the Convex action logs.");
      }
      writeTenantToStorage(buildStoredTenant(data, user));
      clearOnboardingDraft(draftKey);
      window.location.href = oauth.url;
    } catch (err) {
      console.error("Could not start Google OAuth", err);
      let msg = err instanceof Error ? err.message : "Unknown error";
      // Extract the inner Convex error if present (e.g. "Not authenticated.")
      const match = msg.match(/Uncaught Error:\s*(.+?)(\n|$)/);
      if (match) msg = match[1].trim();
      setError(msg);
      setBusy(null);
    }
  };

  const disabled = busy !== null;

  return (
    <div style={{ display: "flex", gap: 8, flex: 1 }}>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={handleSkip}
        disabled={disabled}
        style={{ flex: "0 0 auto" }}
      >
        {busy === "skip" ? "Saving…" : "Skip for now"}
      </button>
      <button
        type="button"
        className="btn btn-terracotta"
        onClick={handleConnect}
        disabled={disabled}
        style={{ flex: 1, opacity: disabled ? 0.72 : 1 }}
      >
        <Icon.Sparkle s={14} c="#fff" />{" "}
        {busy === "connect" ? "Opening Google…" : "Connect Google & finish"}
      </button>
    </div>
  );
}

async function startGoogleOAuth(args: {
  groupId: string;
  siteId: string;
  redirectAfter: string;
}): Promise<{ url: string }> {
  const res = await fetch("/api/google/start-oauth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? "Could not start Google OAuth.");
  return body as { url: string };
}

// ── Storage helper ────────────────────────────────────────────

function buildStoredTenant(
  data: OnboardingState,
  user: ReturnType<typeof useUser>["user"]
): StoredTenant {
  const ownerEmail = data.ownerEmail.trim() || user?.primaryEmailAddress?.emailAddress || undefined;
  return {
    groupName: data.group.trim() || "My restaurant",
    ownerName: data.ownerName.trim() || user?.fullName || user?.firstName || "Owner",
    ownerEmail,
    timezone: data.tz,
    primaryPhone: data.phone.trim() || undefined,
    whatsapp: {
      mode: data.whatsappMode,
      displayName: data.whatsappDisplayName.trim() || data.group.trim() || "My restaurant",
      displayPhoneNumber: data.whatsappNumber.trim() || data.phone.trim() || undefined,
      siteScope: data.whatsappSiteScope,
    },
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

function storedTenantToState(stored: StoredTenant, current: OnboardingState): OnboardingState {
  const firstSite = stored.sites[0];
  return {
    ...current,
    group: current.group || stored.groupName,
    tz: stored.timezone || current.tz,
    phone: current.phone || stored.primaryPhone || "",
    whatsappMode: stored.whatsapp?.mode || current.whatsappMode,
    whatsappNumber: current.whatsappNumber || stored.whatsapp?.displayPhoneNumber || stored.primaryPhone || "",
    whatsappDisplayName: current.whatsappDisplayName || stored.whatsapp?.displayName || stored.groupName,
    whatsappSiteScope: stored.whatsapp?.siteScope || current.whatsappSiteScope,
    ownerName: current.ownerName || stored.ownerName,
    ownerEmail: current.ownerEmail || stored.ownerEmail || "",
    siteName: current.siteName || firstSite?.name || "",
    siteAddress: current.siteAddress || firstSite?.address || "",
    siteCity: current.siteCity || firstSite?.city || "London",
    sitePostcode: current.sitePostcode || firstSite?.postcode || "",
  };
}

interface OnboardingDraft {
  step: number;
  data: OnboardingState;
  updatedAt: number;
}

function onboardingDraftKey(user: ReturnType<typeof useUser>["user"]): string {
  const userKey = user?.id || user?.primaryEmailAddress?.emailAddress || "anonymous";
  return `${ONBOARDING_DRAFT_PREFIX}:${userKey}`;
}

function readOnboardingDraft(key: string): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    if (!parsed || typeof parsed !== "object" || !parsed.data) return null;
    return {
      step: clampStep(Number(parsed.step) || 1),
      data: { ...initialState, ...parsed.data },
      updatedAt: Number(parsed.updatedAt) || Date.now(),
    };
  } catch {
    return null;
  }
}

function writeOnboardingDraft(key: string, draft: OnboardingDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    /* no-op */
  }
}

function clearOnboardingDraft(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

function clampStep(value: number): number {
  return Math.min(TOTAL_STEPS, Math.max(1, Math.round(value)));
}

function decodeJwtClaims(token: string): { iss?: string; aud?: string | string[] } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(window.atob(padded)) as { iss?: string; aud?: string | string[] };
  } catch {
    return null;
  }
}
