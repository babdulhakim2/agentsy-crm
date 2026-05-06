// FoodImage — renders a restaurant photo with a graceful gradient fallback
// when the file isn't yet present in /public/sample-food/.

"use client";

import * as React from "react";

interface Props {
  src?: string;
  alt?: string;
  caption?: string;
  width?: number | string;
  height?: number | string;
  rounded?: number;
}

const GRADIENTS = [
  "linear-gradient(135deg, #b85f3a 0%, #d18465 60%, #f0e3c4 100%)",
  "linear-gradient(140deg, #6b3a1f 0%, #b85f3a 50%, #f1ddd0 100%)",
  "linear-gradient(135deg, #3a342c 0%, #6b6258 50%, #d18465 100%)",
  "linear-gradient(150deg, #b88532 0%, #d8ddc9 60%, #f5f0e6 100%)",
];

function pickGradient(seed: string): string {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % 1000;
  return GRADIENTS[n % GRADIENTS.length];
}

export function FoodImage({
  src,
  alt,
  caption,
  width = "100%",
  height = 140,
  rounded = 12,
}: Props) {
  const [failed, setFailed] = React.useState(false);
  const useFallback = !src || failed;
  const gradient = pickGradient(alt ?? src ?? "agentsy");

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: rounded,
        overflow: "hidden",
        background: useFallback ? gradient : "var(--paper-2)",
        flexShrink: 0,
      }}
      aria-label={alt}
    >
      {!useFallback && src && (
        // Plain <img> instead of next/image: keeps the demo zero-config and
        // avoids the strict next.config domain allowlist for placeholder paths.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          onError={() => setFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
      {useFallback && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            padding: 12,
            color: "#fff",
            fontFamily: "var(--serif)",
            fontSize: 16,
            lineHeight: 1.2,
            textShadow: "0 1px 8px rgba(26,22,18,0.4)",
          }}
        >
          {caption ?? alt}
        </div>
      )}
    </div>
  );
}
