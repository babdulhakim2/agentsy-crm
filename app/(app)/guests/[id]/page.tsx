"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { FORGE } from "@/lib/data";
import { GuestDetailView } from "@/components/widgets/GuestDetailView";

export default function GuestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const F = FORGE;
  const id = params?.id;
  const g = F.guests.find((x) => x.id === id) ?? F.guests[2];

  return (
    <div className="screen-mobile paper-grain">
      <GuestDetailView guest={g} onBack={() => router.push("/guests")} showBack />
    </div>
  );
}
