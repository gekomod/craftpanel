// CraftPanel — Remaining tabs (Players, Plugins, Files, Backups, Settings)
const { Icon: I2, Avatar: Av, MCHearts: H } = window.CraftUI;

function PlayersTab({ serverId }) {
  const [players, setPlayers] = useState([]);
  useEffect(() => {
    fetch(`${API}/api/servers/${serverId}/players`).then(r => r.ok ? r.json() : null).then(d => d && setPlayers(d)).catch(() => {});
  }, [serverId]);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Online · {players.length} graczy</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            {players.filter(p => p.op).length} OPs · {players.filter(p => p.status === 'vip').length} VIPs · {players.filter(p => !p.op && p.status !== 'vip').length} graczy
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm"><I2 name="shield" size={13}/> Whitelist</button>
          <button className="btn btn-sm"><I2 name="x" size={13}/> Banlist</button>
          <button className="btn btn-sm"><I2 name="search" size={13}/></button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--bg-1)' }}>
            <Th>Gracz</Th><Th>Status</Th><Th>Świat</Th><Th>Ping</Th>
            <Th>Czas gry</Th><Th>Health</Th><Th align="right">Akcje</Th>
          </tr>
        </thead>
        <tbody>
          {players.map(p => (
            <tr key={p.uuid} style={{ borderTop: '1px solid var(--line-1)' }}>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Av name={p.name} skin={p.skin} size={32}/>
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-4)' }} className="mono">{p.uuid}</div>
                  </div>
                </div>
              </Td>
              <Td>
                {p.op && <span className="chip" style={{ background: 'rgba(248,113,113,0.12)', color: '#fca5a5', borderColor: 'rgba(248,113,113,0.25)' }}><I2 name="crown" size={10}/> OP</span>}
                {p.status === 'vip' && <span className="chip" style={{ background: 'rgba(251,191,36,0.10)', color: '#fcd34d', borderColor: 'rgba(251,191,36,0.25)' }}>VIP</span>}
                {!p.op && p.status !== 'vip' && <span className="chip">Player</span>}
              </Td>
              <Td><span className="mono" style={{ fontSize: 12 }}>{p.world}</span></Td>
              <Td><span className="mono" style={{ color: p.ping > 100 ? 'var(--warn)' : 'var(--text-2)' }}>{p.ping}ms</span></Td>
              <Td><span className="mono">{p.playtime}</span></Td>
              <Td><H value={70 + (p.uuid.charCodeAt(0) % 30)}/></Td>
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

function PluginsTab({ serverId }) {
  const [plugins, setPlugins] = useState([]);
  const [sel, setSel] = useState(0);
  useEffect(() => {
    fetch(`${API}/api/servers/${serverId}/plugins`).then(r => r.ok ? r.json() : null).then(d => d && setPlugins(d)).catch(() => {});
  }, [serverId]);
  const p = plugins[sel];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--gap)' }}>
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Pluginy <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>· {plugins.length}</span></h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm"><I2 name="search" size={13}/></button>
            <button className="btn btn-sm btn-primary"><I2 name="plus" size={13} strokeWidth={2}/> Wgraj</button>
          </div>
        </div>
        {plugins.map((pl, i) => (
          <div key={i} onClick={() => setSel(i)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', cursor: 'pointer', borderRadius: 8,
            background: sel === i ? 'var(--bg-3)' : 'transparent',
            border: '1px solid', borderColor: sel === i ? 'var(--line-2)' : 'transparent',
            marginBottom: 2,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: pl.enabled ? 'var(--accent-bg)' : 'var(--bg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: pl.enabled ? 'var(--accent)' : 'var(--text-4)',
            }}>
              <I2 name="plug" size={15}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{pl.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{pl.desc}</div>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-4)' }}>v{pl.version}</span>
            <span className={pl.enabled ? 'chip chip-online' : 'chip chip-offline'}>{pl.enabled ? 'ON' : 'OFF'}</span>
          </div>
        ))}
      </div>

      {p && (
        <div className="card" style={{ padding: 18, height: 'fit-content', position: 'sticky', top: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 14 }}>
            <I2 name="plug" size={26}/>
          </div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{p.name}</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>v{p.version} · by {p.author}</div>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 12, lineHeight: 1.6 }}>{p.desc}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            <button className={p.enabled ? 'btn btn-danger' : 'btn btn-primary'} style={{ justifyContent: 'center' }}>
              {p.enabled ? <><I2 name="power" size={14}/> Wyłącz</> : <><I2 name="play" size={14}/> Włącz</>}
            </button>
            <button className="btn" style={{ justifyContent: 'center' }}><I2 name="settings" size={14}/> Konfiguracja</button>
            <button className="btn" style={{ justifyContent: 'center' }}><I2 name="upload" size={14}/> Sprawdź aktualizacje</button>
            <button className="btn btn-ghost" style={{ justifyContent: 'center', color: 'var(--danger)' }}><I2 name="trash" size={14}/> Odinstaluj</button>
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

function SettingsTab({ server }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap)' }}>
      <SettingsCard title="Podstawowe" icon="settings">
        <SetText label="MOTD" value={server.motd}/>
        <SetText label="Max graczy" value={server.maxPlayers} type="number"/>
        <SetText label="Port" value="25565" type="number"/>
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
        <SetText label="RAM (max)" value={server.ramMax} type="number" suffix="GB"/>
        <SetText label="Auto-save interval" value="300" type="number" suffix="s"/>
        <SetToggle label="Auto-restart o 4:00" value={true}/>
        <SetToggle label="Watchdog" value={true}/>
      </SettingsCard>

      <SettingsCard title="Strefa zagrożenia" icon="flame" danger>
        <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 0 }}>Te akcje są nieodwracalne. Stwórz backup przed kontynuowaniem.</p>
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}><I2 name="restart" size={14}/> Reset świata</button>
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}><I2 name="trash" size={14}/> Wyczyść playerdata</button>
        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}><I2 name="power" size={14}/> Usuń serwer permanentnie</button>
      </SettingsCard>
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

window.CraftTabs = { PlayersTab, PluginsTab, FilesTab, BackupsTab, SettingsTab };
