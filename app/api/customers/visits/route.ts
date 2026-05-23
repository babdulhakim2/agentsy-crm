import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    return NextResponse.json({ visits: [], pendingDeployment: true });
  }

  try {
    const client = new ConvexHttpClient(url);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - convex/_generated is created by the Convex CLI.
    const { api } = await import("../../../../convex/_generated/api");
    const visits = await client.query(api.customers.visitsForCustomer, {
      customerId,
      limit: 6,
    } as Parameters<typeof client.query>[1]);
    return NextResponse.json({ visits });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load visits.";
    if (message.includes("Could not find public function")) {
      return NextResponse.json({ visits: [], pendingDeployment: true });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
