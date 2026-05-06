// Full-screen image preview. Esc or backdrop click closes.

"use client";

import * as React from "react";
import { Icon } from "../icons";

interface Props {
  src?: string;
  alt?: string;
  caption?: string;
  open: boolean;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, caption, open, onClose }: Props) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(26, 22, 18, 0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 0.18s ease-out both",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          width: 44,
          height: 44,
          borderRadius: 999,
          background: "rgba(245,240,230,0.1)",
          border: "1px solid rgba(245,240,230,0.2)",
          color: "#f5f0e6",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon.X s={22} c="#f5f0e6" />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ""}
        style={{
          maxWidth: "min(960px, 100%)",
          maxHeight: "calc(100vh - 140px)",
          objectFit: "contain",
          borderRadius: 14,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      />

      {caption && (
        <div
          style={{
            marginTop: 18,
            color: "#f5f0e6",
            fontFamily: "var(--serif)",
            fontSize: 16,
            textAlign: "center",
            maxWidth: 600,
            lineHeight: 1.4,
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}
