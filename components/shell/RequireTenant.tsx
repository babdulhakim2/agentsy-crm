// RequireTenant — client guard inside the (app) layout.
//
// Flow:
//   1. Wait for Clerk to load.
//   2. Make sure the Convex `users` row exists (upsertCurrent).
//   3. Fetch users.current. If the user has no tenant memberships,
//      bounce to /onboarding so they can create one.
//   4. Otherwise, render the operator app.
//
// Skipped entirely when Convex isn't configured — keeps demo / design mode usable.

"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexReady } from "@/lib/convex";
import { readTenantFromStorage } from "@/lib/tenant-storage";

export function RequireTenant({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted || !isConvexReady()) return <>{children}</>;
  return <Guard>{children}</Guard>;
}

function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { isLoaded, isSignedIn, user } = useUser();
  const upsert = useMutation(api.users.upsertCurrent);
  const current = useQuery(api.users.current);
  const [syncAttempted, setSyncAttempted] = React.useState(false);
  const [hasLocalTenant, setHasLocalTenant] = React.useState(false);

  React.useEffect(() => {
    setHasLocalTenant(Boolean(readTenantFromStorage()));
  }, []);

  // Sync the Clerk user into Convex once on load.
  React.useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    setSyncAttempted(false);
    upsert({
      email: user.primaryEmailAddress?.emailAddress ?? undefined,
      name: user.fullName ?? undefined,
      imageUrl: user.imageUrl,
    })
      .catch((err) => console.error("users.upsertCurrent failed", err))
      .finally(() => setSyncAttempted(true));
  }, [isLoaded, isSignedIn, user, upsert]);

  const waitingForUserSync = isSignedIn && current === null && !syncAttempted;
  const loading = !isLoaded || current === undefined || waitingForUserSync;
  const hasTenant = !loading && (current?.tenants.some((t) => t.group) ?? false);
  const needsOnboarding = !loading && !hasTenant && !hasLocalTenant && pathname !== "/onboarding";

  React.useEffect(() => {
    if (needsOnboarding) router.replace("/onboarding");
  }, [needsOnboarding, router]);

  if (loading || needsOnboarding) return <Loading />;
  return <>{children}</>;
}

function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--ink-3)",
        fontFamily: "var(--serif)",
        fontSize: 18,
        fontStyle: "italic",
      }}
    >
      One moment…
    </div>
  );
}
