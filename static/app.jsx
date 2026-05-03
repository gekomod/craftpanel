const { useState, useEffect, useRef } = React;
const { LoginScreen, DashboardScreen, ServerDetailScreen } = window.CraftScreens;
const { PlayersTab, PluginsTab, FilesTab, BackupsTab, SettingsTab } = window.CraftTabs;
const { Icon, CubeLogo, SteveCharacter, TweaksPanel, useTweaks } = window.CraftUI;

function Sidebar({ route, navigate, servers, collapsed, setCollapsed }) {
  const navItems = [
    { id: 'dashboard', icon: 'grid', label: 'Dashboard' },
    { id: 'players', icon: 'users', label: 'Players' },
    { id: 'plugins', icon: 'puzzle', label: 'Plugins' },
    { id: 'files', icon: 'folder', label: 'Files' },
    { id: 'backups', icon: 'archive', label: 'Backups' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
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
            <button
              className="sidebar-back"
              onClick={() => navigate({ screen: 'dashboard' })}
            >
              <Icon name="arrow-left" size={16} />
              {!collapsed && <span>Back</span>}
            </button>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`sidebar-item ${route.tab === item.id ? 'sidebar-item--active' : ''}`}
                onClick={() => navigate({ screen: 'detail', serverId: route.serverId, tab: item.id })}
                title={collapsed ? item.label : ''}
              >
                <Icon name={item.icon} size={18} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </>
        ) : (
          <>
            <button
              className={`sidebar-item ${route.screen === 'dashboard' ? 'sidebar-item--active' : ''}`}
              onClick={() => navigate({ screen: 'dashboard' })}
            >
              <Icon name="grid" size={18} />
              {!collapsed && <span>Dashboard</span>}
            </button>
            <div className="sidebar-section-label">{!collapsed && 'Servers'}</div>
            {servers.map(srv => (
              <button
                key={srv.id}
                className={`sidebar-item sidebar-item--server`}
                onClick={() => navigate({ screen: 'detail', serverId: srv.id, tab: 'dashboard' })}
              >
                <div className={`status-dot status-dot--${srv.status}`} />
                {!collapsed && <span className="sidebar-srv-name">{srv.name}</span>}
              </button>
            ))}
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

function TopBar({ route, servers, onTweaksToggle, tweaksOpen }) {
  const server = servers.find(s => s.id === route.serverId);
  const titles = {
    dashboard: 'Dashboard',
    players: 'Players',
    plugins: 'Plugins',
    files: 'File Manager',
    backups: 'Backups',
    settings: 'Settings',
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {server && (
          <span className="topbar-breadcrumb">
            <span className="topbar-breadcrumb-parent">Servers</span>
            <Icon name="chevron-right" size={14} />
            <span className="topbar-breadcrumb-current">{server.name}</span>
            {route.tab && route.tab !== 'dashboard' && (
              <>
                <Icon name="chevron-right" size={14} />
                <span className="topbar-breadcrumb-current">{titles[route.tab] || route.tab}</span>
              </>
            )}
          </span>
        )}
        {!server && <span className="topbar-title">Dashboard</span>}
      </div>
      <div className="topbar-right">
        <button
          className={`topbar-btn ${tweaksOpen ? 'topbar-btn--active' : ''}`}
          onClick={onTweaksToggle}
          title="Appearance settings"
        >
          <Icon name="sliders" size={18} />
        </button>
      </div>
    </header>
  );
}

function DetailContent({ route, navigate }) {
  const tab = route.tab || 'dashboard';
  const sid = route.serverId;

  if (tab === 'dashboard') return <ServerDetailScreen serverId={sid} navigate={navigate} />;
  if (tab === 'players') return <PlayersTab serverId={sid} />;
  if (tab === 'plugins') return <PluginsTab serverId={sid} />;
  if (tab === 'files') return <FilesTab serverId={sid} />;
  if (tab === 'backups') return <BackupsTab serverId={sid} />;
  if (tab === 'settings') return <SettingsTab serverId={sid} />;
  return <div className="p-8 text-muted">Unknown tab: {tab}</div>;
}

function App() {
  const [route, setRoute] = useState({ screen: 'login' });
  const [servers, setServers] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const { tweaks, setTweak } = useTweaks();

  useEffect(() => {
    if (route.screen !== 'login') {
      fetch('/api/servers')
        .then(r => r.json())
        .then(data => setServers(data || []))
        .catch(() => {});
    }
  }, [route.screen]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', tweaks.theme || 'default');
    root.setAttribute('data-font', tweaks.font || 'geist');
    root.setAttribute('data-density', tweaks.density || 'normal');
    root.setAttribute('data-animations', tweaks.animations !== false ? 'on' : 'off');
  }, [tweaks]);

  const navigate = (next) => setRoute(next);

  if (route.screen === 'login') {
    return (
      <LoginScreen onLogin={() => navigate({ screen: 'dashboard' })} />
    );
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
        />
      )}
      <div className="app-main">
        <TopBar
          route={route}
          servers={servers}
          onTweaksToggle={() => setTweaksOpen(o => !o)}
          tweaksOpen={tweaksOpen}
        />
        <main className="app-content">
          {route.screen === 'dashboard' && (
            <DashboardScreen
              servers={servers}
              navigate={navigate}
            />
          )}
          {route.screen === 'detail' && (
            <DetailContent route={route} navigate={navigate} />
          )}
        </main>
      </div>
      {tweaksOpen && (
        <TweaksPanel
          tweaks={tweaks}
          setTweak={setTweak}
          onClose={() => setTweaksOpen(false)}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
