"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { BottomTabs } from "./BottomTabs";
import { MobileSiteBar } from "./MobileSiteBar";
import { AddBranchSheet, type BranchPayload } from "../widgets/AddBranchSheet";
import { useSite } from "@/lib/site-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { addSite } = useSite();
  const [addBranchOpen, setAddBranchOpen] = React.useState(false);

  const handleAdd = (b: BranchPayload) => {
    addSite({ name: b.name, address: b.address });
  };

  return (
    <div className="shell">
      <Sidebar onAddBranch={() => setAddBranchOpen(true)} />
      <main className="shell-main">
        <MobileSiteBar onAddBranch={() => setAddBranchOpen(true)} />
        {children}
      </main>
      <BottomTabs />
      <AddBranchSheet
        open={addBranchOpen}
        onClose={() => setAddBranchOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}
