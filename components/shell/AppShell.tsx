import * as React from "react";
import { Sidebar } from "./Sidebar";
import { BottomTabs } from "./BottomTabs";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Sidebar />
      <main className="shell-main">{children}</main>
      <BottomTabs />
    </div>
  );
}
