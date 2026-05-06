import * as React from "react";
import { SiteProvider } from "@/lib/site-context";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return <SiteProvider>{children}</SiteProvider>;
}
