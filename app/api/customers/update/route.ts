import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

interface Body {
  id?: string;
  phone?: string;
  name?: string;
  email?: string;
  tags?: string[];
  customerSource?: string;
  address?: string;
  birthMonth?: number;
  birthDay?: number;
  pipelineStage?: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.id || !body.name?.trim()) {
    return NextResponse.json({ error: "id and name required" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return NextResponse.json({ error: "Convex is not configured." }, { status: 503 });

  try {
    const client = new ConvexHttpClient(url);
    const { api } = await import("../../../../convex/_generated/api");
    await client.mutation(api.customers.update, {
      id: body.id,
      phone: body.phone,
      name: body.name,
      email: body.email,
      tags: body.tags,
      customerSource: body.customerSource,
      address: body.address,
      birthMonth: body.birthMonth,
      birthDay: body.birthDay,
      pipelineStage: body.pipelineStage,
    } as Parameters<typeof client.mutation>[1]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update customer." },
      { status: 500 }
    );
  }
}
