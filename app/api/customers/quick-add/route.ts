// POST /api/customers/quick-add
// Forwards a phone+name capture to the Convex `customers.quickAdd` mutation.
// Returns 503 if Convex isn't configured yet — caller falls back to local state.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

interface Body {
  groupId?: string;
  phone: string;
  name: string;
  consentWhatsapp: boolean;
  source: "host_stand" | "qr" | "manual" | "booking_widget";
  tags?: string[];
  email?: string;
  address?: string;
  birthMonth?: number;
  birthDay?: number;
  customerSource?: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body?.phone || !body?.name) {
    return NextResponse.json({ error: "phone and name required" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const groupId = body.groupId || process.env.DEFAULT_GROUP_ID;
  if (!url || !groupId) {
    return NextResponse.json({ pending: true }, { status: 503 });
  }

  try {
    const client = new ConvexHttpClient(url);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - convex/_generated created by convex CLI
    const { api } = await import("../../../../convex/_generated/api");
    const baseArgs = {
      groupId,
      phone: body.phone,
      name: body.name,
      consentWhatsapp: body.consentWhatsapp,
      source: body.source,
      tags: body.tags ?? [],
      email: body.email,
      address: body.address,
    };
    try {
      const result = await client.mutation(api.customers.quickAdd, {
        ...baseArgs,
        customerSource: body.customerSource,
        birthMonth: body.birthMonth,
        birthDay: body.birthDay,
      } as Parameters<typeof client.mutation>[1]);
      return NextResponse.json({ ok: true, result });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (!isLegacyCustomerValidatorError(msg)) throw err;
      const { address: _address, ...legacyBaseArgs } = baseArgs;
      const result = await client.mutation(api.customers.quickAdd, {
        ...legacyBaseArgs,
      } as Parameters<typeof client.mutation>[1]);
      return NextResponse.json({ ok: true, result, legacyCustomerSchema: true });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("Cannot find module")) {
      return NextResponse.json({ pending: true }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function isLegacyCustomerValidatorError(message: string): boolean {
  return (
    message.includes("ArgumentValidationError") &&
    (message.includes("customerSource") ||
      message.includes("birthMonth") ||
      message.includes("birthDay") ||
      message.includes("address"))
  );
}
