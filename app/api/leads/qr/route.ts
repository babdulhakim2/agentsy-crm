import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

interface Body {
  groupId?: string;
  siteId?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  customerSource?: string;
  consentWhatsapp?: boolean;
  birthMonth?: number;
  birthDay?: number;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.name?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url || !body.groupId) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      created: true,
    });
  }

  try {
    const client = new ConvexHttpClient(url);
    const { api } = await import("../../../../convex/_generated/api");
    const result = await client.mutation(api.customers.publicQrLead, {
      groupId: body.groupId,
      siteId: body.siteId,
      name: body.name,
      phone: body.phone,
      email: body.email,
      address: body.address,
      notes: body.notes,
      customerSource: body.customerSource,
      consentWhatsapp: body.consentWhatsapp ?? true,
      birthMonth: body.birthMonth,
      birthDay: body.birthDay,
    } as Parameters<typeof client.mutation>[1]);
    return NextResponse.json({ ok: true, mode: "convex", ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save this lead.";
    if (message.includes("Could not find public function")) {
      return NextResponse.json({
        ok: true,
        mode: "demo",
        pendingDeployment: true,
        created: true,
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
