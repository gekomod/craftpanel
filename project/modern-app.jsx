// modern-app.jsx — Top-level shell

const { useState: uS, useEffect: uE } = React;

function Sidebar({ collapsed, onLogout }) {
  const items = [
    { id: 'dashboard', icon: 'home',     label: 'Dashboard', active: true },
    { id: 'servers',   icon: 'server',   label: 'Serwery' },
    { id: 'players',   icon: 'users',    label: 'Gracze' },
    { id: 'plugins',   icon: 'plug',     label: 'Marketplace' },
    { id: 'backups',   icon: 'archive',  label: 'Backupy' },
    { id: 'monitor',   icon: 'gauge',    label: 'Monitoring' },
    { id: 'security',  icon: 'shield',   label: 'Bezpieczeństwo' },
  ];
  const w = collapsed ? 60 : 220;
  return (
    <div style={{
      width: w, flexShrink: 0,
      background: 'var(--bg-1)',
      borderRight: '1px solid var(--line-1)',
      display: 'flex', flexDirection: 'column',
      padding: 14,
      transition: 'width 0.2s',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px', marginBottom: 18 }}>
        <CubeLogo size={28}/>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>CraftPanel</div>
            <div style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>v3.0</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => (
          <div key={it.id} className={it.active ? 'side-item side-item-active' : 'side-item'} style={{ position: 'relative' }}>
            <Icon name={it.icon} size={16}/>
            {!collapsed && <span>{it.label}</span>}
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}/>

      {!collapsed && (
        <div className="card" style={{ padding: 12, marginBottom: 10, background: 'var(--bg-2)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Wykorzystanie planu</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 600 }}>4</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>/ 6 serwerów</span>
          </div>
          <div className="bar"><div className="bar-fill" style={{ width: '67%' }}/></div>
          <button className="btn btn-sm btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
            <Icon name="sparkle" size={12} strokeWidth={2}/> Upgrade plan
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px', borderRadius: 8, cursor: 'pointer' }} onClick={onLogout}>
        <Avatar name="Steve" skin="steve" size={28}/>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Steve_PL</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)' }}>Owner · Diamond plan</div>
          </div>
        )}
        {!collapsed && <Icon name="logout" size={14} color="var(--text-4)"/>}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div style={{
      height: 56,
      borderBottom: '1px solid var(--line-1)',
      display: 'flex', alignItems: 'center',
      padding: '0 var(--pad)',
      gap: 16,
      background: 'rgba(13, 16, 20, 0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, maxWidth: 480, padding: '0 12px', height: 36, background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 8 }}>
        <Icon name="search" size={14} color="var(--text-3)"/>
        <input placeholder="Szukaj serwerów, graczy, komend..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: 13 }}/>
        <span className="kbd">⌘K</span>
      </div>
      <div style={{ flex: 1 }}/>
      <button className="btn btn-sm btn-ghost"><Icon name="bell" size={14}/></button>
      <button className="btn btn-sm">
        <span className="dot dot-online"/>
        <span style={{ marginLeft: 4 }}>Wszystkie systemy: OK</span>
      </button>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [view, setView] = uS('dashboard');
  const [serverId, setServerId] = uS(null);
  const [logged, setLogged] = uS(true);

  uE(() => {
    document.documentElement.setAttribute('data-theme', t.theme);
    document.documentElement.setAttribute('data-font', t.font);
    document.documentElement.setAttribute('data-density', t.density);
    document.documentElement.setAttribute('data-animations', t.animations ? 'true' : 'false');
  }, [t.theme, t.font, t.density, t.animations]);

  if (!logged) {
    return <>
      <LoginScreen onLogin={() => setLogged(true)}/>
      <Tweaks t={t} setTweak={setTweak}/>
    </>;
  }

  return (
    <div data-screen-label={view === 'dashboard' ? '01 Dashboard' : '02 Server Detail'} style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Background blobs */}
      {t.animations && <>
        <div className="bg-blob" style={{ top: '-10%', right: '-5%', width: 500, height: 500, background: 'var(--accent)' }}/>
        <div className="bg-blob" style={{ bottom: '-15%', left: '20%', width: 400, height: 400, background: 'var(--info)', opacity: 0.2 }}/>
        <ParticleField animations={t.animations} theme={t.theme}/>
      </>}

      <Sidebar onLogout={() => setLogged(false)}/>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <TopBar/>
        {view === 'dashboard' && <DashboardScreen onSelectServer={(id) => { setServerId(id); setView('server'); }}/>}
        {view === 'server' && serverId && <ServerDetailScreen serverId={serverId} onBack={() => { setView('dashboard'); setServerId(null); }}/>}
      </div>

      <Tweaks t={t} setTweak={setTweak}/>
    </div>
  );
}

function Tweaks({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Akcent kolorystyczny"/>
      <TweakRadio label="Motyw" value={t.theme}
        options={[
          { value: 'default', label: 'Green' },
          { value: 'aqua',    label: 'Aqua' },
          { value: 'nether',  label: 'Red' },
          { value: 'end',     label: 'Purple' },
        ]}
        onChange={(v) => setTweak('theme', v)}/>

      <TweakSection label="Typografia"/>
      <TweakRadio label="Czcionka" value={t.font}
        options={[
          { value: 'modern', label: 'Modern' },
          { value: 'pixel',  label: 'Mono' },
        ]}
        onChange={(v) => setTweak('font', v)}/>

      <TweakSection label="Layout"/>
      <TweakRadio label="Gęstość" value={t.density}
        options={[
          { value: 'compact', label: 'Kompakt' },
          { value: 'regular', label: 'Normal' },
          { value: 'loose',   label: 'Luźny' },
        ]}
        onChange={(v) => setTweak('density', v)}/>

      <TweakSection label="Efekty"/>
      <TweakToggle label="Animacje (blur, particles)" value={t.animations}
        onChange={(v) => setTweak('animations', v)}/>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
