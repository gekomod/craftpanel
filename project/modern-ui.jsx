// modern-ui.jsx — UI primitives for the modern 2026 redesign

const { useState, useEffect, useRef, useMemo } = React;

// ── Phosphor-style icons (clean, line-based) ──
function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.6 }) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { display: 'inline-block', flexShrink: 0 },
  };
  const paths = {
    'home':     <><path d="M3 12 12 3l9 9"/><path d="M5 10v10h14V10"/></>,
    'server':   <><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><circle cx="7" cy="7.5" r="0.5" fill="currentColor"/><circle cx="7" cy="16.5" r="0.5" fill="currentColor"/></>,
    'terminal': <><path d="M4 6l4 4-4 4"/><path d="M11 16h8"/><rect x="2" y="3" width="20" height="18" rx="2"/></>,
    'users':    <><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M22 20c0-3-2-5.5-5-5.9"/></>,
    'plug':     <><path d="M9 2v4"/><path d="M15 2v4"/><rect x="6" y="6" width="12" height="9" rx="1"/><path d="M12 15v4"/><path d="M9 19h6"/></>,
    'folder':   <><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/></>,
    'archive':  <><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/></>,
    'settings': <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.2a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.2a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>,
    'play':     <><path d="M6 4l14 8-14 8z"/></>,
    'stop':     <><rect x="6" y="6" width="12" height="12" rx="1"/></>,
    'restart':  <><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></>,
    'power':    <><path d="M12 3v9"/><path d="M5.6 7.4a8 8 0 1 0 12.8 0"/></>,
    'plus':     <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    'search':   <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    'check':    <><path d="m5 12 5 5 9-11"/></>,
    'x':        <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    'arrow-l':  <><path d="m15 18-6-6 6-6"/></>,
    'arrow-r':  <><path d="m9 6 6 6-6 6"/></>,
    'chevron-d':<><path d="m6 9 6 6 6-6"/></>,
    'cpu':      <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></>,
    'memory':   <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10v4"/><path d="M11 10v4"/><path d="M15 10v4"/></>,
    'gauge':    <><path d="M12 14a2 2 0 1 0 2-2"/><path d="M13.4 10.6 19 5"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></>,
    'globe':    <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></>,
    'shield':   <><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/></>,
    'flame':    <><path d="M8.5 14.5C7 13 6 11.3 6 9c0-3 2-5 4-7 1 2 2 3 3 5 1 1 1 1.5 1 3 1-1 2-2 2-3.5 0 .5 2 3.5 2 7 0 5-3 9-8 9s-7-3.5-7-7c0-2 1-3 1.5-2 .8 1.5 2 1 4 1Z"/></>,
    'cube':     <><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 8 9 5 9-5"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></>,
    'edit':     <><path d="M12 20h9"/><path d="M16.5 3.5a2 2 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
    'trash':    <><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></>,
    'download': <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    'upload':   <><path d="M12 17V5"/><path d="m7 10 5-5 5 5"/><path d="M5 21h14"/></>,
    'bell':     <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    'crown':    <><path d="m2 7 5 5 5-7 5 7 5-5-2 13H4z"/></>,
    'logout':   <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>,
    'pin':      <><path d="M12 17v5"/><path d="M5 11a7 7 0 0 1 14 0c0 5-7 8-7 8s-7-3-7-8Z"/><circle cx="12" cy="11" r="2.5"/></>,
    'eye':      <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    'sparkle':  <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>,
    'tnt':      <><rect x="4" y="8" width="16" height="12" rx="1"/><path d="M11 8V5"/><path d="M11 5l3-2 1 2 2-1"/></>,
  };
  return <svg {...props}>{paths[name] || paths['home']}</svg>;
}

// ── 3D-style minecraft cube logo (small, modern) ──
function CubeLogo({ size = 28, color }) {
  const c = color || 'var(--accent)';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="cubeT" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c} stopOpacity="1"/>
          <stop offset="1" stopColor={c} stopOpacity="0.7"/>
        </linearGradient>
      </defs>
      {/* Top */}
      <path d="M16 3 L28 9 L16 15 L4 9 Z" fill="url(#cubeT)" />
      {/* Right */}
      <path d="M28 9 L28 22 L16 28 L16 15 Z" fill={c} fillOpacity="0.55" />
      {/* Left */}
      <path d="M4 9 L4 22 L16 28 L16 15 Z" fill={c} fillOpacity="0.35" />
      {/* outline */}
      <path d="M16 3 L28 9 L28 22 L16 28 L4 22 L4 9 Z" fill="none" stroke={c} strokeWidth="0.8" strokeOpacity="0.4" strokeLinejoin="round"/>
      <path d="M16 15 L16 28 M16 15 L4 9 M16 15 L28 9" stroke={c} strokeWidth="0.5" strokeOpacity="0.4"/>
    </svg>
  );
}

// ── Player avatar (modern flat circle with initial) ──
function Avatar({ name, skin, size = 32 }) {
  const colors = {
    steve: '#60a5fa', alex: '#fb923c', enderman: '#a855f7',
    redstone: '#f87171', panda: '#86efac', piglin: '#fbbf24',
    creeper: '#4ade80', witch: '#c084fc', iron: '#94a3b8',
  };
  const c = colors[skin] || '#60a5fa';
  const initial = (name || '?').charAt(0).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${c}, ${c}aa)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#0a0a0a', fontWeight: 700, fontSize: size * 0.42,
      flexShrink: 0,
      boxShadow: `0 2px 8px ${c}33, inset 0 1px 0 rgba(255,255,255,0.2)`,
    }}>
      {initial}
    </div>
  );
}

// ── Server type icon (subtle gradient block) ──
function ServerBadge({ kind, size = 44 }) {
  const themes = {
    grass:      { c1: '#4ade80', c2: '#22c55e', glyph: 'cube' },
    diamond:    { c1: '#22d3ee', c2: '#0ea5e9', glyph: 'cube' },
    gold:       { c1: '#fbbf24', c2: '#f59e0b', glyph: 'sparkle' },
    netherite:  { c1: '#52525b', c2: '#27272a', glyph: 'shield' },
    tnt:        { c1: '#f87171', c2: '#dc2626', glyph: 'tnt' },
    enderpearl: { c1: '#c084fc', c2: '#a855f7', glyph: 'flame' },
  };
  const t = themes[kind] || themes.grass;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: 12,
      background: `linear-gradient(135deg, ${t.c1}, ${t.c2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(0,0,0,0.7)',
      flexShrink: 0,
      boxShadow: `0 4px 16px ${t.c1}33, inset 0 1px 0 rgba(255,255,255,0.25)`,
    }}>
      <Icon name={t.glyph} size={size * 0.52} strokeWidth={2} />
    </div>
  );
}

// ── Sparkline / area chart ──
function Sparkline({ data, color = 'var(--accent)', height = 50, max, min = 0, fill = true }) {
  const w = 200;
  const M = max ?? Math.max(...data) * 1.1;
  const m = min;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - m) / (M - m || 1)) * height;
    return [x, y];
  });
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const fillD = d + ` L${w} ${height} L0 ${height} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/\W/g,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3"/>
          <stop offset="1" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={fillD} fill={`url(#sg-${color.replace(/\W/g,'')})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="6" fill={color} fillOpacity="0.25"/>
    </svg>
  );
}

// ── Subtle floating particles backdrop ──
function ParticleField({ animations, theme }) {
  if (!animations) return null;
  const colors = {
    default: '#4ade80', nether: '#f87171', end: '#c084fc', aqua: '#22d3ee',
  };
  const c = colors[theme] || colors.default;
  const items = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      left: (i * 13.7) % 100,
      delay: -i * 1.4,
      duration: 16 + (i % 5) * 4,
      size: 2 + (i % 3),
    })), []);
  return (
    <>
      {items.map((p, i) => (
        <div key={i} className="particle" style={{
          left: `${p.left}%`, bottom: -10,
          width: p.size, height: p.size,
          background: c, boxShadow: `0 0 ${p.size * 3}px ${c}`,
          animation: `drift ${p.duration}s linear ${p.delay}s infinite`,
        }} />
      ))}
    </>
  );
}

// ── Tabs ──
function Tabs({ items, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line-1)', padding: '0 4px' }}>
      {items.map(it => (
        <div
          key={it.id}
          className={value === it.id ? 'tab tab-active' : 'tab'}
          onClick={() => onChange(it.id)}
          style={{ borderRadius: 0, borderBottom: value === it.id ? '2px solid var(--accent)' : '2px solid transparent', marginBottom: -1, paddingBottom: 12 }}
        >
          {it.icon && <Icon name={it.icon} size={15} />}
          {it.label}
          {it.count != null && (
            <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{it.count}</span>
          )}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Icon, CubeLogo, Avatar, ServerBadge, Sparkline, ParticleField, Tabs });
