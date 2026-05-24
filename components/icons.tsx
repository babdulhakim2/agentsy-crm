// Icon set — outline icons (1.6 stroke), terracotta accents.
// Ported from atoms.jsx with proper TS types.

import * as React from "react";

interface IconProps {
  s?: number; // size
  c?: string; // color
  w?: number; // stroke width
  filled?: boolean;
  className?: string;
}

const SVG = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement> & { size: number }>(
  function SVG({ size, ...rest }, ref) {
    return <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest} />;
  }
);

export const Icon = {
  Home: ({ s = 20, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
    </SVG>
  ),
  Users: ({ s = 20, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 21c0-3.5 3.1-6 7-6s7 2.5 7 6" />
      <circle cx="17" cy="6" r="2.5" />
      <path d="M22 19c0-2.5-2-4.3-4.5-4.3" />
    </SVG>
  ),
  Star: ({ s = 20, c = "currentColor", w = 1.6, filled = false, className }: IconProps) => (
    <SVG size={s} fill={filled ? c : "none"} stroke={c} strokeWidth={w} strokeLinejoin="round" className={className}>
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3 9.5l6.1-.9L12 3z" />
    </SVG>
  ),
  Inbox: ({ s = 20, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 13h5l1.5 2h5L16 13h5" />
    </SVG>
  ),
  More: ({ s = 20, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
    </SVG>
  ),
  Check: ({ s = 18, c = "currentColor", w = 2, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 12l5 5L20 6" />
    </SVG>
  ),
  X: ({ s = 18, c = "currentColor", w = 1.8, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </SVG>
  ),
  ChevronRight: ({ s = 18, c = "currentColor", w = 1.8, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 6l6 6-6 6" />
    </SVG>
  ),
  ChevronDown: ({ s = 18, c = "currentColor", w = 1.8, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9l6 6 6-6" />
    </SVG>
  ),
  ChevronLeft: ({ s = 18, c = "currentColor", w = 1.8, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 6l-6 6 6 6" />
    </SVG>
  ),
  Search: ({ s = 18, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </SVG>
  ),
  Settings: ({ s = 20, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </SVG>
  ),
  Refresh: ({ s = 18, c = "currentColor", w = 1.7, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 16-5.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-16 5.7L3 16M3 21v-5h5" />
    </SVG>
  ),
  Sparkle: ({ s = 16, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M19 14l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </SVG>
  ),
  Plus: ({ s = 18, c = "currentColor", w = 2, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14M5 12h14" />
    </SVG>
  ),
  Phone: ({ s = 16, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.7a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </SVG>
  ),
  Mail: ({ s = 16, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </SVG>
  ),
  AlertTriangle: ({ s = 16, c = "currentColor", w = 1.7, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />
    </SVG>
  ),
  Calendar: ({ s = 18, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </SVG>
  ),
  Send: ({ s = 16, c = "currentColor", w = 1.7, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
    </SVG>
  ),
  Edit: ({ s = 16, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2 2 0 0 1 2.8 2.8L7 18.5 3 20l1.5-4z" />
    </SVG>
  ),
  Upload: ({ s = 16, c = "currentColor", w = 1.7, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </SVG>
  ),
  Trash: ({ s = 16, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </SVG>
  ),
  Sun: ({ s = 22, c = "currentColor", w = 1.5, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </SVG>
  ),
  Link: ({ s = 14, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </SVG>
  ),
  Tag: ({ s = 14, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 12l-8 8a2 2 0 0 1-3 0l-7-7V4h9z" />
      <circle cx="7" cy="7" r="1.2" />
    </SVG>
  ),
  Filter: ({ s = 16, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 5h18l-7 9v6l-4-2v-4z" />
    </SVG>
  ),
  Building: ({ s = 18, c = "currentColor", w = 1.6, className }: IconProps) => (
    <SVG size={s} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M11 21v-3h2v3" />
    </SVG>
  ),
};
