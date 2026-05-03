// CraftPanel — Remaining tabs (Players, Plugins, Files, Backups, Settings)
const { Icon: I2, Avatar: Av, MCHearts: H } = window.CraftUI;

function PlayersTab() {
  const [players, setPlayers] = useState([]);
  useEffect(() => {
    fetch(`${API}/api/players`).then(r => r.ok ? r.json() : null).then(d => d && setPlayers(d)).catch(() => {});
  }, []);

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

function PluginsTab() {
  const [plugins, setPlugins] = useState([]);
  const [sel, setSel] = useState(0);
  useEffect(() => {
    fetch(`${API}/api/plugins`).then(r => r.ok ? r.json() : null).then(d => d && setPlugins(d)).catch(() => {});
  }, []);
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

function FilesTab() {
  const FILES = [
    { name: '..', type: 'up', size: '', modified: '' },
    { name: 'world', type: 'folder', size: '847 MB', modified: '2026-04-27 18:32' },
    { name: 'world_nether', type: 'folder', size: '124 MB', modified: '2026-04-27 18:32' },
    { name: 'world_the_end', type: 'folder', size: '38 MB', modified: '2026-04-27 18:32' },
    { name: 'plugins', type: 'folder', size: '218 MB', modified: '2026-04-26 02:14' },
    { name: 'logs', type: 'folder', size: '64 MB', modified: '2026-04-28 09:01' },
    { name: 'cache', type: 'folder', size: '12 MB', modified: '2026-04-28 06:00' },
    { name: 'config', type: 'folder', size: '4.2 MB', modified: '2026-04-22 16:48' },
    { name: 'banned-ips.json', type: 'json', size: '1.2 KB', modified: '2026-04-15 22:10' },
    { name: 'banned-players.json', type: 'json', size: '3.8 KB', modified: '2026-04-25 14:33' },
    { name: 'eula.txt', type: 'txt', size: '156 B', modified: '2024-01-01 00:00' },
    { name: 'ops.json', type: 'json', size: '512 B', modified: '2026-04-20 10:25' },
    { name: 'paper.yml', type: 'yml', size: '24 KB', modified: '2026-04-10 11:11' },
    { name: 'permissions.yml', type: 'yml', size: '0 B', modified: '2024-01-01 00:00' },
    { name: 'server.jar', type: 'jar', size: '52 MB', modified: '2026-04-15 08:00' },
    { name: 'server.properties', type: 'props', size: '1.8 KB', modified: '2026-04-27 15:22' },
    { name: 'spigot.yml', type: 'yml', size: '8.4 KB', modified: '2026-04-10 11:11' },
    { name: 'whitelist.json', type: 'json', size: '2.1 KB', modified: '2026-04-26 19:45' },
  ];
  const [sel, setSel] = useState('server.properties');
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
          <I2 name="folder" size={13}/>
          <span>~/server</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {FILES.map((f, i) => (
            <div key={f.name + i}
              onClick={() => f.type !== 'folder' && f.type !== 'up' && setSel(f.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6,
                background: sel === f.name ? 'var(--accent-bg)' : 'transparent',
                color: sel === f.name ? 'var(--accent)' : 'var(--text-2)',
                fontSize: 12, cursor: 'pointer',
              }} className="mono">
              <I2 name={f.type === 'folder' || f.type === 'up' ? 'folder' : 'eye'} size={13}/>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 10, color: 'var(--text-4)' }}>{f.size}</span>
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
            <I2 name="eye" size={13} color="var(--text-3)"/>
            <span style={{ fontSize: 13 }}>{sel}</span>
            <span className="chip" style={{ height: 18, fontSize: 10 }}>● Modified</span>
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
        }}>{content}</pre>
      </div>
    </div>
  );
}

function BackupsTab() {
  const [backups, setBackups] = useState([]);
  useEffect(() => {
    fetch(`${API}/api/backups`).then(r => r.ok ? r.json() : null).then(d => d && setBackups(d)).catch(() => {});
  }, []);

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
        <button className="btn btn-primary"><I2 name="plus" size={13} strokeWidth={2}/> Stwórz teraz</button>
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
                <Td><span className={b.auto ? 'chip' : 'chip chip-online'}>{b.auto ? 'AUTO' : 'MANUAL'}</span></Td>
                <Td><span className="mono">{b.size}</span></Td>
                <Td><span className="mono" style={{ fontSize: 12 }}>{b.created}</span></Td>
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
