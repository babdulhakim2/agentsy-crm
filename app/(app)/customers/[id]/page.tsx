"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { FORGE } from "@/lib/data";
import { CustomerDetailView } from "@/components/widgets/CustomerDetailView";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const F = FORGE;
  const id = params?.id;
  const c = F.customers.find((x) => x.id === id) ?? F.customers[2];

  return (
    <div className="screen-mobile paper-grain">
      <CustomerDetailView customer={c} onBack={() => router.push("/customers")} showBack />
    </div>
  );
}
