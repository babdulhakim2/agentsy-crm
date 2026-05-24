import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

interface Body {
  groupName: string;
  timezone: string;
  primaryPhone?: string;
  ownerName?: string;
  ownerEmail?: string;
  imageUrl?: string;
  sites: Array<{
    name: string;
    address?: string;
    city?: string;
    postcode?: string;
  }>;
  whatsappMode?: string;
  whatsappPhone?: string;
  whatsappDisplayName?: string;
  whatsappSiteScope?: string;
}

export async function POST(req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.groupName?.trim() || !body.timezone || !body.sites?.[0]?.name?.trim()) {
    return NextResponse.json({ error: "Restaurant name, timezone and first site are required." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return NextResponse.json({ error: "Convex is not configured." }, { status: 503 });

  let token: string | null = null;
  try {
    token = await getToken({ template: "convex" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not get Clerk convex token." },
      { status: 500 }
    );
  }
  if (!token) {
    return NextResponse.json(
      { error: 'Clerk did not return a JWT for the template named "convex".' },
      { status: 500 }
    );
  }

  const tokenClaims = decodeJwtClaims(token);
  try {
    const client = new ConvexHttpClient(url);
    client.setAuth(token);
    const { api } = await import("../../../../convex/_generated/api");
    try {
      const result = await client.mutation(api.onboarding.complete, body as Parameters<typeof client.mutation>[1]);
      return NextResponse.json({ ok: true, result, tokenClaims });
    } catch (err) {
      if (!isLegacyWhatsAppValidatorError(err)) throw err;
      const {
        whatsappMode: _whatsappMode,
        whatsappPhone: _whatsappPhone,
        whatsappDisplayName: _whatsappDisplayName,
        whatsappSiteScope: _whatsappSiteScope,
        ...legacyPayload
      } = body;
      const result = await client.mutation(
        api.onboarding.complete,
        legacyPayload as Parameters<typeof client.mutation>[1]
      );
      return NextResponse.json({ ok: true, result, legacyCustomerSchema: true, tokenClaims });
    }
  } catch (err) {
    const error = authErrorMessage(err, tokenClaims, url);
    console.error("Onboarding Convex sync failed", {
      convexUrl: url,
      tokenClaims,
      error: err instanceof Error ? err.message : String(err ?? "Unknown error"),
    });
    return NextResponse.json({ error, convexUrl: url, tokenClaims }, { status: 500 });
  }
}

function isLegacyWhatsAppValidatorError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return (
    msg.includes("ArgumentValidationError") &&
    (msg.includes("whatsappMode") ||
      msg.includes("whatsappPhone") ||
      msg.includes("whatsappDisplayName") ||
      msg.includes("whatsappSiteScope"))
  );
}

function authErrorMessage(
  err: unknown,
  claims: { iss?: string; aud?: string | string[] } | null,
  convexUrl: string
): string {
  const raw = err instanceof Error ? err.message : String(err ?? "Unknown error");
  const aud = Array.isArray(claims?.aud) ? claims.aud.join(", ") : claims?.aud;
  if (/auth|token|jwt|unauth/i.test(raw)) {
    return [
      "Convex rejected the Clerk JWT.",
      `Convex URL: ${convexUrl}.`,
      `JWT issuer: ${claims?.iss ?? "missing"}.`,
      `JWT audience: ${aud ?? "missing"}.`,
      'Convex CLERK_JWT_ISSUER_DOMAIN must exactly match the issuer, and auth.config.ts applicationID must match audience "convex".',
      `Raw error: ${raw}`,
    ].join(" ");
  }
  return raw;
}

function decodeJwtClaims(token: string): { iss?: string; aud?: string | string[] } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
      iss?: string;
      aud?: string | string[];
    };
  } catch {
    return null;
  }
}
