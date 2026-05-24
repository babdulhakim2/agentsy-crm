import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

interface Body {
  groupId?: string;
  siteId?: string;
  name?: string;
  phone?: string;
  rating?: number;
  feedback?: string;
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
  if (!url || !body.groupId || !body.siteId) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      counted: true,
      duplicate: false,
      visitCount: 1,
      rewardUnlocked: false,
      visitsUntilReward: 2,
      visitsRequired: 3,
      rewardLabel: "20% off",
    });
  }

  try {
    const client = new ConvexHttpClient(url);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - convex/_generated is created by the Convex CLI.
    const { api } = await import("../../../../convex/_generated/api");
    const result = await client.mutation(api.customers.publicQrVisit, {
      groupId: body.groupId,
      siteId: body.siteId,
      name: body.name,
      phone: body.phone,
      rating: body.rating,
      feedback: body.feedback,
      consentWhatsapp: body.consentWhatsapp ?? true,
      birthMonth: body.birthMonth,
      birthDay: body.birthDay,
    } as Parameters<typeof client.mutation>[1]);
    return NextResponse.json({ ok: true, mode: "convex", ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not log this visit.";
    if (message.includes("Could not find public function")) {
      return NextResponse.json({
        ok: true,
        mode: "demo",
        pendingDeployment: true,
        counted: true,
        duplicate: false,
        visitCount: 1,
        rewardUnlocked: false,
        visitsUntilReward: 2,
        visitsRequired: 3,
        rewardLabel: "20% off",
      });
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
