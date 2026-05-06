import * as React from "react";
import { AppShell } from "@/components/shell/AppShell";
import { SiteProvider } from "@/lib/site-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProvider>
      <AppShell>{children}</AppShell>
    </SiteProvider>
  );
}
