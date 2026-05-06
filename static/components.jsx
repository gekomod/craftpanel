// CraftPanel — UI primitive components
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ─── v3 Pixel-art blocks, characters, heads ─────────────────────────────────
function Block({ kind = 'grass', size = 28 }) {
  const blocks = {
    grass:    { top: '#5fa83b', side: '#79553a', light: '#7bc54e', dark: '#3b6a23' },
    dirt:     { top: '#79553a', side: '#79553a', light: '#8e6849', dark: '#5e3f29' },
    stone:    { top: '#8a8a8a', side: '#6b6b6b', light: '#a0a0a0', dark: '#5a5a5a' },
    cobble:   { top: '#888',    side: '#5b5b5b', light: '#aaa',    dark: '#444' },
    diamond:  { top: '#5cdbd5', side: '#3a8a86', light: '#88e8e2', dark: '#1f5e5a' },
    gold:     { top: '#fdc500', side: '#a88800', light: '#ffe050', dark: '#7a6000' },
    iron:     { top: '#d8d8d8', side: '#8a8a8a', light: '#f0f0f0', dark: '#666' },
    netherite:{ top: '#3a3030', side: '#2a2020', light: '#4a4040', dark: '#1a1010' },
    redstone: { top: '#c41e1e', side: '#7a1010', light: '#ff5050', dark: '#4a0808' },
    emerald:  { top: '#17dd62', side: '#0a8a3a', light: '#3aff80', dark: '#055020' },
    lapis:    { top: '#3a6ad0', side: '#1e4ab0', light: '#6090ff', dark: '#0e2a70' },
    tnt:      { top: '#c41e1e', side: '#c41e1e', light: '#e83a3a', dark: '#7a1010' },
    enderpearl:{top: '#1a3a3a', side: '#0a1a1a', light: '#2a5a5a', dark: '#000' },
    chest:    { top: '#a06a30', side: '#7a4a20', light: '#c08850', dark: '#4a2a10' },
    void:     { top: '#1a1a1a', side: '#0a0a0a', light: '#2a2a2a', dark: '#000' },
    grass_path:{top:'#a08868', side: '#79553a', light: '#c0a888', dark: '#5e3f29' },
  };
  const b = blocks[kind] || blocks.stone;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block' }}>
      <rect x="0" y="0" width="16" height="4" fill={b.top} />
      <rect x="0" y="4" width="16" height="12" fill={b.side} />
      <rect x="0" y="4" width="1" height="12" fill={b.light} />
      <rect x="0" y="4" width="16" height="1" fill={b.light} />
      <rect x="15" y="4" width="1" height="12" fill={b.dark} />
      <rect x="0" y="15" width="16" height="1" fill={b.dark} />
      {kind === 'grass' && (<>
        <rect x="2" y="1" width="1" height="1" fill={b.light} />
        <rect x="7" y="2" width="1" height="1" fill={b.dark} />
        <rect x="12" y="1" width="1" height="1" fill={b.light} />
      </>)}
      {kind === 'diamond' && (<>
        <rect x="3" y="7" width="2" height="2" fill="#fff" />
        <rect x="11" y="11" width="2" height="2" fill="#fff" />
      </>)}
      {kind === 'gold' && (<>
        <rect x="3" y="7" width="1" height="1" fill="#fff8a0" />
        <rect x="11" y="10" width="1" height="1" fill="#fff8a0" />
      </>)}
      {kind === 'tnt' && (<>
        <rect x="0" y="3" width="16" height="1.5" fill="#fff" />
        <rect x="0" y="13" width="16" height="1.5" fill="#fff" />
        <text x="8" y="11" fontSize="5" fill="#fff" textAnchor="middle" fontFamily="monospace" fontWeight="bold">TNT</text>
      </>)}
      {kind === 'redstone' && (<>
        <rect x="3" y="7" width="1" height="1" fill="#ff8080" />
        <rect x="11" y="10" width="1" height="1" fill="#ff8080" />
      </>)}
      {(kind === 'stone' || kind === 'cobble' || kind === 'iron') && (<>
        <rect x="3" y="8" width="1" height="1" fill={b.dark} />
        <rect x="9" y="6" width="1" height="1" fill={b.light} />
        <rect x="12" y="11" width="1" height="1" fill={b.dark} />
      </>)}
      {kind === 'dirt' && (<>
        <rect x="3" y="7" width="2" height="2" fill={b.light} />
        <rect x="9" y="9" width="2" height="2" fill={b.dark} />
        <rect x="6" y="12" width="2" height="1" fill={b.light} />
      </>)}
    </svg>
  );
}

// ─────────── CHARACTER (pixel-art Steve / Alex / Creeper) ───────────
function Character({ kind = 'steve', size = 64 }) {
  // Full-body 8x16 pixel character
  const chars = {
    steve: {
      hair: '#3a2410', face: '#b08868', eye: '#3050d0', mouth: '#5a3a20',
      shirt: '#0098db', shirtD: '#006da0', arm: '#b08868',
      pants: '#3a3aa0', shoe: '#1a1a4a',
    },
    alex: {
      hair: '#cc8050', face: '#f9c69b', eye: '#509050', mouth: '#aa5050',
      shirt: '#3aa055', shirtD: '#207035', arm: '#f9c69b',
      pants: '#7a4a30', shoe: '#3a2010',
    },
    creeper: {
      hair: '#5fa83b', face: '#5fa83b', eye: '#000', mouth: '#000',
      shirt: '#5fa83b', shirtD: '#3b6a23', arm: '#5fa83b',
      pants: '#5fa83b', shoe: '#3b6a23',
    },
    enderman: {
      hair: '#000', face: '#0a0a0a', eye: '#c84cff', mouth: '#0a0a0a',
      shirt: '#000', shirtD: '#0a0a0a', arm: '#000',
      pants: '#000', shoe: '#000',
    },
  };
  const c = chars[kind] || chars.steve;
  return (
    <svg width={size} height={size * 2} viewBox="0 0 8 16" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block' }}>
      {/* Head */}
      <rect x="2" y="0" width="4" height="4" fill={c.face} />
      <rect x="2" y="0" width="4" height="1" fill={c.hair} />
      {kind !== 'creeper' && kind !== 'enderman' && <>
        <rect x="2" y="1" width="1" height="1" fill={c.hair} />
        <rect x="5" y="1" width="1" height="1" fill={c.hair} />
      </>}
      {/* Eyes */}
      {kind === 'creeper' ? (<>
        <rect x="2" y="1" width="1" height="1" fill={c.eye} />
        <rect x="5" y="1" width="1" height="1" fill={c.eye} />
        <rect x="3" y="2" width="2" height="2" fill={c.eye} />
        <rect x="2" y="2" width="1" height="1" fill={c.eye} />
        <rect x="5" y="2" width="1" height="1" fill={c.eye} />
      </>) : (<>
        <rect x="3" y="2" width="1" height="1" fill="#fff" />
        <rect x="4" y="2" width="1" height="1" fill={c.eye} />
        <rect x="3" y="2" width="0.5" height="1" fill={c.eye} />
        {kind !== 'enderman' && <rect x="3" y="3" width="2" height="0.5" fill={c.mouth} />}
        {kind === 'enderman' && <>
          <rect x="3" y="2" width="1" height="1" fill={c.eye} />
          <rect x="4" y="2" width="1" height="1" fill={c.eye} />
        </>}
      </>)}
      {/* Body */}
      <rect x="2" y="4" width="4" height="6" fill={c.shirt} />
      <rect x="2" y="9" width="4" height="1" fill={c.shirtD} />
      {/* Arms */}
      <rect x="1" y="4" width="1" height="6" fill={c.arm} />
      <rect x="6" y="4" width="1" height="6" fill={c.arm} />
      <rect x="1" y="4" width="1" height="3" fill={c.shirt} />
      <rect x="6" y="4" width="1" height="3" fill={c.shirt} />
      {/* Legs */}
      <rect x="2" y="10" width="2" height="5" fill={c.pants} />
      <rect x="4" y="10" width="2" height="5" fill={c.pants} />
      {/* Shoes */}
      <rect x="2" y="14" width="2" height="1" fill={c.shoe} />
      <rect x="4" y="14" width="2" height="1" fill={c.shoe} />
      {/* Shadow */}
      <ellipse cx="4" cy="15.5" rx="2.5" ry="0.4" fill="rgba(0,0,0,0.5)" />
    </svg>
  );
}

// ─────────── PLAYER HEAD (avatar) ───────────
function Head({ kind = 'steve', size = 28 }) {
  const skins = {
    steve:    { face: '#b08868', hair: '#3a2410', eye: '#3050d0', mouth: '#5a3a20' },
    alex:     { face: '#f9c69b', hair: '#cc8050', eye: '#509050', mouth: '#aa5050' },
    enderman: { face: '#0a0a0a', hair: '#000',    eye: '#c84cff', mouth: '#000' },
    redstone: { face: '#b08868', hair: '#c41e1e', eye: '#000',    mouth: '#5a3a20' },
    panda:    { face: '#f0f0f0', hair: '#1a1a1a', eye: '#1a1a1a', mouth: '#1a1a1a' },
    piglin:   { face: '#f0a89a', hair: '#a06040', eye: '#000',    mouth: '#7a3a30' },
    creeper:  { face: '#5fa83b', hair: '#3b6a23', eye: '#1a1a1a', mouth: '#1a1a1a' },
    witch:    { face: '#506060', hair: '#1a1a1a', eye: '#a020a0', mouth: '#3a2030' },
    iron:     { face: '#d8d8d8', hair: '#88c0a0', eye: '#88c0a0', mouth: '#888' },
  };
  const s = skins[kind] || skins.steve;
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'block', borderRadius: 4 }}>
      <rect x="0" y="0" width="8" height="8" fill={s.face} />
      <rect x="0" y="0" width="8" height="2" fill={s.hair} />
      <rect x="0" y="2" width="1" height="1" fill={s.hair} />
      <rect x="7" y="2" width="1" height="1" fill={s.hair} />
      <rect x="2" y="3" width="1" height="1" fill="#fff" />
      <rect x="5" y="3" width="1" height="1" fill="#fff" />
      <rect x="2" y="4" width="1" height="1" fill={s.eye} />
      <rect x="5" y="4" width="1" height="1" fill={s.eye} />
      <rect x="3" y="6" width="2" height="1" fill={s.mouth} />
    </svg>
  );
}

function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.6 }) {
  const props = {
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { display: 'inline-block', flexShrink: 0 },
  };
  const paths = {
    'home':    <><path d="M3 12 12 3l9 9"/><path d="M5 10v10h14V10"/></>,
    'server':  <><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><circle cx="7" cy="7.5" r="0.5" fill="currentColor"/><circle cx="7" cy="16.5" r="0.5" fill="currentColor"/></>,
    'terminal':<><path d="M4 6l4 4-4 4"/><path d="M11 16h8"/><rect x="2" y="3" width="20" height="18" rx="2"/></>,
    'users':   <><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M22 20c0-3-2-5.5-5-5.9"/></>,
    'plug':    <><path d="M9 2v4"/><path d="M15 2v4"/><rect x="6" y="6" width="12" height="9" rx="1"/><path d="M12 15v4"/><path d="M9 19h6"/></>,
    'folder':  <><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/></>,
    'archive': <><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/></>,
    'settings':<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.2a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.2a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>,
    'play':    <><path d="M6 4l14 8-14 8z"/></>,
    'stop':    <><rect x="6" y="6" width="12" height="12" rx="1"/></>,
    'restart': <><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></>,
    'power':   <><path d="M12 3v9"/><path d="M5.6 7.4a8 8 0 1 0 12.8 0"/></>,
    'plus':    <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    'search':  <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    'check':   <><path d="m5 12 5 5 9-11"/></>,
    'save':    <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
    'x':       <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    'arrow-l': <><path d="m15 18-6-6 6-6"/></>,
    'arrow-r': <><path d="m9 6 6 6-6 6"/></>,
    'arrow-left': <><path d="m15 18-6-6 6-6"/></>,
    'chevron-d':<><path d="m6 9 6 6 6-6"/></>,
    'chevron-right': <><path d="m9 6 6 6-6 6"/></>,
    'chevron-left': <><path d="m15 18-6-6 6-6"/></>,
    'grid': <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    'puzzle': <><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></>,
    'sliders': <><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></>,
    'cpu':     <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></>,
    'memory':  <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10v4"/><path d="M11 10v4"/><path d="M15 10v4"/></>,
    'gauge':   <><path d="M12 14a2 2 0 1 0 2-2"/><path d="M13.4 10.6 19 5"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></>,
    'globe':   <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></>,
    'shield':  <><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/></>,
    'flame':   <><path d="M8.5 14.5C7 13 6 11.3 6 9c0-3 2-5 4-7 1 2 2 3 3 5 1 1 1 1.5 1 3 1-1 2-2 2-3.5 0 .5 2 3.5 2 7 0 5-3 9-8 9s-7-3.5-7-7c0-2 1-3 1.5-2 .8 1.5 2 1 4 1Z"/></>,
    'cube':    <><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 8 9 5 9-5"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></>,
    'edit':    <><path d="M12 20h9"/><path d="M16.5 3.5a2 2 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
    'trash':   <><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></>,
    'download':<><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    'upload':  <><path d="M12 17V5"/><path d="m7 10 5-5 5 5"/><path d="M5 21h14"/></>,
    'bell':    <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    'crown':   <><path d="m2 7 5 5 5-7 5 7 5-5-2 13H4z"/></>,
    'logout':  <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>,
    'lock':    <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    'store':   <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    'eye':     <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    'sparkle': <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>,
    'tnt':     <><rect x="4" y="8" width="16" height="12" rx="1"/><path d="M11 8V5"/><path d="M11 5l3-2 1 2 2-1"/></>,
  };
  return <svg {...props}>{paths[name] || paths['home']}</svg>;
}

// ─── 3D Minecraft cube logo ───────────────────────────────────────────────────
function CubeLogo({ size = 28 }) {
  return <Block kind="grass" size={size} />;
}

// ─── Pixel-art Minecraft Steve character ─────────────────────────────────────
function SteveCharacter({ size = 180 }) {
  const px = (n) => n * (size / 80);
  const sk = '#C9A878', skD = '#A88860', hair = '#5C3917', hairD = '#3F2510';
  const eye = '#382A1C', eyeW = '#FFFFFF';
  const nose = '#B88A64';
  const shirt = '#4D7BC4', shirtD = '#3A5688', shirtL = '#5E8FD7';
  const pants = '#3A5688', pantsD = '#2A4068';
  const shoe = '#2D1A0E';
  const skin = (color) => ({ fill: color, shapeRendering: 'crispEdges' });

  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 80 120" style={{ display: 'block', imageRendering: 'pixelated', filter: 'drop-shadow(4px 6px 0 rgba(0,0,0,0.4))' }}>
      {/* Shadow */}
      <ellipse cx="40" cy="118" rx="22" ry="3" fill="rgba(0,0,0,0.4)"/>

      {/* Head */}
      <rect x="22" y="2" width="36" height="36" {...skin(sk)}/>
      {/* Hair top */}
      <rect x="22" y="2" width="36" height="10" {...skin(hair)}/>
      <rect x="22" y="10" width="6" height="2" {...skin(hair)}/>
      <rect x="52" y="10" width="6" height="2" {...skin(hair)}/>
      {/* Hair shading */}
      <rect x="22" y="2" width="36" height="2" {...skin(hairD)}/>
      {/* Eyes */}
      <rect x="28" y="18" width="6" height="6" {...skin(eyeW)}/>
      <rect x="46" y="18" width="6" height="6" {...skin(eyeW)}/>
      <rect x="30" y="18" width="4" height="6" {...skin(eye)}/>
      <rect x="48" y="18" width="4" height="6" {...skin(eye)}/>
      {/* Nose */}
      <rect x="36" y="24" width="8" height="4" {...skin(nose)}/>
      {/* Mouth */}
      <rect x="30" y="30" width="20" height="2" {...skin(eye)}/>
      <rect x="32" y="32" width="16" height="2" {...skin('#7A5A3E')}/>
      {/* Side shading */}
      <rect x="22" y="12" width="2" height="26" {...skin(skD)}/>
      <rect x="56" y="12" width="2" height="26" {...skin(skD)}/>

      {/* Neck */}
      <rect x="32" y="38" width="16" height="4" {...skin(skD)}/>

      {/* Body */}
      <rect x="20" y="42" width="40" height="32" {...skin(shirt)}/>
      <rect x="20" y="42" width="40" height="3" {...skin(shirtL)}/>
      <rect x="20" y="42" width="3" height="32" {...skin(shirtL)}/>
      <rect x="57" y="42" width="3" height="32" {...skin(shirtD)}/>
      <rect x="20" y="71" width="40" height="3" {...skin(shirtD)}/>

      {/* Belt */}
      <rect x="20" y="68" width="40" height="4" {...skin('#5C3F26')}/>
      <rect x="36" y="69" width="8" height="2" {...skin('#C9A22E')}/>

      {/* Left arm */}
      <rect x="8" y="42" width="12" height="32" {...skin(shirt)}/>
      <rect x="8" y="42" width="12" height="3" {...skin(shirtL)}/>
      <rect x="8" y="42" width="2" height="32" {...skin(shirtL)}/>
      <rect x="18" y="42" width="2" height="32" {...skin(shirtD)}/>
      {/* Hand */}
      <rect x="8" y="74" width="12" height="6" {...skin(sk)}/>
      <rect x="8" y="74" width="12" height="2" {...skin(skD)}/>

      {/* Right arm */}
      <rect x="60" y="42" width="12" height="32" {...skin(shirt)}/>
      <rect x="60" y="42" width="12" height="3" {...skin(shirtL)}/>
      <rect x="60" y="42" width="2" height="32" {...skin(shirtL)}/>
      <rect x="70" y="42" width="2" height="32" {...skin(shirtD)}/>
      {/* Hand */}
      <rect x="60" y="74" width="12" height="6" {...skin(sk)}/>
      <rect x="60" y="74" width="12" height="2" {...skin(skD)}/>

      {/* Left leg */}
      <rect x="20" y="74" width="20" height="36" {...skin(pants)}/>
      <rect x="20" y="74" width="20" height="2" {...skin('#4F6F9E')}/>
      <rect x="20" y="74" width="2" height="36" {...skin('#4F6F9E')}/>
      <rect x="38" y="74" width="2" height="36" {...skin(pantsD)}/>

      {/* Right leg */}
      <rect x="40" y="74" width="20" height="36" {...skin(pants)}/>
      <rect x="40" y="74" width="20" height="2" {...skin('#4F6F9E')}/>
      <rect x="40" y="74" width="2" height="36" {...skin('#4F6F9E')}/>
      <rect x="58" y="74" width="2" height="36" {...skin(pantsD)}/>

      {/* Shoes */}
      <rect x="20" y="108" width="20" height="6" {...skin(shoe)}/>
      <rect x="40" y="108" width="20" height="6" {...skin(shoe)}/>
    </svg>
  );
}

// ─── Avatar (modern flat circle with initial) ───────────────────────────────
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
    }}>{initial}</div>
  );
}

// ─── Server type badge ──────────────────────────────────────────────────────
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
      width: size, height: size, borderRadius: 12,
      background: `linear-gradient(135deg, ${t.c1}, ${t.c2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(0,0,0,0.7)', flexShrink: 0,
      boxShadow: `0 4px 16px ${t.c1}33, inset 0 1px 0 rgba(255,255,255,0.25)`,
    }}>
      <Icon name={t.glyph} size={size * 0.52} strokeWidth={2}/>
    </div>
  );
}

// ─── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, color = 'var(--accent)', height = 50, max, min = 0, fill = true }) {
  if (!data || data.length < 2) return <div style={{ height, width: '100%' }}/>;
  const w = 200;
  const M = max ?? (Math.max(...data) * 1.1 || 1);
  const m = min;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - m) / (M - m || 1)) * height;
    return [x, y];
  });
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const fillD = d + ` L${w} ${height} L0 ${height} Z`;
  const id = `sg-${color.replace(/\W/g, '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3"/>
          <stop offset="1" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={fillD} fill={`url(#${id})`}/>}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="6" fill={color} fillOpacity="0.25"/>
    </svg>
  );
}

// ─── Floating particles ─────────────────────────────────────────────────────
function ParticleField({ animations, theme }) {
  if (!animations) return null;
  const colors = { default: '#5fff67', nether: '#ff7a3a', end: '#c084fc', diamond: '#5cdbd5' };
  const c = colors[theme] || colors.default;
  const items = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      left: (i * 13.7) % 100, delay: -i * 1.4,
      duration: 16 + (i % 5) * 4, size: 2 + (i % 3),
    })), []);
  return items.map((p, i) => (
    <div key={i} className="particle" style={{
      left: `${p.left}%`, bottom: -10,
      width: p.size, height: p.size,
      background: c, boxShadow: `0 0 ${p.size * 3}px ${c}`,
      animation: `drift ${p.duration}s linear ${p.delay}s infinite`,
    }}/>
  ));
}

// ─── Tabs ───────────────────────────────────────────────────────────────────
function Tabs({ items, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line-1)', padding: '0 4px' }}>
      {items.map(it => (
        <div key={it.id}
          className={value === it.id ? 'tab tab-active' : 'tab'}
          onClick={() => onChange(it.id)}
          style={{
            borderRadius: 0,
            borderBottom: value === it.id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1, paddingBottom: 12,
          }}>
          {it.icon && <Icon name={it.icon} size={15}/>}
          {it.label}
          {it.count != null && (
            <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{it.count}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Minecraft hearts (player health) ───────────────────────────────────────
function MCHearts({ value, max = 10 }) {
  const filled = Math.round((value / 100) * max);
  return (
    <span className="mc-hearts" style={{ display: 'inline-flex', gap: 1 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{
          fontSize: 14, lineHeight: 1,
          color: i < filled ? '#FF3030' : '#3a1010',
          textShadow: '1px 1px 0 #000, -1px -1px 0 #000',
          fontFamily: 'serif',
        }}>♥</span>
      ))}
    </span>
  );
}

// ─── Minecraft XP-style progress bar ────────────────────────────────────────
function MCProgressBar({ value, max = 100, kind = 'tps' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`mc-xp-bar ${kind}`}>
      <div className="mc-xp-bar-fill" style={{ width: `${pct}%` }}/>
    </div>
  );
}

// ─── Tweaks panel (settings drawer) ─────────────────────────────────────────
function useTweaks(defaults) {
  const [v, setV] = useState(defaults);
  const set = useCallback((k, val) => setV(prev => ({ ...prev, [k]: val })), []);
  return [v, set];
}

function TweaksPanel({ open, onClose, t, setTweak }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', right: 16, bottom: 16, zIndex: 1000,
      width: 280, padding: 16,
      background: 'var(--bg-2)', border: '1px solid var(--line-2)',
      borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <b style={{ fontSize: 13 }}>Tweaks</b>
        <button onClick={onClose} style={{ color: 'var(--text-3)' }}><Icon name="x" size={14}/></button>
      </div>

      <TwkSect label="Akcent kolorystyczny"/>
      <TwkSeg label="Motyw" value={t.theme} options={[
        { v: 'default', l: 'Grass' }, { v: 'diamond', l: 'Diamond' },
        { v: 'nether', l: 'Nether' }, { v: 'end', l: 'End' },
      ]} onChange={v => setTweak('theme', v)}/>

      <TwkSect label="Typografia"/>
      <TwkSeg label="Czcionka" value={t.font} options={[
        { v: 'modern', l: 'Modern' }, { v: 'pixel', l: 'Mono' },
      ]} onChange={v => setTweak('font', v)}/>

      <TwkSect label="Layout"/>
      <TwkSeg label="Gęstość" value={t.density} options={[
        { v: 'compact', l: 'Kompakt' }, { v: 'regular', l: 'Normal' }, { v: 'loose', l: 'Luźny' },
      ]} onChange={v => setTweak('density', v)}/>

      <TwkSect label="Efekty"/>
      <TwkToggle label="Animacje" value={t.animations} onChange={v => setTweak('animations', v)}/>
    </div>
  );
}

function TwkSect({ label }) {
  return <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-4)', padding: '10px 0 6px' }}>{label}</div>;
}

function TwkSeg({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', gap: 2, padding: 2, background: 'var(--bg-1)', borderRadius: 6 }}>
        {options.map(o => (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            flex: 1, padding: '4px 6px', fontSize: 11, borderRadius: 4,
            background: value === o.v ? 'var(--accent)' : 'transparent',
            color: value === o.v ? '#0a0a0a' : 'var(--text-2)',
            fontWeight: value === o.v ? 600 : 500,
          }}>{o.l}</button>
        ))}
      </div>
    </div>
  );
}

function TwkToggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        position: 'relative', width: 36, height: 20, borderRadius: 999,
        background: value ? 'var(--accent)' : 'var(--bg-4)',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: value ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', transition: 'left 0.15s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}/>
      </button>
    </div>
  );
}

window.CraftUI = {
  Icon, CubeLogo, SteveCharacter, Avatar, ServerBadge,
  Sparkline, ParticleField, Tabs, MCHearts, MCProgressBar,
  useTweaks, TweaksPanel,
  Block, Character, Head,
};
