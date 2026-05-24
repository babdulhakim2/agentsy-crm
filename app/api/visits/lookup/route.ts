import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get("groupId");
  const phone = req.nextUrl.searchParams.get("phone");
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!url || !groupId || !phone || phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ customer: null });
  }

  try {
    const client = new ConvexHttpClient(url);
    const { api } = await import("../../../../convex/_generated/api");
    const customer = await client.query(api.customers.findByPhone, {
      groupId,
      phone,
    } as Parameters<typeof client.query>[1]);

    if (!customer) return NextResponse.json({ customer: null });
    return NextResponse.json({
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        birthMonth: customer.birthMonth,
        birthDay: customer.birthDay,
        visitCount: customer.visitCount,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not look up customer." },
      { status: 500 }
    );
  }
}
