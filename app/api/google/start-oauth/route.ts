import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

interface Body {
  groupId?: string;
  siteId?: string;
  redirectAfter?: string;
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
  if (!body.groupId || !body.redirectAfter) {
    return NextResponse.json({ error: "groupId and redirectAfter required" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return NextResponse.json({ error: "Convex is not configured." }, { status: 503 });

  const token = await getToken({ template: "convex" });
  if (!token) {
    return NextResponse.json(
      { error: 'Clerk did not return a JWT for the template named "convex".' },
      { status: 500 }
    );
  }

  try {
    const client = new ConvexHttpClient(url);
    client.setAuth(token);
    const { api } = await import("../../../../convex/_generated/api");
    const result = await client.action(api.google.startOAuth, {
      groupId: body.groupId,
      siteId: body.siteId,
      redirectAfter: body.redirectAfter,
    } as Parameters<typeof client.action>[1]);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start Google OAuth." },
      { status: 500 }
    );
  }
}
