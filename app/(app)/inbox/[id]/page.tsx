"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { FORGE } from "@/lib/data";
import { ThreadView } from "@/components/widgets/ThreadView";

export default function ThreadPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const F = FORGE;
  const t = F.threads.find((x) => x.id === params?.id) ?? F.threads[0];

  return (
    <div className="screen-mobile">
      <ThreadView thread={t} onBack={() => router.push("/inbox")} showBack />
    </div>
  );
}
