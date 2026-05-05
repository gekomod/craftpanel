// CraftPanel — User Management
const { useState, useEffect, useCallback } = React;
const { Icon } = window.CraftUI;

// ─── Change Password Modal ──────────────────────────────────────────────────
function ChangePasswordModal({ onClose, forceChange }) {
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPw !== form.confirm) { setError('Hasła nie są identyczne'); return; }
    if (form.newPw.length < 6) { setError('Hasło musi mieć min. 6 znaków'); return; }
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: form.current, new_password: form.newPw }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Błąd'); setLoading(false); return; }
      onClose(true);
    } catch { setError('Błąd sieci'); setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={!forceChange ? () => onClose(false) : undefined}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {forceChange ? 'Ustaw nowe hasło' : 'Zmiana hasła'}
          </h3>
          {!forceChange && <button className="modal-close" onClick={() => onClose(false)}><Icon name="x" size={18}/></button>}
        </div>
        {forceChange && (
          <div style={{ padding: '10px 20px', background: 'rgba(251,191,36,0.1)', borderBottom: '1px solid var(--line-1)', fontSize: 13, color: '#fbbf24' }}>
            Musisz zmienić domyślne hasło przed kontynuacją.
          </div>
        )}
        <form onSubmit={submit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Obecne hasło</label>
            <input className="input" type="password" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} autoFocus required/>
          </div>
          <div>
            <label className="form-label">Nowe hasło</label>
            <input className="input" type="password" value={form.newPw} onChange={e => setForm(f => ({ ...f, newPw: e.target.value }))} required/>
          </div>
          <div>
            <label className="form-label">Potwierdź nowe hasło</label>
            <input className="input" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required/>
          </div>
          {error && <div style={{ color: '#f87171', fontSize: 13 }}>{error}</div>}
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Zapisywanie...' : 'Zmień hasło'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Profile Modal ─────────────────────────────────────────────────────
function EditProfileModal({ user, onClose }) {
  const [form, setForm] = useState({ display_name: user.display_name || '', email: user.email || '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Błąd'); setLoading(false); return; }
      onClose(true);
    } catch { setError('Błąd sieci'); setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={() => onClose(false)}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edytuj profil</h3>
          <button className="modal-close" onClick={() => onClose(false)}><Icon name="x" size={18}/></button>
        </div>
        <form onSubmit={submit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Nazwa wyświetlana</label>
            <input className="input" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}/>
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}/>
          </div>
          {error && <div style={{ color: '#f87171', fontSize: 13 }}>{error}</div>}
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── User Form Modal (create/edit) ──────────────────────────────────────────
const ALL_PERMS = [
  { key: 'servers.view',    label: 'Widok serwerów' },
  { key: 'servers.manage',  label: 'Zarządzanie serwerami' },
  { key: 'console',         label: 'Konsola' },
  { key: 'files',           label: 'Pliki' },
  { key: 'backups',         label: 'Backupy' },
  { key: 'players',         label: 'Gracze' },
  { key: 'plugins',         label: 'Pluginy' },
  { key: 'settings',        label: 'Ustawienia serwera' },
];

function UserFormModal({ user, onClose }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    username: user?.username || '',
    display_name: user?.display_name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'user',
    permissions: user?.permissions || {},
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePerm = (key) => {
    setForm(f => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isEdit && form.password.length < 6) { setError('Hasło musi mieć min. 6 znaków'); return; }
    setLoading(true);
    setError('');
    try {
      const url = isEdit ? `/api/users/${user.id}` : '/api/users';
      const method = isEdit ? 'PUT' : 'POST';
      const body = { ...form };
      if (isEdit && !body.password) delete body.password;
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Błąd'); setLoading(false); return; }
      onClose(true);
    } catch { setError('Błąd sieci'); setLoading(false); }
  };

  const isAdmin = form.role === 'admin';

  return (
    <div className="modal-backdrop" onClick={() => onClose(false)}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edytuj użytkownika' : 'Nowy użytkownik'}</h3>
          <button className="modal-close" onClick={() => onClose(false)}><Icon name="x" size={18}/></button>
        </div>
        <form onSubmit={submit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Login *</label>
              <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required disabled={isEdit}/>
            </div>
            <div>
              <label className="form-label">Nazwa wyświetlana</label>
              <input className="input" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}/>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}/>
            </div>
            <div>
              <label className="form-label">{isEdit ? 'Nowe hasło (opcjonalnie)' : 'Hasło *'}</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!isEdit}/>
            </div>
          </div>
          <div>
            <label className="form-label">Rola</label>
            <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="user">Użytkownik</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          {!isAdmin && (
            <div>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Uprawnienia</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {ALL_PERMS.map(p => (
                  <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text-2)' }}>
                    <input type="checkbox" checked={!!form.permissions[p.key]} onChange={() => togglePerm(p.key)} style={{ accentColor: 'var(--accent)' }}/>
                    {p.label}
                  </label>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 6 }}>Administrator ma wszystkie uprawnienia automatycznie.</div>
            </div>
          )}
          {error && <div style={{ color: '#f87171', fontSize: 13 }}>{error}</div>}
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Zapisywanie...' : (isEdit ? 'Zapisz zmiany' : 'Utwórz użytkownika')}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Users Management Screen ────────────────────────────────────────────────
function UsersScreen({ currentUser, onProfileUpdate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | {user} | 'changepw' | 'profile'
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/users');
      if (r.ok) setUsers(await r.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteUser = async (id) => {
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      load();
    } catch {}
    setDeleteConfirm(null);
  };

  const roleColor = { admin: '#f59e0b', moderator: '#60a5fa', user: 'var(--text-3)' };
  const roleLabel = { admin: 'Administrator', moderator: 'Moderator', user: 'Użytkownik' };

  return (
    <div style={{ padding: 'var(--pad)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div className="h-eyebrow">Zarządzanie</div>
          <h1 className="title-display" style={{ fontSize: 32, margin: 0 }}>Użytkownicy</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setModal('profile')}>
            <Icon name="user" size={15}/> Mój profil
          </button>
          <button className="btn" onClick={() => setModal('changepw')}>
            <Icon name="lock" size={15}/> Zmień hasło
          </button>
          {currentUser?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setModal('create')}>
              <Icon name="plus" size={15}/> Nowy użytkownik
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-3)', padding: 40, textAlign: 'center' }}>Ładowanie...</div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line-1)' }}>
                {['Użytkownik', 'Email', 'Rola', 'Ostatnie logowanie', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--line-1)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500 }}>{u.display_name || u.username}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>@{u.username}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-2)' }}>{u.email || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: roleColor[u.role], background: roleColor[u.role] + '20', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-3)', fontSize: 13 }}>
                    {u.last_login ? new Date(u.last_login * 1000).toLocaleString('pl') : 'Nigdy'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {currentUser?.role === 'admin' && u.id !== currentUser.id && (
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-sm" onClick={() => setModal(u)}>
                          <Icon name="edit" size={13}/> Edytuj
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(u)}>
                          <Icon name="trash" size={13}/>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'create' && <UserFormModal onClose={ok => { setModal(null); if (ok) load(); }}/>}
      {modal && modal.id && <UserFormModal user={modal} onClose={ok => { setModal(null); if (ok) load(); }}/>}
      {modal === 'changepw' && <ChangePasswordModal onClose={() => setModal(null)}/>}
      {modal === 'profile' && currentUser && <EditProfileModal user={currentUser} onClose={ok => { setModal(null); if (ok && onProfileUpdate) onProfileUpdate(); }}/>}

      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Usuń użytkownika</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}><Icon name="x" size={18}/></button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>
                Czy na pewno chcesz usunąć użytkownika <strong>{deleteConfirm.username}</strong>? Tej operacji nie można cofnąć.
              </p>
            </div>
            <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Anuluj</button>
              <button className="btn btn-danger" onClick={() => deleteUser(deleteConfirm.id)}>Usuń</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.CraftUsers = { UsersScreen, ChangePasswordModal, EditProfileModal };
