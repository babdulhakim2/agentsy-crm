// atoms.jsx — Shared icons and small components used across all screens.
// Outline-style icons (1.6 stroke), terracotta accents.

const Icon = {
  Home: ({s=20,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/>
    </svg>
  ),
  Users: ({s=20,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3.1-6 7-6s7 2.5 7 6"/>
      <circle cx="17" cy="6" r="2.5"/><path d="M22 19c0-2.5-2-4.3-4.5-4.3"/>
    </svg>
  ),
  Star: ({s=20,c='currentColor',w=1.6,filled=false}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:'none'} stroke={c} strokeWidth={w} strokeLinejoin="round">
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1L3 9.5l6.1-.9L12 3z"/>
    </svg>
  ),
  Inbox: ({s=20,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13l2-7a2 2 0 0 1 2-1.5h10a2 2 0 0 1 2 1.5l2 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <path d="M3 13h5l1.5 2h5L16 13h5"/>
    </svg>
  ),
  More: ({s=20,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>
    </svg>
  ),
  Check: ({s=18,c='currentColor',w=2}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l5 5L20 6"/>
    </svg>
  ),
  X: ({s=18,c='currentColor',w=1.8}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  ChevronRight: ({s=18,c='currentColor',w=1.8}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
  ),
  ChevronDown: ({s=18,c='currentColor',w=1.8}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
  ),
  ChevronLeft: ({s=18,c='currentColor',w=1.8}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
  ),
  Search: ({s=18,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>
    </svg>
  ),
  Settings: ({s=20,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
    </svg>
  ),
  Refresh: ({s=18,c='currentColor',w=1.7}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 16-5.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-16 5.7L3 16M3 21v-5h5"/>
    </svg>
  ),
  Sparkle: ({s=16,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/>
      <path d="M19 14l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>
    </svg>
  ),
  Plus: ({s=18,c='currentColor',w=2}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  Phone: ({s=16,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.7a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.7.7a2 2 0 0 1 1.7 2z"/>
    </svg>
  ),
  Mail: ({s=16,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>
    </svg>
  ),
  AlertTriangle: ({s=16,c='currentColor',w=1.7}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>
    </svg>
  ),
  Calendar: ({s=18,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
    </svg>
  ),
  Send: ({s=16,c='currentColor',w=1.7}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>
    </svg>
  ),
  Edit: ({s=16,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2 2 0 0 1 2.8 2.8L7 18.5 3 20l1.5-4z"/>
    </svg>
  ),
  Sun: ({s=22,c='currentColor',w=1.5}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
    </svg>
  ),
  Link: ({s=14,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/>
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>
    </svg>
  ),
  Tag: ({s=14,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12l-8 8a2 2 0 0 1-3 0l-7-7V4h9z"/><circle cx="7" cy="7" r="1.2"/>
    </svg>
  ),
  Filter: ({s=16,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18l-7 9v6l-4-2v-4z"/>
    </svg>
  ),
  Building: ({s=18,c='currentColor',w=1.6}) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="1"/>
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M11 21v-3h2v3"/>
    </svg>
  ),
};

// Brand mark — small terracotta sigil
function AgentsyMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="#b85f3a" strokeWidth="1.5"/>
      <path d="M10 22 L16 8 L22 22 M12.5 17 H19.5" stroke="#b85f3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Logos for integrations — generic squared marks (no copyrighted logos)
function ProviderMark({ name, size = 36 }) {
  const map = {
    'ResDiary':    { letter: 'R', bg: '#e9d5cc', fg: '#a23a2e' },
    'Access Collins': { letter: 'C', bg: '#dde1d3', fg: '#5a6a3f' },
    'OpenTable':   { letter: 'O', bg: '#f0d8c5', fg: '#b85f3a' },
    'SevenRooms':  { letter: '7', bg: '#e3d8c0', fg: '#3a342c' },
    'Eat App':     { letter: 'E', bg: '#f0e3c4', fg: '#b88532' },
    'Other':       { letter: '+', bg: '#ede5d3', fg: '#6b6258' },
    'Square':      { letter: '◻', bg: '#dee5e8', fg: '#3e5b6e' },
    'Lightspeed':  { letter: 'L', bg: '#e3d8c0', fg: '#a23a2e' },
    'Toast':       { letter: 'T', bg: '#f0d8c5', fg: '#b85f3a' },
    'Google Business Profile': { letter: 'G', bg: '#fbf7ef', fg: '#b88532' },
    'WhatsApp':    { letter: '◉', bg: '#d8ddc9', fg: '#5a6a3f' },
    'Instagram':   { letter: '⊙', bg: '#f1ddd0', fg: '#b85f3a' },
    'Email':       { letter: '@', bg: '#ede5d3', fg: '#3a342c' },
  };
  const m = map[name] || map['Other'];
  return (
    <div style={{
      width: size, height: size, borderRadius: 9,
      background: m.bg, color: m.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Fraunces', Georgia, serif",
      fontWeight: 500, fontSize: size * 0.46,
      flexShrink: 0,
      border: '1px solid rgba(26,22,18,0.06)',
    }}>{m.letter}</div>
  );
}

// Small star rating row
function StarRow({ value, size = 13, color = '#b88532' }) {
  return (
    <div style={{ display: 'inline-flex', gap: 1.5 }}>
      {[1,2,3,4,5].map(i => (
        <Icon.Star key={i} s={size} c={i <= value ? color : 'rgba(26,22,18,0.18)'} filled={i <= value} w={1.4}/>
      ))}
    </div>
  );
}

// Status bar (simulated — for non-iOS-frame screens)
function MiniStatusBar({ dark = false }) {
  const c = dark ? '#fff' : '#1a1612';
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 22px 6px',
      fontFamily: 'system-ui', fontSize: 14, fontWeight: 600, color: c,
    }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <span style={{ fontSize: 11 }}>●●●●</span>
        <span style={{ fontSize: 11 }}>◐</span>
      </span>
    </div>
  );
}

// Section header (used in Today brief)
function SectionHeader({ icon, title, count, expanded = true, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', background: 'none', border: 'none',
      padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      borderTop: '1px solid var(--rule)',
      color: 'var(--ink)',
      cursor: 'pointer',
      textAlign: 'left',
    }}>
      <span style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s', display: 'flex' }}>
        <Icon.ChevronDown s={14} w={2}/>
      </span>
      <span style={{ flex: 1, fontWeight: 600, fontSize: 14, letterSpacing: '0.005em' }}>{title}</span>
      {count !== undefined && (
        <span className="tag-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>
      )}
    </button>
  );
}

Object.assign(window, { Icon, AgentsyMark, ProviderMark, StarRow, MiniStatusBar, SectionHeader });
