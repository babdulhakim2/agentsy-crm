// Dev-friendly proxy: Google redirects here on localhost, we forward the
// code+state to Convex's HTTP router (which is hosted on .convex.site),
// and let it do the token exchange + final redirect back into the app.
//
// This lets us keep `http://localhost:3001/oauth/google/callback` in the
// Google Cloud Console redirect list during development.

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const convexSite = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!convexSite) {
    return new NextResponse(
      "NEXT_PUBLIC_CONVEX_SITE_URL not set. Either configure it or move your redirect URI to the .convex.site domain directly.",
      { status: 500 }
    );
  }
  const target = new URL("/oauth/google/callback", convexSite);
  req.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  return NextResponse.redirect(target, 302);
}
