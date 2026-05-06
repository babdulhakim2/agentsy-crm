// Convex client setup. Uses React.createElement to avoid needing a .tsx extension.

"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

let cached: ConvexReactClient | null = null;

export function getConvexClient(): ConvexReactClient | null {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  if (!cached) cached = new ConvexReactClient(url);
  return cached;
}

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const client = getConvexClient();
  if (!client) {
    return React.createElement(React.Fragment, null, children);
  }
  return React.createElement(ConvexProviderWithClerk, { client, useAuth, children });
}

export function isConvexReady(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}
