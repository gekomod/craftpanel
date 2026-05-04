const { useState, useEffect, useRef, useCallback } = React;
const { LoginScreen, DashboardScreen, ServerDetailScreen } = window.CraftScreens;
const { PlayersTab, PluginsTab, FilesTab, BackupsTab, SettingsTab } = window.CraftTabs;
const { Icon, CubeLogo, SteveCharacter, TweaksPanel, useTweaks } = window.CraftUI;
const { InstallerModal } = window.CraftInstaller;

function Sidebar({ route, navigate, servers, collapsed, setCollapsed, onAddServer }) {
  const navItems = [
    { id: 'dashboard', icon: 'grid', label: 'Dashboard' },
    { id: 'players', icon: 'users', label: 'Gracze' },
    { id: 'plugins', icon: 'puzzle', label: 'Pluginy' },
    { id: 'files', icon: 'folder', label: 'Pliki' },
    { id: 'backups', icon: 'archive', label: 'Backupy' },
    { id: 'settings', icon: 'settings', label: 'Ustawienia' },
  ];
  const currentServer = servers.find(s => route.serverId === s.id);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar-header">
        <CubeLogo size={32} />
        {!collapsed && <span className="sidebar-brand">CraftPanel</span>}
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={16} />
        </button>
      </div>

      {currentServer && !collapsed && (
        <div className="sidebar-server-ctx">
          <div className={`status-dot status-dot--${currentServer.status}`} />
          <span className="sidebar-server-name">{currentServer.name}</span>
        </div>
      )}

      <nav className="sidebar-nav">
        {route.screen === 'detail' ? (
          <>
            <button className="sidebar-back" onClick={() => navigate({ screen: 'dashboard' })}>
              <Icon name="arrow-left" size={16} />
              {!collapsed && <span>Powrót</span>}
            </button>
            {navItems.map(item => (
              <button key={item.id}
                className={`sidebar-item ${route.tab === item.id ? 'sidebar-item--active' : ''}`}
                onClick={() => navigate({ screen: 'detail', serverId: route.serverId, tab: item.id })}
                title={collapsed ? item.label : ''}>
                <Icon name={item.icon} size={18} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </>
        ) : (
          <>
            <button className={`sidebar-item ${route.screen === 'dashboard' ? 'sidebar-item--active' : ''}`}
              onClick={() => navigate({ screen: 'dashboard' })}>
              <Icon name="grid" size={18} />
              {!collapsed && <span>Dashboard</span>}
            </button>
            <div className="sidebar-section-label">{!collapsed && 'Serwery'}</div>
            {servers.map(srv => (
              <button key={srv.id} className="sidebar-item sidebar-item--server"
                onClick={() => navigate({ screen: 'detail', serverId: srv.id, tab: 'dashboard' })}>
                <div className={`status-dot status-dot--${srv.status}`} />
                {!collapsed && (
                  <span className="sidebar-srv-name">{srv.name}</span>
                )}
                {!collapsed && (
                  <span style={{ fontSize: 10, marginLeft: 'auto', opacity: 0.5,
                    color: srv.type === 'bedrock' ? '#60a5fa' : 'var(--accent)' }}>
                    {srv.type === 'bedrock' ? 'BE' : 'JE'}
                  </span>
                )}
              </button>
            ))}
            <button className="sidebar-item" style={{ marginTop: 6, color: 'var(--accent)', opacity: 0.8 }}
              onClick={onAddServer} title={collapsed ? 'Dodaj serwer' : ''}>
              <Icon name="plus" size={18} />
              {!collapsed && <span>Dodaj serwer</span>}
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user">
            <SteveCharacter size={28} />
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Admin</span>
              <span className="sidebar-user-role">Operator</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function TopBar({ route, servers, onTweaksToggle, tweaksOpen, onAddServer }) {
  const server = servers.find(s => s.id === route.serverId);
  const titles = { dashboard: 'Dashboard', players: 'Gracze', plugins: 'Pluginy', files: 'Pliki', backups: 'Backupy', settings: 'Ustawienia' };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {server ? (
          <span className="topbar-breadcrumb">
            <span className="topbar-breadcrumb-parent">Serwery</span>
            <Icon name="chevron-right" size={14} />
            <span className="topbar-breadcrumb-current">{server.name}</span>
            {route.tab && route.tab !== 'dashboard' && (
              <><Icon name="chevron-right" size={14} />
              <span className="topbar-breadcrumb-current">{titles[route.tab] || route.tab}</span></>
            )}
          </span>
        ) : (
          <span className="topbar-title">Dashboard</span>
        )}
      </div>
      <div className="topbar-right">
        <button className="btn btn-sm" onClick={onAddServer}>
          <Icon name="plus" size={14}/> Nowy serwer
        </button>
        <button className={`topbar-btn ${tweaksOpen ? 'topbar-btn--active' : ''}`}
          onClick={onTweaksToggle} title="Wygląd">
          <Icon name="sliders" size={18} />
        </button>
      </div>
    </header>
  );
}

function ServerActionBar({ server, onRefresh }) {
  const [loading, setLoading] = useState('');

  const doAction = (action) => {
    setLoading(action);
    fetch(`/api/servers/${server.id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    }).then(() => {
      setTimeout(() => { setLoading(''); onRefresh(); }, 1500);
    }).catch(() => setLoading(''));
  };

  const isOnline  = server.status === 'online';
  const isOffline = server.status === 'offline';
  const isBusy    = server.status === 'starting' || server.status === 'stopping' || loading !== '';

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {isOffline && (
        <button className="btn btn-sm btn-primary" disabled={isBusy} onClick={() => doAction('start')}>
          <Icon name="play" size={13}/> {loading === 'start' ? 'Uruchamianie...' : 'Uruchom'}
        </button>
      )}
      {isOnline && (
        <button className="btn btn-sm" disabled={isBusy} onClick={() => doAction('restart')}>
          <Icon name="restart" size={13}/> {loading === 'restart' ? '...' : 'Restart'}
        </button>
      )}
      {isOnline && (
        <button className="btn btn-sm btn-danger" disabled={isBusy} onClick={() => doAction('stop')}>
          <Icon name="stop" size={13}/> {loading === 'stop' ? 'Zatrzymywanie...' : 'Stop'}
        </button>
      )}
      {isBusy && !loading && (
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          {server.status === 'starting' ? 'Uruchamianie...' : 'Zatrzymywanie...'}
        </span>
      )}
    </div>
  );
}

function DetailContent({ route, navigate, servers, onRefresh }) {
  const tab = route.tab || 'dashboard';
  const sid = route.serverId;
  const server = servers.find(s => s.id === sid);

  return (
    <div>
      {server && (
        <div style={{ padding: '10px var(--pad) 0', display: 'flex', justifyContent: 'flex-end' }}>
          <ServerActionBar server={server} onRefresh={onRefresh}/>
        </div>
      )}
      {tab === 'dashboard' && <ServerDetailScreen serverId={sid} servers={servers} navigate={navigate}/>}
      {tab === 'players'   && <PlayersTab serverId={sid}/>}
      {tab === 'plugins'   && <PluginsTab serverId={sid}/>}
      {tab === 'files'     && <FilesTab serverId={sid}/>}
      {tab === 'backups'   && <BackupsTab serverId={sid}/>}
      {tab === 'settings'  && <SettingsTab serverId={sid} server={server}/>}
    </div>
  );
}

function App() {
  const [route, setRoute] = useState({ screen: 'login' });
  const [servers, setServers] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [installerOpen, setInstallerOpen] = useState(false);
  const { tweaks, setTweak } = useTweaks();

  const loadServers = useCallback(() => {
    fetch('/api/servers')
      .then(r => r.json())
      .then(data => setServers(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (route.screen !== 'login') {
      loadServers();
      const t = setInterval(loadServers, 8000);
      return () => clearInterval(t);
    }
  }, [route.screen, loadServers]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', tweaks.theme || 'default');
    root.setAttribute('data-font', tweaks.font || 'geist');
    root.setAttribute('data-density', tweaks.density || 'normal');
    root.setAttribute('data-animations', tweaks.animations !== false ? 'on' : 'off');
  }, [tweaks]);

  const navigate = (next) => setRoute(next);

  if (route.screen === 'login') {
    return <LoginScreen onLogin={() => navigate({ screen: 'dashboard' })} />;
  }

  const showSidebar = route.screen === 'dashboard' || route.screen === 'detail';

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'app-shell--collapsed' : ''}`}>
      {showSidebar && (
        <Sidebar
          route={route}
          navigate={navigate}
          servers={servers}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onAddServer={() => setInstallerOpen(true)}
        />
      )}
      <div className="app-main">
        <TopBar
          route={route}
          servers={servers}
          onTweaksToggle={() => setTweaksOpen(o => !o)}
          tweaksOpen={tweaksOpen}
          onAddServer={() => setInstallerOpen(true)}
        />
        <main className="app-content">
          {route.screen === 'dashboard' && (
            <DashboardScreen servers={servers} navigate={navigate} onRefresh={loadServers}/>
          )}
          {route.screen === 'detail' && (
            <DetailContent route={route} navigate={navigate} servers={servers} onRefresh={loadServers}/>
          )}
        </main>
      </div>
      {tweaksOpen && (
        <TweaksPanel tweaks={tweaks} setTweak={setTweak} onClose={() => setTweaksOpen(false)}/>
      )}
      {installerOpen && (
        <InstallerModal
          onClose={() => setInstallerOpen(false)}
          onAdded={() => { loadServers(); setInstallerOpen(false); }}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
