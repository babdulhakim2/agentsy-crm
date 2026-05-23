import * as React from "react";
import { AppShell } from "@/components/shell/AppShell";
import { RequireTenant } from "@/components/shell/RequireTenant";
import { SiteProvider } from "@/lib/site-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProvider>
      <RequireTenant>
        <AppShell>{children}</AppShell>
      </RequireTenant>
    </SiteProvider>
  );
}
