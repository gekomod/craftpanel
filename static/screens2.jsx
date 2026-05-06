// CraftPanel — Remaining tabs (Players, Plugins, Files, Backups, Settings)
const { useState, useEffect, useCallback, useRef } = React;
const { Icon: I2, Avatar: Av, MCHearts: H } = window.CraftUI;

function HealthBar({ value, max }) {
  if (!value || !max) return <span style={{ color: 'var(--text-4)', fontSize: 12 }}>—</span>;
  const totalHearts = Math.round(max / 2);
  const fullHearts  = Math.floor(value / 2);
  const halfHeart   = (value % 2) >= 1 ? 1 : 0;
  const emptyHearts = totalHearts - fullHearts - halfHeart;
  const color = value / max > 0.6 ? '#f87171' : value / max > 0.3 ? '#fca5a5' : '#fecaca';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', maxWidth: 120 }}>
      {Array.from({ length: fullHearts  }).map((_, i) => <span key={'f'+i} style={{ color: '#ef4444', fontSize: 13, lineHeight: 1 }}>♥</span>)}
      {halfHeart === 1 &&                                  <span style={{ color, fontSize: 13, lineHeight: 1 }}>♥</span>}
      {Array.from({ length: emptyHearts }).map((_, i) => <span key={'e'+i} style={{ color: 'var(--text-4)', fontSize: 13, lineHeight: 1 }}>♡</span>)}
    </div>
  );
}

function PlayersTab({ serverId }) {
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [packConnected, setPackConnected] = useState(false);
  const [testResult, setTestResult] = useState('');

  const load = () => {
    fetch(`${API}/api/servers/${serverId}/players`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setPlayers(d);
        setPackConnected(d.some(p => p.online && p.max_health > 0));
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [serverId]);

  const testEndpoint = async () => {
    setTestResult('Testowanie...');
    try {
      const r = await fetch(`${API}/api/servers/${serverId}/health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ name: 'TestPlayer', health: 20, max_health: 20, ping: 0, world: 'overworld' }]),
      });
      if (r.status === 204) {
        setTestResult('✓ Endpoint działa! Jeśli pack jest zainstalowany i serwer uruchomiony — poczekaj 5s i odśwież');
        load();
      } else {
        setTestResult(`✗ Endpoint zwrócił HTTP ${r.status} — przebuduj binary: git pull && go build -o craftpanel .`);
      }
    } catch (e) {
      setTestResult(`✗ Błąd połączenia: ${e.message}`);
    }
  };

  const healthUrl = `${location.protocol}//${location.host}/api/servers/${serverId}/health`;
  const online  = players.filter(p => p.online);
  const offline = players.filter(p => !p.online);
  const shown   = filter === 'online' ? online : filter === 'offline' ? offline : players;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)', padding: 'var(--pad)' }}>

      {/* Health pack status banner */}
      <div className="card" style={{ padding: '12px 18px',
        background: packConnected ? 'rgba(74,222,128,0.07)' : 'rgba(96,165,250,0.07)',
        border: `1px solid ${packConnected ? 'rgba(74,222,128,0.2)' : 'rgba(96,165,250,0.2)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>{packConnected ? '🟢' : '⚪'}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>
                {packConnected ? 'Health Monitor połączony — dane live' : 'Health Monitor nie wykryty'}
              </div>
              {!packConnected && (
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, fontFamily: 'monospace' }}>
                  URL w scripcie: <span style={{ color: 'var(--accent)' }}>{healthUrl}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button className="btn btn-sm btn-ghost" onClick={testEndpoint}>Testuj endpoint</button>
            {!packConnected && (
              <a href={`${API}/api/servers/${serverId}/bedrock-healthpack`}
                 className="btn btn-sm btn-primary" style={{ textDecoration: 'none' }}>
                <I2 name="download" size={13}/> Pobierz pack
              </a>
            )}
          </div>
        </div>
        {testResult && (
          <div style={{ marginTop: 8, fontSize: 12, padding: '6px 10px', borderRadius: 6, background: 'var(--bg-2)',
            color: testResult.startsWith('✓') ? '#4ade80' : testResult.startsWith('✗') ? 'var(--danger)' : 'var(--text-2)' }}>
            {testResult}
          </div>
        )}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              Gracze · <span style={{ color: 'var(--online)' }}>{online.length} online</span>
              {offline.length > 0 && <span style={{ color: 'var(--text-4)', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>/ {offline.length} w historii</span>}
            </h3>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              {online.filter(p => p.op).length > 0 && `${online.filter(p => p.op).length} OPs · `}
              Odświeżanie co 3s
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[['all','Wszyscy'], ['online','Online'], ['offline','Historia']].map(([v, l]) => (
              <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(v)}>{l}</button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            {filter === 'online' ? 'Brak graczy online' : 'Brak danych o graczach'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-1)' }}>
                <Th>Gracz</Th><Th>Status</Th><Th>Świat</Th><Th>Ping</Th><Th>Health</Th><Th>Czas sesji</Th><Th align="right">Akcje</Th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p, i) => (
                <tr key={p.identifier || i} style={{ borderTop: '1px solid var(--line-1)', opacity: p.online ? 1 : 0.55 }}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Av name={p.name} size={32}/>
                      <div>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'monospace' }}>{p.identifier || ''}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span className={`chip ${p.online ? 'chip-online' : 'chip-offline'}`}>
                        {p.online ? '● Online' : '○ Offline'}
                      </span>
                      {p.op && <span style={{ fontSize: 10, background: 'rgba(248,113,113,0.15)', color: '#fca5a5', padding: '1px 5px', borderRadius: 4, display:'inline-block' }}>OP</span>}
                    </div>
                  </Td>
                  <Td><span className="mono" style={{ fontSize: 12 }}>{p.world || '—'}</span></Td>
                  <Td><span className="mono" style={{ color: p.ping > 100 ? '#fbbf24' : 'var(--text-2)' }}>{p.ping ? `${p.ping}ms` : '—'}</span></Td>
                  <Td><HealthBar value={p.health} max={p.max_health}/></Td>
                  <Td><span className="mono" style={{ color: p.online ? 'var(--online)' : 'var(--text-4)' }}>{p.playtime || '—'}</span></Td>
                  <Td align="right">
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-ghost" title="Kick" onClick={() => {
                        fetch(`${API}/api/servers/${serverId}/command`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ command: `kick ${p.name}` }) });
                      }}><I2 name="x" size={12}/></button>
                      <button className="btn btn-sm btn-danger" title="Ban" onClick={() => {
                        if (confirm(`Banować gracza ${p.name}?`))
                          fetch(`${API}/api/servers/${serverId}/command`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ command: `ban ${p.name}` }) });
                      }}><I2 name="shield" size={12}/></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Th({ children, align = 'left' }) {
  return <th style={{ padding: '12px 16px', textAlign: align, fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</th>;
}
function Td({ children, align = 'left' }) {
  return <td style={{ padding: '12px 16px', textAlign: align, color: 'var(--text-2)' }}>{children}</td>;
}

function PluginsTab({ serverId, defaultTab }) {
  const [tab, setTab] = useState(defaultTab || 'installed');
  const [plugins, setPlugins] = useState([]);
  const [sel, setSel] = useState(null);
  // Browse state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [installing, setInstalling] = useState('');
  const [installMsg, setInstallMsg] = useState('');

  const loadPlugins = useCallback(() => {
    fetch(`${API}/api/servers/${serverId}/plugins`)
      .then(r => r.ok ? r.json() : []).then(d => setPlugins(d || [])).catch(() => {});
  }, [serverId]);

  useEffect(() => { loadPlugins(); }, [loadPlugins]);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    try {
      const r = await fetch(`/api/servers/${serverId}/plugins/search?q=${encodeURIComponent(query)}`);
      setResults(r.ok ? await r.json() : []);
    } catch {}
    setSearching(false);
  };

  const install = async (plugin) => {
    setInstalling(plugin.name);
    setInstallMsg('');
    try {
      const r = await fetch(`/api/servers/${serverId}/plugins/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: plugin.name, download_url: plugin.download_url, source: plugin.source }),
      });
      const d = await r.json();
      if (r.ok) { setInstallMsg(`✓ ${plugin.name} zainstalowany`); loadPlugins(); }
      else setInstallMsg(`✗ ${d.error || 'Błąd'}`);
    } catch (e) { setInstallMsg(`✗ ${e}`); }
    setInstalling('');
  };

  const sourceColor = { hangar: '#4ade80', modrinth: '#5da65b', mcpedl: '#60a5fa', curseforge: '#f16436' };
  const sourceName  = { hangar: 'Hangar', modrinth: 'Modrinth', mcpedl: 'MCPEDL', curseforge: 'CurseForge' };
  const isMCPEDLFallback = (p) => p.source === 'mcpedl' && p.url && p.url.includes('?s=');
  const isCFSetup = (p) => p.source === 'curseforge-setup';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '0 var(--pad)', paddingTop: 'var(--pad)' }}>
        {[['installed', 'puzzle', `Zainstalowane (${plugins.length})`], ['browse', 'search', 'Przeglądaj']].map(([id, icon, label]) => (
          <button key={id} className={`tab ${tab === id ? 'tab-active' : ''}`} onClick={() => setTab(id)}>
            <I2 name={icon} size={14}/> {label}
          </button>
        ))}
      </div>

      {tab === 'installed' && (
        <div style={{ padding: '0 var(--pad) var(--pad)', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--gap)' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Zainstalowane pluginy</h3>
              <button className="btn btn-sm" onClick={() => setTab('browse')}><I2 name="plus" size={13} strokeWidth={2}/> Dodaj</button>
            </div>
            {plugins.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                Brak pluginów · <button className="btn btn-sm btn-primary" onClick={() => setTab('browse')} style={{ marginLeft: 8 }}><I2 name="search" size={12}/> Przeglądaj</button>
              </div>
            ) : plugins.map((pl, i) => (
              <div key={i} onClick={() => setSel(sel === i ? null : i)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 18px', cursor: 'pointer',
                background: sel === i ? 'var(--bg-3)' : 'transparent',
                borderBottom: '1px solid var(--line-1)',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                  <I2 name="puzzle" size={15}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{pl.name}</div>
                  {pl.version && <div style={{ fontSize: 11, color: 'var(--text-4)' }}>v{pl.version}</div>}
                </div>
                <span className={pl.enabled ? 'chip chip-online' : 'chip chip-offline'}>{pl.enabled ? 'ON' : 'OFF'}</span>
              </div>
            ))}
          </div>

          {sel !== null && plugins[sel] && (
            <div className="card" style={{ padding: 20, height: 'fit-content', position: 'sticky', top: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 14 }}>
                <I2 name="puzzle" size={24}/>
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{plugins[sel].name}</h3>
              {plugins[sel].version && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>v{plugins[sel].version}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                <button className="btn btn-ghost" style={{ justifyContent: 'center', color: 'var(--danger)' }}><I2 name="trash" size={14}/> Usuń plik</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'browse' && (
        <div style={{ padding: '0 var(--pad) var(--pad)' }}>
          <form onSubmit={search} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input className="input" placeholder="Szukaj pluginu np. EssentialsX, WorldEdit, LuckPerms…"
              value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1 }}/>
            <button className="btn btn-primary" type="submit" disabled={searching}>
              <I2 name="search" size={14}/> {searching ? 'Szukanie…' : 'Szukaj'}
            </button>
          </form>

          {installMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
              background: installMsg.startsWith('✓') ? 'var(--accent-bg)' : 'rgba(248,113,113,0.1)',
              color: installMsg.startsWith('✓') ? 'var(--accent)' : 'var(--danger)',
              border: `1px solid ${installMsg.startsWith('✓') ? 'var(--accent-line)' : 'rgba(248,113,113,0.25)'}`,
            }}>{installMsg}</div>
          )}

          {results.length === 0 && !searching && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 13 }}>
              <I2 name="search" size={28}/><br/><br/>
              Wyszukaj pluginy / dodatki Bedrock.<br/>
              <span style={{ fontSize: 12, color: 'var(--text-4)' }}>Java: Hangar, Modrinth · Bedrock: CurseForge, Modrinth, MCPEDL</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {results.map((p, i) => isCFSetup(p) ? (
              <div key={i} style={{
                gridColumn: '1 / -1', padding: '12px 16px', borderRadius: 10,
                background: 'rgba(241,100,54,0.07)', border: '1px solid rgba(241,100,54,0.25)',
                display: 'flex', alignItems: 'center', gap: 12, fontSize: 13,
              }}>
                <span style={{ fontSize: 20 }}>🧡</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#f16436' }}>CurseForge</strong>
                  <span style={{ color: 'var(--text-2)', marginLeft: 8 }}>{p.description}</span>
                </div>
                <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ textDecoration: 'none', flexShrink: 0, borderColor: '#f16436', color: '#f16436' }}>
                  Pobierz klucz →
                </a>
              </div>
            ) : (
              <div key={i} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {p.icon ? (
                    <img src={p.icon} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                      onError={e => { e.target.style.display='none'; }}/>
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)', flexShrink: 0 }}>
                      <I2 name="puzzle" size={18}/>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }}>by {p.author}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                    background: (sourceColor[p.source] || '#888') + '20', color: sourceColor[p.source] || '#888',
                    border: `1px solid ${(sourceColor[p.source] || '#888')}40`,
                  }}>{sourceName[p.source] || p.source}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.5, flex: 1,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{p.description}</p>
                {p.downloads > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text-4)' }}>
                    <I2 name="download" size={11}/> {p.downloads.toLocaleString()} pobrań
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6 }}>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ flex: isMCPEDLFallback(p) ? '1' : undefined, justifyContent: 'center', textDecoration: 'none' }}>
                      <I2 name="globe" size={12}/> {isMCPEDLFallback(p) ? 'Otwórz MCPEDL' : 'Strona'}
                    </a>
                  )}
                  {p.download_url && !isMCPEDLFallback(p) && (
                    <button className="btn btn-sm btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                      disabled={installing === p.name}
                      onClick={() => install(p)}>
                      <I2 name="download" size={12}/> {installing === p.name ? 'Instalacja…' : 'Zainstaluj'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function fmtSize(bytes) {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB';
  return bytes + ' B';
}

function FilesTab({ serverId }) {
  const [path, setPath] = useState('');
  const [files, setFiles] = useState([]);
  const [selFile, setSelFile] = useState(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`${API}/api/servers/${serverId}/files?path=${encodeURIComponent(path)}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setFiles(d || []); setSelFile(null); setContent(''); })
      .catch(() => {});
  }, [serverId, path]);

  const openFile = (name) => {
    const filePath = path ? path + '/' + name : name;
    setSelFile(name);
    fetch(`${API}/api/servers/${serverId}/files/content?path=${encodeURIComponent(filePath)}`)
      .then(r => r.ok ? r.text() : '')
      .then(setContent)
      .catch(() => setContent('(error reading file)'));
  };

  const navigate = (entry) => {
    if (entry.is_dir) {
      setPath(path ? path + '/' + entry.name : entry.name);
    } else {
      openFile(entry.name);
    }
  };

  const goUp = () => {
    const parts = path.split('/');
    parts.pop();
    setPath(parts.join('/'));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--gap)', height: 'calc(100vh - 360px)', minHeight: 460 }}>
      <div className="card" style={{ padding: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }} className="mono">
          <I2 name="folder" size={13}/>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>~/{path || 'server'}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {path && (
            <div onClick={goUp} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, color: 'var(--text-3)', fontSize: 12, cursor: 'pointer' }} className="mono">
              <I2 name="arrow-left" size={13}/><span>..</span>
            </div>
          )}
          {files.map((f) => (
            <div key={f.name}
              onClick={() => navigate(f)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6,
                background: selFile === f.name ? 'var(--accent-bg)' : 'transparent',
                color: selFile === f.name ? 'var(--accent)' : 'var(--text-2)',
                fontSize: 12, cursor: 'pointer',
              }} className="mono">
              <I2 name={f.is_dir ? 'folder' : 'file-text'} size={13}/>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              {!f.is_dir && <span style={{ fontSize: 10, color: 'var(--text-4)' }}>{fmtSize(f.size)}</span>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, padding: '8px 0 0', borderTop: '1px solid var(--line-1)', marginTop: 8 }}>
          <button className="btn btn-sm" style={{ flex: 1 }}><I2 name="upload" size={13}/></button>
          <button className="btn btn-sm" style={{ flex: 1 }}><I2 name="plus" size={13}/></button>
          <button className="btn btn-sm btn-danger" style={{ flex: 1 }}><I2 name="trash" size={13}/></button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="mono">
            <I2 name="file-text" size={13} color="var(--text-3)"/>
            <span style={{ fontSize: 13 }}>{selFile || 'Wybierz plik'}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm btn-ghost"><I2 name="download" size={13}/></button>
            <button className="btn btn-sm btn-primary">Zapisz · ⌘S</button>
          </div>
        </div>
        <pre className="mono" style={{
          flex: 1, margin: 0, padding: 18,
          background: 'var(--bg-0)', color: 'var(--text-2)',
          fontSize: 12.5, lineHeight: 1.7,
          overflow: 'auto', whiteSpace: 'pre-wrap',
        }}>{content || (selFile ? 'Ładowanie...' : 'Kliknij plik aby go otworzyć')}</pre>
      </div>
    </div>
  );
}

function BackupsTab({ serverId }) {
  const [backups, setBackups] = useState([]);
  const reload = () => fetch(`${API}/api/servers/${serverId}/backups`).then(r => r.ok ? r.json() : []).then(d => setBackups(d || [])).catch(() => {});
  useEffect(() => { reload(); }, [serverId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
      <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          <I2 name="archive" size={20}/>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Snapshoty świata</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Auto co 12h · Wykorzystano 4.1 / 25 GB · Ostatni: 23 min temu</div>
        </div>
        <button className="btn"><I2 name="settings" size={13}/> Konfiguruj</button>
        <button className="btn btn-primary" onClick={() => fetch(`${API}/api/servers/${serverId}/backups`, {method:'POST'}).then(reload)}><I2 name="plus" size={13} strokeWidth={2}/> Stwórz teraz</button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: 'var(--bg-1)' }}>
            <Th>Nazwa</Th><Th>Typ</Th><Th>Rozmiar</Th><Th>Utworzono</Th><Th align="right">Akcje</Th>
          </tr></thead>
          <tbody>
            {backups.map(b => (
              <tr key={b.id} style={{ borderTop: '1px solid var(--line-1)' }}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <I2 name="archive" size={14} color="var(--text-3)"/>
                    <span className="mono">{b.name}</span>
                  </div>
                </Td>
                <Td><span className="chip chip-online">MANUAL</span></Td>
                <Td><span className="mono">{fmtSize(b.size)}</span></Td>
                <Td><span className="mono" style={{ fontSize: 12 }}>{new Date(b.created_at).toLocaleString()}</span></Td>
                <Td align="right">
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button className="btn btn-sm btn-ghost"><I2 name="download" size={13}/></button>
                    <button className="btn btn-sm">Przywróć</button>
                    <button className="btn btn-sm btn-danger"><I2 name="trash" size={13}/></button>
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

function SettingsTab({ server, serverId, onDelete, onRefresh }) {
  const [delConfirm, setDelConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteServer = async () => {
    setDeleting(true);
    try {
      const r = await fetch(`/api/servers/${serverId || server?.id}`, { method: 'DELETE' });
      if (r.ok) { onDelete && onDelete(); return; }
      const d = await r.json().catch(() => ({}));
      alert(d.error || 'Błąd usuwania serwera');
    } catch {}
    setDeleting(false);
    setDelConfirm(false);
  };

  return (
    <div style={{ padding: 'var(--pad)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap)' }}>
      <SettingsCard title="Podstawowe" icon="settings">
        <SetText label="MOTD" value={server?.motd}/>
        <SetText label="Max graczy" value={server?.max_players} type="number"/>
        <SetText label="Port" value={server?.port || '25565'} type="number"/>
        <SetSelect label="Tryb gry" value="survival" options={['survival', 'creative', 'adventure', 'spectator']}/>
        <SetSelect label="Trudność" value="normal" options={['peaceful', 'easy', 'normal', 'hard']}/>
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
        <SetText label="RAM (max)" value="2" type="number" suffix="GB"/>
        <SetText label="Auto-save interval" value="300" type="number" suffix="s"/>
        <SetToggle label="Auto-restart o 4:00" value={true}/>
        <SetToggle label="Watchdog" value={true}/>
      </SettingsCard>

      <SettingsCard title="Strefa zagrożenia" icon="flame" danger>
        <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 0 }}>Te akcje są nieodwracalne. Stwórz backup przed kontynuowaniem.</p>
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
          <I2 name="restart" size={14}/> Reset świata
        </button>
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
          <I2 name="trash" size={14}/> Wyczyść playerdata
        </button>
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => setDelConfirm(true)}>
          <I2 name="power" size={14}/> Usuń serwer z panelu
        </button>
      </SettingsCard>

      {delConfirm && (
        <div className="modal-backdrop" onClick={() => setDelConfirm(false)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Usuń serwer</h3>
              <button className="modal-close" onClick={() => setDelConfirm(false)}><I2 name="x" size={18}/></button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>
                Usuwa serwer <strong>{server?.name}</strong> z panelu CraftPanel.<br/>
                <span style={{ color: 'var(--text-3)', fontSize: 12 }}>Pliki na dysku nie zostaną usunięte. Serwer musi być zatrzymany.</span>
              </p>
            </div>
            <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setDelConfirm(false)}>Anuluj</button>
              <button className="btn btn-danger" onClick={deleteServer} disabled={deleting}>
                {deleting ? 'Usuwanie…' : 'Usuń serwer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsCard({ title, icon, danger, children }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: danger ? 'rgba(248,113,113,0.10)' : 'var(--bg-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: danger ? 'var(--danger)' : 'var(--text-2)',
        }}>
          <I2 name={icon} size={15}/>
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
  const [v, setV] = useState(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <label style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</label>
      <button onClick={() => setV(!v)} style={{
        position: 'relative', width: 36, height: 20, borderRadius: 999,
        background: v ? 'var(--accent)' : 'var(--bg-4)', transition: 'background 0.15s',
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

function MonitoringTab({ serverId }) {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    fetch(`/api/servers/${serverId}/stats/history`)
      .then(r => r.ok ? r.json() : []).then(d => setHistory(d || [])).catch(() => {});
    const t = setInterval(() => {
      fetch(`/api/servers/${serverId}/stats/history`)
        .then(r => r.ok ? r.json() : []).then(d => setHistory(d || [])).catch(() => {});
    }, 5000);
    return () => clearInterval(t);
  }, [serverId]);

  const cpuData  = history.map(h => h.cpu || 0);
  const ramData  = history.map(h => h.ram || 0);
  const playData = history.map(h => h.players || 0);
  const { Sparkline } = window.CraftUI;

  const Chart = ({ label, data, color, unit }) => (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {data.length ? (data[data.length-1]).toFixed(unit === '%' ? 1 : 0) : '—'}<span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 2 }}>{unit}</span>
        </div>
      </div>
      <Sparkline data={data.length >= 2 ? data : [0, 0]} color={color} height={60}/>
    </div>
  );

  return (
    <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap)' }}>
        <Chart label="CPU" data={cpuData} color="var(--danger)" unit="%"/>
        <Chart label="RAM" data={ramData.map(v => v / 1024 / 1024)} color="var(--purple)" unit=" MB"/>
        <Chart label="Gracze online" data={playData} color="var(--accent)" unit=""/>
      </div>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Historia (ostatnie {history.length} pomiarów)</div>
        {history.length === 0 ? (
          <div style={{ color: 'var(--text-4)', fontSize: 13 }}>Brak danych — serwer musi działać by zbierać statystyki.</div>
        ) : (
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--line-1)' }}>
              {['Czas', 'CPU', 'RAM', 'Gracze'].map(h => <th key={h} style={{ padding: '6px 12px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[...history].reverse().slice(0, 20).map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--line-1)' }}>
                  <td style={{ padding: '6px 12px', color: 'var(--text-3)' }} className="mono">{new Date(h.ts * 1000).toLocaleTimeString('pl')}</td>
                  <td style={{ padding: '6px 12px' }} className="mono">{(h.cpu||0).toFixed(1)}%</td>
                  <td style={{ padding: '6px 12px' }} className="mono">{((h.ram||0)/1024/1024).toFixed(0)} MB</td>
                  <td style={{ padding: '6px 12px' }} className="mono">{h.players || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SecurityTab({ serverId }) {
  return (
    <div style={{ padding: 'var(--pad)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap)' }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(248,113,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
            <I2 name="shield" size={15}/>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Whitelist</h3>
        </div>
        <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Zarządzaj białą listą graczy.</div>
        <button className="btn btn-sm" style={{ marginTop: 12 }}><I2 name="plus" size={13}/> Dodaj gracza</button>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(248,113,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
            <I2 name="x" size={15}/>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Blacklist / Bany</h3>
        </div>
        <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Lista zbanowanych graczy i IP.</div>
        <button className="btn btn-sm btn-danger" style={{ marginTop: 12 }}><I2 name="plus" size={13}/> Dodaj bana</button>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warn)' }}>
            <I2 name="crown" size={15}/>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Operatorzy (OP)</h3>
        </div>
        <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Gracze z uprawnieniami operatora.</div>
        <button className="btn btn-sm" style={{ marginTop: 12 }}><I2 name="plus" size={13}/> Dodaj OP</button>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
            <I2 name="lock" size={15}/>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>RCON</h3>
        </div>
        <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Zdalne połączenie konsolowe.</div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', color: 'var(--text-2)' }}>
            <span>Port</span><span className="mono">25575</span>
          </div>
          <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', color: 'var(--text-2)' }}>
            <span>Status</span><span style={{ color: 'var(--accent)' }}>Aktywny</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelSettingsScreen({ currentUser }) {
  const [cfKey, setCfKey]     = useState('');
  const [cfSet, setCfSet]     = useState(false);
  const [cfPreview, setCfPreview] = useState('');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => {
      if (r.status === 403) { setForbidden(true); return null; }
      return r.json();
    }).then(d => {
      if (!d) return;
      setCfSet(!!d.curseforge_api_key);
      setCfPreview(d.curseforge_api_key_preview || '');
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const r = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curseforge_api_key: cfKey }),
      });
      if (!r.ok) { const d = await r.json(); setError(d.error || 'Błąd'); }
      else {
        setSaved(true);
        setCfSet(!!cfKey);
        setCfPreview(cfKey.length > 8 ? cfKey.slice(0,4) + '•'.repeat(cfKey.length-8) + cfKey.slice(-4) : '•'.repeat(cfKey.length));
        setCfKey('');
        setTimeout(() => setSaved(false), 2500);
      }
    } catch(e) { setError(String(e)); }
    setSaving(false);
  };

  if (forbidden) return (
    <div style={{ padding: 'var(--pad)', color: 'var(--text-3)', fontSize: 13 }}>
      Brak uprawnień — ta sekcja jest dostępna tylko dla administratorów.
    </div>
  );

  return (
    <div style={{ padding: 'var(--pad)', maxWidth: 640 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Ustawienia panelu</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 13, margin: '4px 0 0' }}>Konfiguracja globalna CraftPanel</p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(241,100,54,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f16436' }}>
            <I2 name="lock" size={15}/>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>CurseForge API Key</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Wymagany do wyszukiwania dodatków Bedrock z CurseForge</div>
          </div>
          {cfSet && <span className="chip chip-online" style={{ marginLeft: 'auto' }}>Aktywny</span>}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 14px', lineHeight: 1.6 }}>
          Bez klucza używany jest publiczny endpoint z ograniczeniami. Klucz pobierzesz bezpłatnie na{' '}
          <a href="https://console.curseforge.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>console.curseforge.com</a>.
        </p>

        {cfSet && cfPreview && !cfKey && (
          <div style={{ padding: '8px 12px', background: 'var(--bg-1)', borderRadius: 8, fontSize: 12, marginBottom: 12, color: 'var(--text-2)', fontFamily: 'monospace' }}>
            Aktualny klucz: {cfPreview}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input mono"
            type="password"
            placeholder={cfSet ? 'Wpisz nowy klucz aby zastąpić…' : '$2a$10$…'}
            value={cfKey}
            onChange={e => { setCfKey(e.target.value); setError(''); }}
            style={{ flex: 1, fontSize: 12 }}
          />
          <button className="btn btn-primary" onClick={save} disabled={saving || !cfKey.trim()}>
            <I2 name={saved ? 'check' : 'save'} size={14}/> {saved ? 'Zapisano!' : saving ? '…' : 'Zapisz'}
          </button>
          {cfSet && (
            <button className="btn btn-danger" onClick={() => { setCfKey(''); fetch('/api/settings', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({curseforge_api_key:''}) }).then(() => { setCfSet(false); setCfPreview(''); }); }} title="Usuń klucz">
              <I2 name="trash" size={14}/>
            </button>
          )}
        </div>

        {error && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
      </div>
    </div>
  );
}

window.CraftTabs = { PlayersTab, PluginsTab, FilesTab, BackupsTab, SettingsTab, MonitoringTab, SecurityTab, PanelSettingsScreen };
