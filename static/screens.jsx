// CraftPanel — Screens (Login, Dashboard, ServerDetail)
const { Icon, CubeLogo, SteveCharacter, Avatar, ServerBadge,
        Sparkline, Tabs, MCHearts, MCProgressBar } = window.CraftUI;
const API = '';

// ─── LOGIN SCREEN with Minecraft scene ─────────────────────────────────────
function LoginScreen({ onLogin }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
      {/* Left — Minecraft hero */}
      <div style={{
        background: 'linear-gradient(135deg, #87CEEB 0%, #B0E0F0 40%, #14181d 100%)',
        padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Sky gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(135,206,235,0.6) 0%, rgba(13,16,20,0.95) 70%)',
        }}/>

        {/* Pixel clouds */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 100, height: 30, background: '#fff', opacity: 0.85,
          boxShadow: '110px 30px 0 -2px #fff, 200px 0 0 0 #fff' }}/>
        <div style={{ position: 'absolute', top: '18%', right: '8%', width: 80, height: 25, background: '#fff', opacity: 0.75 }}/>

        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at 50% 60%, black, transparent 80%)',
        }}/>

        {/* Logo */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, zIndex: 2 }}>
          <CubeLogo size={32}/>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', color: '#fff' }}>CraftPanel</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Console v3.0</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', maxWidth: 440, zIndex: 2 }}>
          <h1 className="title-display" style={{
            fontSize: 64, lineHeight: 1, margin: 0, letterSpacing: '-0.04em',
            color: '#fff', textShadow: '2px 2px 0 rgba(0,0,0,0.4)',
          }}>
            Twoje serwery,<br/>
            <span style={{ color: 'var(--accent)' }}>jedna konsola.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: 24, lineHeight: 1.6 }}>
            Hosting, monitoring i automatyzacja dla społeczności Minecraft. Od jednego survivala po sieć z dziesiątkami nodów.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 24, color: 'rgba(255,255,255,0.7)', fontSize: 12, zIndex: 2, marginBottom: 110 }}>
          <span>● 99.99% uptime</span>
          <span>● Edge nodes w 14 lokalizacjach</span>
          <span>● 24 / 7 support</span>
        </div>

        {/* Steve character standing on the grass */}
        <div style={{ position: 'absolute', right: '8%', bottom: 100, zIndex: 3 }}>
          <SteveCharacter size={140}/>
        </div>

        {/* Minecraft grass + dirt strip at the bottom */}
        <div className="mc-grass-scene">
          <div className="mc-grass-blades"/>
          <div className="mc-grass-top"/>
          <div className="mc-dirt-strip"/>
        </div>
      </div>

      {/* Right — login form */}
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

// ─── DASHBOARD ──────────────────────────────────────────────────────────────
function DashboardScreen({ servers, statHistory, onSelectServer }) {
  const onlineCount = servers.filter(s => s.status === 'online').length;
  const totalRam = servers.reduce((a, s) => a + s.ram, 0);
  const totalRamMax = servers.reduce((a, s) => a + s.ramMax, 0);
  const totalPlayers = servers.reduce((a, s) => a + s.players, 0);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? servers
    : filter === 'online' ? servers.filter(s => s.status === 'online')
    : servers.filter(s => s.status !== 'online');

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
            {onlineCount} z {servers.length} serwerów działa · {totalPlayers} graczy online · ostatni backup 23 min temu
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn"><Icon name="search" size={15}/> Szukaj <span className="kbd">⌘K</span></button>
          <button className="btn btn-primary"><Icon name="plus" size={15} strokeWidth={2.2}/> Nowy serwer</button>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
        <MetricCard label="Serwery online" value={onlineCount} unit={`/ ${servers.length}`} icon="server" sparkData={[3,4,4,5,5,4,5,5]} accent="var(--accent)"/>
        <MetricCard label="Gracze" value={totalPlayers} delta="+12 dzisiaj" icon="users" sparkData={statHistory.players} accent="var(--info)"/>
        <MetricCard label="RAM" value={totalRam.toFixed(1)} unit={`/ ${totalRamMax} GB`} icon="memory" sparkData={[18,20,21,22,23,23,24,24]} accent="var(--purple)"/>
        <MetricCard label="Średnie TPS" value="19.7" unit="/ 20" icon="gauge" sparkData={statHistory.tps} accent="var(--warn)"/>
      </div>

      {/* Servers section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Serwery</h2>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 8 }}>
            {[
              { id: 'all', label: 'Wszystkie', count: servers.length },
              { id: 'online', label: 'Online', count: servers.filter(s => s.status === 'online').length },
              { id: 'offline', label: 'Offline', count: servers.filter(s => s.status !== 'online').length },
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--gap)' }}>
        {filtered.map(s => <ServerCard key={s.id} server={s} onClick={() => onSelectServer(s.id)}/>)}
      </div>

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
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
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
  const [hover, setHover] = useState({ x: 50, y: 50 });
  const ref = useRef(null);
  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setHover({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const statusInfo = server.status === 'online'
    ? { dot: 'dot-online', label: 'Online' }
    : server.status === 'starting'
    ? { dot: 'dot-warn', label: 'Uruchamianie...' }
    : { dot: 'dot-offline', label: 'Offline' };

  return (
    <div ref={ref} onClick={onClick} onMouseMove={onMove} className="card server-card lift"
      style={{ padding: 18, cursor: 'pointer', '--mx': hover.x + '%', '--my': hover.y + '%' }}>
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <ServerBadge kind={server.icon} size={48}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{server.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
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
        <Stat label="CPU" value={`${server.cpu}%`} pct={server.cpu / 100} kind="cpu"/>
        <Stat label="TPS" value={server.tps.toFixed(1)} pct={server.tps / 20} kind="tps"/>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-4)' }} className="mono">{server.ip}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm" onClick={onClick}>Otwórz <Icon name="arrow-r" size={13}/></button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, pct, kind = 'tps' }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 500 }} className="mono">{value}</span>
      </div>
      <MCProgressBar value={pct * 100} kind={kind}/>
    </div>
  );
}

function RecentActivityCard() {
  const items = [
    { ic: 'play', color: 'var(--accent)', text: <><b>SkyBlock Reborn</b> uruchomiony</>, time: '2 min temu' },
    { ic: 'users', color: 'var(--info)', text: <><b>Steve_PL</b> dołączył do SurvivalPL</>, time: '4 min temu' },
    { ic: 'archive', color: 'var(--purple)', text: <>Backup <b>auto-2026-04-28-06h</b> utworzony</>, time: '23 min temu' },
    { ic: 'plug', color: 'var(--warn)', text: <>Plugin <b>EssentialsX</b> zaktualizowany</>, time: '1 godz. temu' },
    { ic: 'shield', color: 'var(--danger)', text: <>3 próby logowania zablokowane</>, time: '2 godz. temu' },
    { ic: 'restart', color: 'var(--accent)', text: <><b>CreativeBuild</b> automatyczny restart</>, time: '6 godz. temu' },
  ];
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Ostatnia aktywność</h3>
        <button className="btn btn-sm btn-ghost">Zobacz wszystko</button>
      </div>
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
  );
}

function SystemHealthCard() {
  return (
    <div className="card" style={{ padding: 18 }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Status systemu</h3>
      {[
        { label: 'Edge node EU-West', status: 'op', subtitle: '12ms · Frankfurt' },
        { label: 'Backup storage', status: 'op', subtitle: '4.1 / 25 GB' },
        { label: 'API gateway', status: 'op', subtitle: '99.99% uptime' },
        { label: 'Auth service', status: 'degraded', subtitle: 'Podwyższone opóźnienia' },
      ].map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--line-1)' : 'none' }}>
          <span className={s.status === 'op' ? 'dot dot-online' : 'dot dot-warn'}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--text-1)' }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{s.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SERVER DETAIL with 7 tabs ─────────────────────────────────────────────
function ServerDetailScreen({ serverId, servers, statHistory, onBack }) {
  const server = servers.find(s => s.id === serverId) || servers[0];
  const [tab, setTab] = useState('overview');
  const [tnt, setTnt] = useState(false);

  const triggerKill = () => {
    setTnt(true);
    setTimeout(() => setTnt(false), 500);
    fetch(`${API}/api/servers/${serverId}/action`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' }),
    }).catch(() => {});
  };

  const doAction = (action) => {
    fetch(`${API}/api/servers/${serverId}/action`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    }).catch(() => {});
  };

  if (!server) return null;

  const tabs = [
    { id: 'overview', label: 'Przegląd', icon: 'gauge' },
    { id: 'console', label: 'Konsola', icon: 'terminal' },
    { id: 'players', label: 'Gracze', icon: 'users', count: 9 },
    { id: 'plugins', label: 'Pluginy', icon: 'plug', count: 14 },
    { id: 'files', label: 'Pliki', icon: 'folder' },
    { id: 'backups', label: 'Backupy', icon: 'archive' },
    { id: 'settings', label: 'Ustawienia', icon: 'settings' },
  ];

  return (
    <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
      {tnt && <div className="tnt-overlay"/>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)' }}>
        <a onClick={onBack} style={{ cursor: 'pointer' }}>Serwery</a>
        <Icon name="arrow-r" size={12}/>
        <span style={{ color: 'var(--text-1)' }}>{server.name}</span>
      </div>

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
            <span>·</span><span>{server.version}</span>
            <span>·</span><span>{server.players}/{server.maxPlayers} graczy</span>
            <span>·</span><span>uptime: {server.uptime}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn" onClick={() => doAction('restart')}><Icon name="restart" size={14}/> Restart</button>
          <button className="btn btn-danger" onClick={() => doAction('stop')}><Icon name="stop" size={14}/> Stop</button>
          <button className="btn btn-icon btn-danger" onClick={triggerKill} title="Force kill"><Icon name="tnt" size={14}/></button>
        </div>
      </div>

      <Tabs items={tabs} value={tab} onChange={setTab}/>

      {tab === 'overview' && <OverviewTab server={server} statHistory={statHistory}/>}
      {tab === 'console' && <ConsoleTab serverId={server.id}/>}
      {tab === 'players' && <PlayersTab/>}
      {tab === 'plugins' && <PluginsTab/>}
      {tab === 'files' && <FilesTab/>}
      {tab === 'backups' && <BackupsTab/>}
      {tab === 'settings' && <SettingsTab server={server}/>}
    </div>
  );
}

function OverviewTab({ server, statHistory }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
        <BigChart label="CPU" value={`${server.cpu}%`} data={statHistory.cpu} color="var(--danger)" max={100}/>
        <BigChart label="RAM" value={`${server.ram} GB`} data={statHistory.ram} color="var(--purple)" max={server.ramMax}/>
        <BigChart label="TPS" value={server.tps.toFixed(1)} data={statHistory.tps} color="var(--accent)" max={20} min={15}/>
        <BigChart label="Gracze" value={`${server.players}`} data={statHistory.players} color="var(--info)" max={server.maxPlayers}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--gap)' }}>
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
            { ic: 'archive', label: 'Stwórz backup' },
            { ic: 'download', label: 'Pobierz świat' },
            { ic: 'shield', label: 'Whitelist' },
            { ic: 'bell', label: 'Konfiguruj alerty' },
            { ic: 'cube', label: 'Generuj mapę 3D' },
          ].map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: i < 4 ? '1px solid var(--line-1)' : 'none', cursor: 'pointer',
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
      const r = (Math.sin(x * 0.4 + y * 0.7) + Math.cos(x * 0.7 - y * 0.5) + Math.sin((x + y) * 0.2)) / 3;
      const v = Math.max(0, (r + 0.7) / 1.4);
      cells.push({ x, y, v });
    }
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
      {cells.map((c, i) => (
        <div key={i} style={{
          aspectRatio: '1',
          background: c.v > 0.7 ? 'var(--accent)'
            : c.v > 0.5 ? 'color-mix(in oklab, var(--accent) 60%, var(--bg-3))'
            : c.v > 0.3 ? 'color-mix(in oklab, var(--accent) 25%, var(--bg-3))'
            : 'var(--bg-3)',
          opacity: 0.4 + c.v * 0.6, borderRadius: 2,
        }}/>
      ))}
    </div>
  );
}

// ─── CONSOLE — Server-Sent Events live stream ──────────────────────────────
function ConsoleTab({ serverId }) {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const src = new EventSource(`${API}/api/servers/${serverId}/console/stream`);
    src.onmessage = (e) => {
      try {
        const line = JSON.parse(e.data);
        setLines(prev => [...prev.slice(-200), line]);
      } catch {}
    };
    src.onerror = () => src.close();
    return () => src.close();
  }, [serverId]);

  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [lines]);

  const send = () => {
    if (!input.trim()) return;
    const t = new Date();
    const ts = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
    setLines(prev => [...prev, { t: ts, lvl: 'CMD', txt: `> ${input}`, col: '#fbbf24' }]);
    fetch(`${API}/api/servers/${serverId}/command`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: input }),
    }).catch(() => {});
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
          <button className="btn btn-sm btn-ghost" onClick={() => setLines([])}><Icon name="trash" size={13}/></button>
        </div>
      </div>

      <div ref={ref} style={{ height: 'calc(100vh - 420px)', minHeight: 380, background: 'var(--bg-0)', overflowY: 'auto', padding: '12px 0' }}>
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
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Wpisz komendę i naciśnij Enter..." className="mono"
              style={{ flex: 1, height: 38, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: 13 }}/>
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

window.CraftScreens = { LoginScreen, DashboardScreen, ServerDetailScreen };
