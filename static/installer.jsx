// CraftPanel — Installer Wizard (Add Server)
const { Icon: II, CubeLogo: CL } = window.CraftUI;

const STEP_TYPE    = 0;
const STEP_CONFIG  = 1;
const STEP_VERSION = 2;
const STEP_INSTALL = 3;
const STEP_DONE    = 4;

function InstallerModal({ onClose, onAdded }) {
  const [step, setStep] = useState(STEP_TYPE);
  const [serverType, setServerType] = useState('java');
  const [form, setForm] = useState({ name: '', port: '', ram: '2', rconPassword: 'craftpanel' });
  const [versions, setVersions] = useState([]);
  const [selVersion, setSelVersion] = useState('');
  const [bedrockInfo, setBedrockInfo] = useState(null);
  const [manualUrl, setManualUrl] = useState('');
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState({ phase: 'pending', pct: 0, error: '' });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const autoId = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'server';

  const goToVersion = () => {
    if (!form.name.trim()) return;
    setStep(STEP_VERSION);
    if (serverType === 'java' && versions.length === 0) {
      fetch('/api/install/java/versions').then(r => r.json())
        .then(d => { setVersions(d.versions || []); setSelVersion((d.versions||[])[0]||''); })
        .catch(() => {});
    }
    if (serverType === 'bedrock' && !bedrockInfo) {
      fetch('/api/install/bedrock').then(r => r.json())
        .then(d => setBedrockInfo(d))
        .catch(() => {});
    }
  };

  const startInstall = () => {
    const id = autoId(form.name);
    const payload = {
      type: serverType,
      id,
      name: form.name,
      version: selVersion,
      download_url: bedrockInfo?.download_url || manualUrl || '',
      port: parseInt(form.port) || (serverType === 'bedrock' ? 19132 : 25565),
      ram: parseInt(form.ram) || 2,
      rcon_port: 25575,
      rcon_password: form.rconPassword || 'craftpanel',
    };
    fetch('/api/install/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json()).then(d => {
      if (d.error) { setProgress({ phase: 'error', pct: 0, error: d.error }); setStep(STEP_INSTALL); return; }
      setJobId(d.job_id);
      setStep(STEP_INSTALL);
      watchJob(d.job_id);
    }).catch(e => { setStep(STEP_INSTALL); setProgress({ phase: 'error', pct: 0, error: String(e) }); });
  };

  const watchJob = (id) => {
    let finished = false;
    const src = new EventSource(`/api/install/jobs/${id}/stream`, { withCredentials: true });
    src.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setProgress({ phase: d.phase, pct: d.pct || 0, error: d.error || '' });
      if (d.phase === 'done' || d.phase === 'error') {
        finished = true;
        src.close();
        if (d.phase === 'done') { onAdded(); setStep(STEP_DONE); }
      }
    };
    src.onerror = () => {
      src.close();
      // onerror also fires on normal stream close — only report if we never got a terminal event
      if (!finished) {
        setProgress(p => ({ ...p, phase: 'error', error: 'Utracono połączenie z serwerem' }));
      }
    };
  };

  const serverId = autoId(form.name);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{
        width: 600, maxWidth: '95vw', padding: 0,
        border: '1px solid var(--line-2)', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <II name="plus" size={18} strokeWidth={2}/>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Dodaj serwer</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {['Typ', 'Konfiguracja', 'Wersja', 'Instalacja', 'Gotowe'][step]}
              </div>
            </div>
          </div>
          <button className="btn btn-sm btn-ghost btn-icon" onClick={onClose}><II name="x" size={16}/></button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', padding: '12px 24px', gap: 6, background: 'var(--bg-1)' }}>
          {['Typ', 'Konfiguracja', 'Wersja', 'Instalacja'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: i < 3 ? 1 : 0 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < step ? 'var(--accent)' : i === step ? 'var(--accent-bg)' : 'var(--bg-3)',
                color: i <= step ? (i < step ? '#000' : 'var(--accent)') : 'var(--text-4)',
                border: i === step ? '1px solid var(--accent)' : 'none',
              }}>
                {i < step ? <II name="check" size={11} strokeWidth={3}/> : i + 1}
              </div>
              <span style={{ fontSize: 11, color: i <= step ? 'var(--text-1)' : 'var(--text-4)' }}>{label}</span>
              {i < 3 && <div style={{ flex: 1, height: 1, background: i < step ? 'var(--accent)' : 'var(--line-1)', marginLeft: 4 }}/>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: 24, minHeight: 280 }}>
          {step === STEP_TYPE    && <StepType serverType={serverType} setServerType={setServerType}/>}
          {step === STEP_CONFIG  && <StepConfig form={form} setField={setField} serverType={serverType} serverId={serverId}/>}
          {step === STEP_VERSION && <StepVersion serverType={serverType} versions={versions} selVersion={selVersion} setSelVersion={setSelVersion} bedrockInfo={bedrockInfo} manualUrl={manualUrl} setManualUrl={setManualUrl}/>}
          {step === STEP_INSTALL && <StepInstall progress={progress}/>}
          {step === STEP_DONE    && <StepDone onClose={onClose}/>}
        </div>

        {/* Footer */}
        {step < STEP_INSTALL && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn" onClick={() => step > 0 ? setStep(step - 1) : onClose()}>
              <II name="arrow-left" size={14}/> {step === 0 ? 'Anuluj' : 'Wstecz'}
            </button>
            <button className="btn btn-primary" onClick={() => {
              if (step === STEP_TYPE) setStep(STEP_CONFIG);
              else if (step === STEP_CONFIG) { if (form.name.trim()) goToVersion(); }
              else if (step === STEP_VERSION) startInstall();
            }} disabled={
              (step === STEP_CONFIG && !form.name.trim()) ||
              (step === STEP_VERSION && serverType === 'bedrock' && !bedrockInfo?.download_url && !manualUrl.trim())
            }>
              {step === STEP_VERSION ? <><II name="download" size={14}/> Zainstaluj</> : <><II name="arrow-right" size={14}/> Dalej</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepType({ serverType, setServerType }) {
  const types = [
    { id: 'java',    label: 'Java Edition',    icon: 'coffee', desc: 'Paper MC · Spigot · Vanilla · Forge · Fabric', note: 'Wymagana Java 17+', color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
    { id: 'bedrock', label: 'Bedrock Edition',  icon: 'layers', desc: 'Oficjalny serwer Mojang · PE · Console · Win10', note: 'Linux x64',         color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
  ];
  return (
    <div>
      <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 0 }}>Wybierz typ serwera Minecraft:</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        {types.map(t => (
          <div key={t.id} onClick={() => setServerType(t.id)} style={{
            padding: 20, borderRadius: 12, cursor: 'pointer',
            border: `2px solid ${serverType === t.id ? t.color : 'var(--line-1)'}`,
            background: serverType === t.id ? t.bg : 'var(--bg-1)',
            transition: 'all 0.15s',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, marginBottom: 12,
              background: serverType === t.id ? `${t.color}20` : 'var(--bg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: serverType === t.id ? t.color : 'var(--text-3)',
            }}>
              <II name={t.icon} size={22}/>
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{t.desc}</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 8 }}>{t.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepConfig({ form, setField, serverType, serverId }) {
  const defaultPort = serverType === 'bedrock' ? '19132' : '25565';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row label="Nazwa serwera">
        <input className="input" placeholder="Survival SMP" value={form.name}
          onChange={e => setField('name', e.target.value)} autoFocus/>
      </Row>
      <Row label="Katalog">
        <div className="input" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-3)', cursor: 'default', background: 'var(--bg-0)' }}>
          <span className="mono" style={{ fontSize: 12 }}>servers/{serverId || '…'}/</span>
        </div>
      </Row>
      <Row label="Port">
        <input className="input mono" placeholder={defaultPort} value={form.port}
          onChange={e => setField('port', e.target.value)}/>
      </Row>
      {serverType === 'java' && (
        <>
          <Row label="RAM (GB)">
            <input className="input mono" type="number" min="1" max="64" placeholder="2" value={form.ram}
              onChange={e => setField('ram', e.target.value)}/>
          </Row>
          <Row label="RCON hasło">
            <input className="input mono" placeholder="craftpanel" value={form.rconPassword}
              onChange={e => setField('rconPassword', e.target.value)}/>
          </Row>
        </>
      )}
      <div style={{ padding: '10px 14px', background: 'var(--bg-1)', borderRadius: 8, fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <II name="info" size={13}/>
        Pliki serwera zostaną pobrane do katalogu <span className="mono" style={{ color: 'var(--text-2)' }}>servers/{serverId || '…'}/</span>
      </div>
    </div>
  );
}

function StepVersion({ serverType, versions, selVersion, setSelVersion, bedrockInfo, manualUrl, setManualUrl }) {
  if (serverType === 'bedrock') {
    if (!bedrockInfo) {
      return (
        <div style={{ color: 'var(--text-3)', fontSize: 13, padding: 40, textAlign: 'center' }}>
          <II name="loader" size={20}/> Pobieranie informacji o wersji...
        </div>
      );
    }

    const hasUrl = !!bedrockInfo.download_url;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(96,165,250,0.12)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <II name="layers" size={28}/>
        </div>
        {hasUrl ? (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Bedrock Server {bedrockInfo.version}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>Oficjalny serwer Mojang · Linux x64</div>
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }} className="mono">{bedrockInfo.download_url}</div>
            </div>
          </>
        ) : (
          <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Nie udało się pobrać linku automatycznie</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
                Pobierz ręcznie link .zip z{' '}
                <span className="mono" style={{ color: 'var(--text-2)' }}>minecraft.net/download/server/bedrock</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>URL .zip</label>
              <input
                className="input mono"
                style={{ fontSize: 12 }}
                placeholder="https://minecraft.azureedge.net/bin-linux/bedrock-server-x.x.x.x.zip"
                value={manualUrl}
                onChange={e => setManualUrl(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-1)', borderRadius: 8, fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <II name="info" size={13}/>
              Wejdź na stronę Minecraft, kliknij "Pobierz" i skopiuj link do pliku <span className="mono">.zip</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div>
      <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 0 }}>Wybierz wersję Paper MC:</p>
      {versions.length === 0 ? (
        <div style={{ color: 'var(--text-4)', fontSize: 13, padding: '20px 0' }}>Pobieranie listy wersji...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
          {versions.map(v => (
            <div key={v} onClick={() => setSelVersion(v)} style={{
              padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, textAlign: 'center',
              border: `1px solid ${selVersion === v ? 'var(--accent)' : 'var(--line-1)'}`,
              background: selVersion === v ? 'var(--accent-bg)' : 'transparent',
              color: selVersion === v ? 'var(--accent)' : 'var(--text-2)',
            }} className="mono">{v}</div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-1)', borderRadius: 8, fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <II name="info" size={13}/> Pobiera Paper MC z <span className="mono">papermc.io</span> · automatycznie akceptuje EULA
      </div>
    </div>
  );
}

function StepInstall({ progress }) {
  const phases = {
    pending:     { label: 'Oczekiwanie...',    icon: 'clock' },
    downloading: { label: 'Pobieranie...',     icon: 'download' },
    extracting:  { label: 'Rozpakowywanie...', icon: 'package' },
    setup:       { label: 'Konfiguracja...',   icon: 'settings' },
    done:        { label: 'Zainstalowano!',    icon: 'check-circle' },
    error:       { label: 'Błąd instalacji',   icon: 'alert-circle' },
  };
  const ph = phases[progress.phase] || phases.pending;
  const pct = Math.min(100, Math.round(progress.pct || 0));
  const isError = progress.phase === 'error';
  const isDone  = progress.phase === 'done';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 20 }}>
      <div style={{
        width: 72, height: 72, borderRadius: 18,
        background: isError ? 'rgba(248,113,113,0.12)' : isDone ? 'var(--accent-bg)' : 'var(--bg-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isError ? 'var(--danger)' : isDone ? 'var(--accent)' : 'var(--text-2)',
      }}>
        <II name={ph.icon} size={32}/>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{ph.label}</div>
        {isError && <div style={{ fontSize: 13, color: 'var(--danger)', marginTop: 6, maxWidth: 360 }}>{progress.error}</div>}
        {progress.phase === 'downloading' && pct > 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{pct}%</div>
        )}
      </div>
      <div style={{ width: '100%', height: 8, background: 'var(--bg-3)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4, transition: 'width 0.4s ease',
          background: isError ? 'var(--danger)' : 'var(--accent)',
          width: isDone ? '100%' : isError ? '100%' : `${pct}%`,
        }}/>
      </div>
      {!isError && !isDone && <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Nie zamykaj okna podczas instalacji</div>}
    </div>
  );
}

function StepDone({ onClose }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 16, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 18, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
        <II name="check-circle" size={36}/>
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Serwer zainstalowany!</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
          Serwer pojawił się w dashboardzie. Możesz go teraz uruchomić.
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={onClose}>
        <II name="arrow-right" size={14}/> Przejdź do dashboardu
      </button>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: 12 }}>
      <label style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

window.CraftInstaller = { InstallerModal };
