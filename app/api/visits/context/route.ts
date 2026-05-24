import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get("groupId");
  const siteId = req.nextUrl.searchParams.get("siteId");
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url || !groupId) {
    return NextResponse.json({ restaurantName: "Thanks for visiting" });
  }

  try {
    const client = new ConvexHttpClient(url);
    const { api } = await import("../../../../convex/_generated/api");
    const [group, sites] = await Promise.all([
      client.query(api.groups.get, { id: groupId } as Parameters<typeof client.query>[1]),
      client.query(api.sites.list, { groupId } as Parameters<typeof client.query>[1]),
    ]);
    const site = sites.find((row) => row._id === siteId) ?? sites[0];
    return NextResponse.json({
      restaurantName: group?.name ?? "Thanks for visiting",
      logoUrl: group?.logoUrl,
      siteName: site?.name,
      visitsRequired: site?.visitRewardVisits ?? 3,
      rewardLabel: site?.visitRewardLabel ?? "20% off",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load visit context." },
      { status: 500 }
    );
  }
}
