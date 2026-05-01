// modern-screens.jsx — All modern screens

const { useState: useS, useEffect: useE, useRef: useR } = React;

// ════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      position: 'relative',
    }}>
      {/* Left side — branding */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-1) 0%, var(--bg-0) 100%)',
        padding: '60px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--line-1) 1px, transparent 1px), linear-gradient(90deg, var(--line-1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 70%)',
        }} />
        {/* glow blob */}
        <div style={{
          position: 'absolute', top: '20%', right: '-10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'var(--accent)', opacity: 0.12,
          filter: 'blur(80px)',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CubeLogo size={32} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>CraftPanel</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Console v3.0</div>
          </div>
        </div>

        <div style={{ position: 'relative', maxWidth: 440 }}>
          <h1 className="title-display" style={{ fontSize: 64, lineHeight: 1, margin: 0, letterSpacing: '-0.04em' }}>
            Twoje serwery,<br/>
            <span style={{ color: 'var(--accent)' }}>jedna konsola.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-2)', marginTop: 24, lineHeight: 1.6 }}>
            Hosting, monitoring i automatyzacja dla społeczności Minecraft. Od jednego survivala po sieć z dziesiątkami nodów.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 24, color: 'var(--text-3)', fontSize: 12 }}>
          <span>● 99.99% uptime</span>
          <span>● Edge nodes w 14 lokalizacjach</span>
          <span>● 24 / 7 support</span>
        </div>
      </div>

      {/* Right side — form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 className="title-display" style={{ fontSize: 36, margin: 0, letterSpacing: '-0.03em' }}>Witaj z powrotem</h2>
          <p style={{ color: 'var(--text-3)', marginTop: 6, marginBottom: 32, fontSize: 14 }}>Zaloguj się aby zarządzać serwerami</p>

          <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Email</label>
          <input className="input" defaultValue="admin@craftpanel.io" style={{ marginTop: 6, marginBottom: 16 }}/>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Hasło</label>
            <a style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer' }}>Zapomniałem hasła</a>
          </div>
          <input className="input" type="password" defaultValue="••••••••••" style={{ marginTop: 6, marginBottom: 16 }}/>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)', marginBottom: 24, cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }}/> Zostań zalogowany przez 30 dni
          </label>

          <button className="btn btn-primary" style={{ width: '100%', height: 42, justifyContent: 'center', fontSize: 14 }} onClick={onLogin}>
            Zaloguj się <Icon name="arrow-r" size={16} strokeWidth={2}/>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: 'var(--text-4)', fontSize: 11 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line-1)' }}/>
            <span>LUB</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line-1)' }}/>
          </div>

          <button className="btn" style={{ width: '100%', height: 42, justifyContent: 'center' }}>
            <Icon name="cube" size={16}/> Kontynuuj z Microsoft
          </button>

          <p style={{ marginTop: 32, fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
            Nie masz konta? <a style={{ color: 'var(--accent)', cursor: 'pointer' }}>Stwórz darmowe konto →</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════
function DashboardScreen({ onSelectServer }) {
  const { SERVERS, STAT_HISTORY } = window.MC_DATA;
  const onlineCount = SERVERS.filter(s => s.status === 'online').length;
  const totalRam = SERVERS.reduce((a, s) => a + s.ram, 0);
  const totalRamMax = SERVERS.reduce((a, s) => a + s.ramMax, 0);
  const totalPlayers = SERVERS.reduce((a, s) => a + s.players, 0);
  const [filter, setFilter] = useS('all');

  const filtered = filter === 'all' ? SERVERS
    : filter === 'online' ? SERVERS.filter(s => s.status === 'online')
    : SERVERS.filter(s => s.status !== 'online');

  return (
    <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>

      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 6 }}>Dashboard</div>
          <h1 className="title-display" style={{ fontSize: 38, margin: 0, letterSpacing: '-0.03em' }}>
            Cześć, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Steve</em>.
          </h1>
          <p style={{ color: 'var(--text-3)', margin: '4px 0 0', fontSize: 14 }}>
            {onlineCount} z {SERVERS.length} serwerów działa · {totalPlayers} graczy online · ostatni backup 23 min temu
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn"><Icon name="search" size={15}/> Szukaj <span className="kbd">⌘K</span></button>
          <button className="btn btn-primary"><Icon name="plus" size={15} strokeWidth={2.2}/> Nowy serwer</button>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
        <MetricCard label="Serwery online" value={onlineCount} unit={`/ ${SERVERS.length}`} icon="server" sparkData={[3,4,4,5,5,4,5,5]} accent="var(--accent)"/>
        <MetricCard label="Gracze" value={totalPlayers} delta="+12 dzisiaj" icon="users" sparkData={STAT_HISTORY.players} accent="var(--info)"/>
        <MetricCard label="Wykorzystanie RAM" value={`${totalRam.toFixed(1)}`} unit={`/ ${totalRamMax} GB`} icon="memory" sparkData={[18,20,21,22,23,23,24,24]} accent="var(--purple)"/>
        <MetricCard label="Średnie TPS" value="19.7" unit="/ 20" icon="gauge" sparkData={STAT_HISTORY.tps} accent="var(--warn)"/>
      </div>

      {/* Servers section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Serwery</h2>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 8 }}>
            {[
              { id: 'all', label: 'Wszystkie', count: SERVERS.length },
              { id: 'online', label: 'Online', count: SERVERS.filter(s => s.status === 'online').length },
              { id: 'offline', label: 'Offline', count: SERVERS.filter(s => s.status !== 'online').length },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding: '5px 12px', fontSize: 12, fontWeight: 500, borderRadius: 5,
                background: filter === f.id ? 'var(--bg-3)' : 'transparent',
                color: filter === f.id ? 'var(--text-1)' : 'var(--text-3)',
              }}>
                {f.label} <span style={{ opacity: 0.6, marginLeft: 4 }}>{f.count}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm btn-ghost">Sortuj: Aktywność <Icon name="chevron-d" size={14}/></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--gap)' }}>
        {filtered.map(s => <ServerCard key={s.id} server={s} onClick={() => onSelectServer(s.id)}/>)}
      </div>

      {/* Activity / Notifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--gap)', marginTop: 12 }}>
        <RecentActivityCard/>
        <SystemHealthCard/>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, delta, icon, sparkData, accent }) {
  return (
    <div className="card lift" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
          <Icon name={icon} size={15}/>
        </div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="metric-num">{value}</span>
        {unit && <span style={{ color: 'var(--text-3)', fontSize: 14 }}>{unit}</span>}
      </div>
      {delta && <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>{delta}</div>}
      <div style={{ marginTop: 8 }}>
        <Sparkline data={sparkData} color={accent} height={36}/>
      </div>
    </div>
  );
}

function ServerCard({ server, onClick }) {
  const [hover, setHover] = useS({ x: 50, y: 50 });
  const ref = useR(null);
  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setHover({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const statusInfo = server.status === 'online'
    ? { dot: 'dot-online', chip: 'chip-online', label: 'Online' }
    : server.status === 'starting'
    ? { dot: 'dot-warn', chip: 'chip-warn', label: 'Uruchamianie...' }
    : { dot: 'dot-offline', chip: 'chip-offline', label: 'Offline' };

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      className="card server-card lift"
      style={{
        padding: 18, cursor: 'pointer',
        '--mx': hover.x + '%', '--my': hover.y + '%',
      }}
    >
      <div style={{ display: 'flex', gap: 14, marginBottom: 14, position: 'relative' }}>
        <ServerBadge kind={server.icon} size={48}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{server.name}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)' }}>
            <span className={`dot ${statusInfo.dot}`}/>
            <span>{statusInfo.label}</span>
            <span>·</span>
            <span className="mono">{server.version}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{server.motd}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '12px 0', borderTop: '1px solid var(--line-1)' }}>
        <Stat label="Gracze" value={`${server.players}/${server.maxPlayers}`} pct={server.players / server.maxPlayers}/>
        <Stat label="CPU"    value={`${server.cpu}%`}                          pct={server.cpu / 100}/>
        <Stat label="TPS"    value={server.tps.toFixed(1)}                     pct={server.tps / 20}/>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-4)' }} className="mono">{server.ip}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {server.status === 'online' ? (
            <button className="btn btn-sm btn-ghost" onClick={e => e.stopPropagation()}><Icon name="restart" size={13}/></button>
          ) : (
            <button className="btn btn-sm btn-primary" onClick={e => e.stopPropagation()}><Icon name="play" size={13} strokeWidth={2}/> Start</button>
          )}
          <button className="btn btn-sm" onClick={onClick}>Otwórz <Icon name="arrow-r" size={13}/></button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, pct }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 500 }} className="mono">{value}</span>
      </div>
      <div className="bar"><div className="bar-fill" style={{ width: `${Math.min(100, pct * 100)}%` }}/></div>
    </div>
  );
}

function RecentActivityCard() {
  const items = [
    { ic: 'play',    color: 'var(--accent)', text: <><b>SkyBlock Reborn</b> uruchomiony</>, time: '2 min temu', user: 'auto' },
    { ic: 'users',   color: 'var(--info)',   text: <><b>Steve_PL</b> dołączył do SurvivalPL</>, time: '4 min temu' },
    { ic: 'archive', color: 'var(--purple)', text: <>Backup <b>auto-2026-04-28-06h</b> utworzony</>, time: '23 min temu', user: 'system' },
    { ic: 'plug',    color: 'var(--warn)',   text: <>Plugin <b>EssentialsX</b> zaktualizowany</>, time: '1 godz. temu', user: 'admin' },
    { ic: 'shield',  color: 'var(--danger)', text: <>3 próby logowania zablokowane</>, time: '2 godz. temu', user: 'firewall' },
    { ic: 'restart', color: 'var(--accent)', text: <><b>CreativeBuild</b> automatyczny restart</>, time: '6 godz. temu', user: 'auto' },
  ];
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Ostatnia aktywność</h3>
        <button className="btn btn-sm btn-ghost">Zobacz wszystko</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < items.length - 1 ? '1px solid var(--line-1)' : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: it.color }}>
              <Icon name={it.ic} size={14}/>
            </div>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{it.text}</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{it.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemHealthCard() {
  return (
    <div className="card" style={{ padding: 18 }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Status systemu</h3>
      {[
        { label: 'Edge node EU-West', status: 'op', subtitle: '12ms · Frankfurt' },
        { label: 'Backup storage',    status: 'op', subtitle: '4.1 / 25 GB' },
        { label: 'API gateway',       status: 'op', subtitle: '99.99% uptime' },
        { label: 'Auth service',      status: 'degraded', subtitle: 'Podwyższone opóźnienia' },
      ].map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--line-1)' : 'none' }}>
          <span className={s.status === 'op' ? 'dot dot-online' : 'dot dot-warn'}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--text-1)' }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{s.subtitle}</div>
          </div>
        </div>
      ))}
      <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
        Strona statusu <Icon name="arrow-r" size={13}/>
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  SERVER DETAIL
// ════════════════════════════════════════════════════
function ServerDetailScreen({ serverId, onBack }) {
  const { SERVERS } = window.MC_DATA;
  const server = SERVERS.find(s => s.id === serverId) || SERVERS[0];
  const [tab, setTab] = useS('overview');
  const [tnt, setTnt] = useS(false);

  const triggerKill = () => { setTnt(true); setTimeout(() => setTnt(false), 500); };

  const tabs = [
    { id: 'overview', label: 'Przegląd', icon: 'gauge' },
    { id: 'console',  label: 'Konsola',  icon: 'terminal' },
    { id: 'players',  label: 'Gracze',   icon: 'users', count: 9 },
    { id: 'plugins',  label: 'Pluginy',  icon: 'plug', count: 14 },
    { id: 'files',    label: 'Pliki',    icon: 'folder' },
    { id: 'backups',  label: 'Backupy',  icon: 'archive' },
    { id: 'settings', label: 'Ustawienia', icon: 'settings' },
  ];

  return (
    <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
      {tnt && <div className="tnt-overlay"/>}

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)' }}>
        <a onClick={onBack} style={{ cursor: 'pointer' }}>Serwery</a>
        <Icon name="arrow-r" size={12}/>
        <span style={{ color: 'var(--text-1)' }}>{server.name}</span>
      </div>

      {/* Header */}
      <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <ServerBadge kind={server.icon} size={56}/>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="title-display" style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em' }}>{server.name}</h1>
            <span className={server.status === 'online' ? 'chip chip-online' : 'chip chip-offline'}>
              <span className={server.status === 'online' ? 'dot dot-online' : 'dot dot-offline'} style={{ width: 6, height: 6 }}/>
              {server.status === 'online' ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, fontSize: 13, color: 'var(--text-3)' }}>
            <span className="mono">{server.ip}</span>
            <span>·</span>
            <span>{server.version}</span>
            <span>·</span>
            <span>{server.players}/{server.maxPlayers} graczy</span>
            <span>·</span>
            <span>uptime: {server.uptime}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn"><Icon name="restart" size={14}/> Restart</button>
          <button className="btn btn-danger"><Icon name="stop" size={14}/> Stop</button>
          <button className="btn btn-icon btn-danger" onClick={triggerKill} title="Force kill"><Icon name="tnt" size={14}/></button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs items={tabs} value={tab} onChange={setTab}/>

      {/* Content */}
      {tab === 'overview' && <OverviewTab server={server}/>}
      {tab === 'console'  && <ConsoleTab server={server}/>}
      {tab === 'players'  && <PlayersTab/>}
      {tab === 'plugins'  && <PluginsTab/>}
      {tab === 'files'    && <FilesTab/>}
      {tab === 'backups'  && <BackupsTab/>}
      {tab === 'settings' && <SettingsTab server={server}/>}
    </div>
  );
}

function OverviewTab({ server }) {
  const { STAT_HISTORY } = window.MC_DATA;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
        <BigChart label="CPU"     value={`${server.cpu}%`}      data={STAT_HISTORY.cpu}     color="var(--danger)" max={100}/>
        <BigChart label="RAM"     value={`${server.ram} GB`}    data={STAT_HISTORY.ram}     color="var(--purple)" max={server.ramMax}/>
        <BigChart label="TPS"     value={server.tps.toFixed(1)} data={STAT_HISTORY.tps}     color="var(--accent)" max={20} min={15}/>
        <BigChart label="Gracze"  value={`${server.players}`}   data={STAT_HISTORY.players} color="var(--info)" max={server.maxPlayers}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--gap)' }}>
        {/* World heatmap */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Aktywność na mapie</h3>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-sm btn-ghost">overworld</button>
              <button className="btn btn-sm btn-ghost">nether</button>
              <button className="btn btn-sm btn-ghost">end</button>
            </div>
          </div>
          <WorldHeatmap/>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Quick actions</h3>
          {[
            { ic: 'archive',  label: 'Stwórz backup' },
            { ic: 'download', label: 'Pobierz świat' },
            { ic: 'shield',   label: 'Whitelist' },
            { ic: 'bell',     label: 'Konfiguruj alerty' },
            { ic: 'cube',     label: 'Generuj mapę 3D' },
          ].map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: i < 4 ? '1px solid var(--line-1)' : 'none',
              cursor: 'pointer',
            }}>
              <Icon name={a.ic} size={15} color="var(--text-3)"/>
              <span style={{ flex: 1, fontSize: 13 }}>{a.label}</span>
              <Icon name="arrow-r" size={14} color="var(--text-4)"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BigChart({ label, value, data, color, max, min }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--text-4)' }}>6h</span>
      </div>
      <div style={{ marginTop: 8, marginBottom: 10 }}>
        <span className="metric-num" style={{ fontSize: 28 }}>{value}</span>
      </div>
      <div style={{ height: 60 }}>
        <Sparkline data={data} color={color} height={60} max={max} min={min}/>
      </div>
    </div>
  );
}

function WorldHeatmap() {
  const cols = 32, rows = 14;
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const r = (Math.sin(x * 0.4 + y * 0.7) + Math.cos(x * 0.7 - y * 0.5) + Math.sin((x+y) * 0.2)) / 3;
      const v = Math.max(0, (r + 0.7) / 1.4);
      cells.push({ x, y, v });
    }
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
      {cells.map((c, i) => (
        <div key={i} style={{
          aspectRatio: '1',
          background: c.v > 0.7 ? 'var(--accent)' : c.v > 0.5 ? 'color-mix(in oklab, var(--accent) 60%, var(--bg-3))' : c.v > 0.3 ? 'color-mix(in oklab, var(--accent) 25%, var(--bg-3))' : 'var(--bg-3)',
          opacity: 0.4 + c.v * 0.6,
          borderRadius: 2,
        }} title={`Chunk ${c.x},${c.y}`}/>
      ))}
    </div>
  );
}

function ConsoleTab({ server }) {
  const { CONSOLE_LINES } = window.MC_DATA;
  const [lines, setLines] = useS(CONSOLE_LINES);
  const [input, setInput] = useS('');
  const ref = useR(null);

  useE(() => {
    const ticks = [
      () => ({ lvl: 'INFO', txt: `Server tick ${(Math.random()*40+30).toFixed(0)}ms · TPS ${(19.4+Math.random()*0.6).toFixed(2)}`, c: 'var(--text-3)' }),
      () => ({ lvl: 'INFO', txt: `<Steve_PL> ${['hej','idę spać','kto na nether?','ktoś chce na enderpearle?'][Math.floor(Math.random()*4)]}`, c: 'var(--text-1)' }),
      () => ({ lvl: 'INFO', txt: `[mcMMO] ${['AlexCrafter','EnderKiller99'][Math.floor(Math.random()*2)]} +${Math.floor(Math.random()*500)} XP w ${['Mining','Excavation','Combat'][Math.floor(Math.random()*3)]}`, c: 'var(--accent)' }),
      () => ({ lvl: 'INFO', txt: `pixel_panda otrzymał osiągnięcie [${['Diamonds!','Stone Age','The End?'][Math.floor(Math.random()*3)]}]`, c: 'var(--info)' }),
    ];
    const id = setInterval(() => {
      const t = new Date();
      const ts = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`;
      const tick = ticks[Math.floor(Math.random()*ticks.length)]();
      setLines(prev => [...prev.slice(-180), { t: ts, lvl: tick.lvl, txt: tick.txt, col: tick.c }]);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  useE(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [lines]);

  const send = () => {
    if (!input.trim()) return;
    const t = new Date();
    const ts = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`;
    setLines(prev => [...prev, { t: ts, lvl: 'CMD', txt: `> ${input}`, col: 'var(--warn)' }]);
    setInput('');
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="terminal" size={15} color="var(--text-3)"/>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Live Console</span>
          <span className="chip chip-online">● Streaming</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm btn-ghost"><Icon name="search" size={13}/></button>
          <button className="btn btn-sm btn-ghost"><Icon name="download" size={13}/> Pobierz logi</button>
          <button className="btn btn-sm btn-ghost"><Icon name="trash" size={13}/></button>
        </div>
      </div>

      <div ref={ref} style={{
        height: 'calc(100vh - 420px)', minHeight: 380,
        background: 'var(--bg-0)', overflowY: 'auto',
        padding: '12px 0',
      }}>
        {lines.map((l, i) => (
          <div key={i} className="console-line">
            <span style={{ color: 'var(--text-4)' }}>{l.t}</span>
            <span style={{ color: l.lvl === 'ERROR' ? 'var(--danger)' : l.lvl === 'WARN' ? 'var(--warn)' : l.lvl === 'CMD' ? 'var(--warn)' : 'var(--text-3)', fontWeight: 500 }}>{l.lvl}</span>
            <span style={{ color: l.col, wordBreak: 'break-word' }}>{l.txt}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--line-1)', background: 'var(--bg-1)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '0 12px', background: 'var(--bg-0)', borderRadius: 8, border: '1px solid var(--line-2)' }}>
            <span style={{ color: 'var(--accent)' }} className="mono">$</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Wpisz komendę i naciśnij Enter..."
              className="mono"
              style={{ flex: 1, height: 38, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: 13 }}
            />
          </div>
          <button className="btn btn-primary" onClick={send}>Wyślij</button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {['/save-all', '/list', '/whitelist on', '/weather clear', '/time set day', '/reload'].map(c => (
            <button key={c} className="btn btn-sm btn-ghost mono" style={{ fontSize: 11, height: 24 }} onClick={() => setInput(c)}>{c}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayersTab() {
  const { PLAYERS } = window.MC_DATA;
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Online · {PLAYERS.length} graczy</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>3 OPs · 3 VIPs · 3 graczy</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm"><Icon name="shield" size={13}/> Whitelist</button>
          <button className="btn btn-sm"><Icon name="x" size={13}/> Banlist</button>
          <button className="btn btn-sm"><Icon name="search" size={13}/></button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--bg-1)' }}>
            <Th>Gracz</Th>
            <Th>Status</Th>
            <Th>Świat</Th>
            <Th>Ping</Th>
            <Th>Czas gry</Th>
            <Th>Health</Th>
            <Th align="right">Akcje</Th>
          </tr>
        </thead>
        <tbody>
          {PLAYERS.map((p, i) => (
            <tr key={p.uuid} style={{ borderTop: '1px solid var(--line-1)' }}>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={p.name} skin={p.skin} size={32}/>
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }} className="mono">{p.uuid}</div>
                  </div>
                </div>
              </Td>
              <Td>
                {p.op       && <span className="chip" style={{ background: 'rgba(248,113,113,0.12)', color: '#fca5a5', borderColor: 'rgba(248,113,113,0.25)' }}><Icon name="crown" size={10}/> OP</span>}
                {p.status === 'vip' && <span className="chip" style={{ background: 'rgba(251,191,36,0.10)', color: '#fcd34d', borderColor: 'rgba(251,191,36,0.25)' }}>VIP</span>}
                {!p.op && p.status !== 'vip' && <span className="chip">Player</span>}
              </Td>
              <Td><span className="mono" style={{ fontSize: 12 }}>{p.world}</span></Td>
              <Td><span className="mono" style={{ color: p.ping > 100 ? 'var(--warn)' : 'var(--text-2)' }}>{p.ping}ms</span></Td>
              <Td><span className="mono">{p.playtime}</span></Td>
              <Td><HealthMini value={70 + (p.uuid.charCodeAt(0) % 30)}/></Td>
              <Td align="right">
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button className="btn btn-sm btn-ghost">OP</button>
                  <button className="btn btn-sm btn-ghost">Kick</button>
                  <button className="btn btn-sm btn-danger">Ban</button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = 'left' }) {
  return <th style={{ padding: '12px 16px', textAlign: align, fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</th>;
}
function Td({ children, align = 'left' }) {
  return <td style={{ padding: '12px 16px', textAlign: align, color: 'var(--text-2)' }}>{children}</td>;
}

function HealthMini({ value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 60, height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: value > 60 ? 'var(--accent)' : value > 30 ? 'var(--warn)' : 'var(--danger)' }}/>
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{value}%</span>
    </div>
  );
}

function PluginsTab() {
  const { PLUGINS } = window.MC_DATA;
  const [sel, setSel] = useS(0);
  const p = PLUGINS[sel];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--gap)' }}>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Pluginy <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>· {PLUGINS.length}</span></h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm"><Icon name="search" size={13}/></button>
            <button className="btn btn-sm btn-primary"><Icon name="plus" size={13} strokeWidth={2}/> Wgraj</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PLUGINS.map((pl, i) => (
            <div key={i} onClick={() => setSel(i)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', cursor: 'pointer',
              borderRadius: 8,
              background: sel === i ? 'var(--bg-3)' : 'transparent',
              border: '1px solid', borderColor: sel === i ? 'var(--line-2)' : 'transparent',
              marginBottom: 2,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: pl.enabled ? 'var(--accent-bg)' : 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pl.enabled ? 'var(--accent)' : 'var(--text-4)' }}>
                <Icon name="plug" size={15}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{pl.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{pl.desc}</div>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-4)' }}>v{pl.version}</span>
              <span className={pl.enabled ? 'chip chip-online' : 'chip chip-offline'}>
                {pl.enabled ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 18, height: 'fit-content', position: 'sticky', top: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 14 }}>
          <Icon name="plug" size={26}/>
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{p.name}</h3>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>v{p.version} · by {p.author}</div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 12, lineHeight: 1.6 }}>{p.desc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          <button className={p.enabled ? 'btn btn-danger' : 'btn btn-primary'} style={{ justifyContent: 'center' }}>
            {p.enabled ? <><Icon name="power" size={14}/> Wyłącz</> : <><Icon name="play" size={14}/> Włącz</>}
          </button>
          <button className="btn" style={{ justifyContent: 'center' }}><Icon name="settings" size={14}/> Konfiguracja</button>
          <button className="btn" style={{ justifyContent: 'center' }}><Icon name="upload" size={14}/> Sprawdź aktualizacje</button>
          <button className="btn btn-ghost" style={{ justifyContent: 'center', color: 'var(--danger)' }}><Icon name="trash" size={14}/> Odinstaluj</button>
        </div>
      </div>
    </div>
  );
}

function FilesTab() {
  const { FILES } = window.MC_DATA;
  const [sel, setSel] = useS('server.properties');
  const content = `# Minecraft server properties
# Last modified: 2026-04-27 15:22

server-port=25565
gamemode=survival
difficulty=normal
spawn-protection=16
max-players=100
view-distance=10
simulation-distance=10
white-list=true
enforce-whitelist=true
motd=§a§lSurvivalPL §7| §6Polski survival od 2019
online-mode=true
pvp=true
allow-flight=false
allow-nether=true
spawn-monsters=true
generate-structures=true
level-name=world
level-seed=
level-type=minecraft\\:normal
op-permission-level=4
enable-rcon=true
rcon.port=25575
hardcore=false
spawn-animals=true`;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--gap)', height: 'calc(100vh - 360px)', minHeight: 460 }}>
      <div className="card" style={{ padding: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }} className="mono">
          <Icon name="folder" size={13}/>
          <span>~/server</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {FILES.map((f, i) => (
            <div
              key={f.name + i}
              onClick={() => f.type !== 'folder' && f.type !== 'up' && setSel(f.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6,
                background: sel === f.name ? 'var(--accent-bg)' : 'transparent',
                color: sel === f.name ? 'var(--accent)' : 'var(--text-2)',
                fontSize: 12, cursor: 'pointer',
              }}
              className="mono"
            >
              <Icon name={f.type === 'folder' || f.type === 'up' ? 'folder' : 'eye'} size={13}/>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 10, color: 'var(--text-4)' }}>{f.size}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, padding: '8px 0 0', borderTop: '1px solid var(--line-1)', marginTop: 8 }}>
          <button className="btn btn-sm" style={{ flex: 1 }}><Icon name="upload" size={13}/></button>
          <button className="btn btn-sm" style={{ flex: 1 }}><Icon name="plus" size={13}/></button>
          <button className="btn btn-sm btn-danger" style={{ flex: 1 }}><Icon name="trash" size={13}/></button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="mono">
            <Icon name="eye" size={13} color="var(--text-3)"/>
            <span style={{ fontSize: 13 }}>{sel}</span>
            <span className="chip" style={{ height: 18, fontSize: 10 }}>● Modified</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm btn-ghost"><Icon name="download" size={13}/></button>
            <button className="btn btn-sm btn-primary">Zapisz · ⌘S</button>
          </div>
        </div>
        <pre className="mono" style={{
          flex: 1, margin: 0, padding: 18,
          background: 'var(--bg-0)',
          color: 'var(--text-2)',
          fontSize: 12.5, lineHeight: 1.7,
          overflow: 'auto', whiteSpace: 'pre-wrap',
        }}>{content}</pre>
      </div>
    </div>
  );
}

function BackupsTab() {
  const { BACKUPS } = window.MC_DATA;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
      <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          <Icon name="archive" size={20}/>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Snapshoty świata</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Auto co 12h · Wykorzystano 4.1 / 25 GB · Ostatni: 23 min temu</div>
        </div>
        <button className="btn"><Icon name="settings" size={13}/> Konfiguruj</button>
        <button className="btn btn-primary"><Icon name="plus" size={13} strokeWidth={2}/> Stwórz teraz</button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: 'var(--bg-1)' }}>
            <Th>Nazwa</Th><Th>Typ</Th><Th>Rozmiar</Th><Th>Utworzono</Th><Th align="right">Akcje</Th>
          </tr></thead>
          <tbody>
            {BACKUPS.map((b, i) => (
              <tr key={b.id} style={{ borderTop: '1px solid var(--line-1)' }}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon name="archive" size={14} color="var(--text-3)"/>
                    <span className="mono">{b.name}</span>
                  </div>
                </Td>
                <Td>
                  <span className={b.auto ? 'chip' : 'chip chip-online'}>
                    {b.auto ? 'AUTO' : 'MANUAL'}
                  </span>
                </Td>
                <Td><span className="mono">{b.size}</span></Td>
                <Td><span className="mono" style={{ fontSize: 12 }}>{b.created}</span></Td>
                <Td align="right">
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button className="btn btn-sm btn-ghost"><Icon name="download" size={13}/></button>
                    <button className="btn btn-sm">Przywróć</button>
                    <button className="btn btn-sm btn-danger"><Icon name="trash" size={13}/></button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab({ server }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap)' }}>
      <SettingsCard title="Podstawowe" icon="settings">
        <SetText label="MOTD" value={server.motd}/>
        <SetText label="Max graczy" value={server.maxPlayers} type="number"/>
        <SetText label="Port" value="25565" type="number"/>
        <SetSelect label="Tryb gry" value="survival" options={['survival','creative','adventure','spectator']}/>
        <SetSelect label="Trudność" value="normal" options={['peaceful','easy','normal','hard']}/>
        <SetToggle label="Whitelist" value={true}/>
        <SetToggle label="PvP" value={true}/>
        <SetToggle label="Hardcore" value={false}/>
      </SettingsCard>

      <SettingsCard title="Świat" icon="globe">
        <SetText label="Seed" value="-2748934729471823"/>
        <SetText label="Spawn protection" value="16" type="number"/>
        <SetText label="View distance" value="10" type="number"/>
        <SetText label="Simulation distance" value="10" type="number"/>
        <SetToggle label="Pozwól na Nether" value={true}/>
        <SetToggle label="Generuj struktury" value={true}/>
        <SetToggle label="Spawn monsters" value={true}/>
      </SettingsCard>

      <SettingsCard title="Performance" icon="cpu">
        <SetText label="RAM (max)" value={server.ramMax} type="number" suffix="GB"/>
        <SetText label="Auto-save interval" value="300" type="number" suffix="s"/>
        <SetToggle label="Auto-restart o 4:00" value={true}/>
        <SetToggle label="Watchdog" value={true}/>
      </SettingsCard>

      <SettingsCard title="Strefa zagrożenia" icon="flame" danger>
        <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 0 }}>Te akcje są nieodwracalne. Stwórz backup przed kontynuowaniem.</p>
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}><Icon name="restart" size={14}/> Reset świata</button>
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}><Icon name="trash" size={14}/> Wyczyść playerdata</button>
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}><Icon name="power" size={14}/> Usuń serwer permanentnie</button>
      </SettingsCard>
    </div>
  );
}

function SettingsCard({ title, icon, danger, children }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: danger ? 'rgba(248,113,113,0.10)' : 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? 'var(--danger)' : 'var(--text-2)' }}>
          <Icon name={icon} size={15}/>
        </div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function SetText({ label, value, type = 'text', suffix }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <label style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{label}</label>
      <div style={{ flex: 1.4, display: 'flex', alignItems: 'center', gap: 6 }}>
        <input className="input mono" type={type} defaultValue={value} style={{ fontSize: 12 }}/>
        {suffix && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function SetSelect({ label, value, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <label style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{label}</label>
      <select defaultValue={value} className="input" style={{ flex: 1.4, fontSize: 12 }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function SetToggle({ label, value }) {
  const [v, setV] = useS(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <label style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</label>
      <button onClick={() => setV(!v)} style={{
        position: 'relative', width: 36, height: 20, borderRadius: 999,
        background: v ? 'var(--accent)' : 'var(--bg-4)',
        transition: 'background 0.15s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: v ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', transition: 'left 0.15s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}/>
      </button>
    </div>
  );
}

Object.assign(window, { LoginScreen, DashboardScreen, ServerDetailScreen });
