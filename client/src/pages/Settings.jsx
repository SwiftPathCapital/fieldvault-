import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../lib/api';
import { Plus, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', phone: '', role: 'staff' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users').then(setUsers).finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const newUser = await api.post('/users', form);
      setUsers(prev => [...prev, newUser]);
      setShowAdd(false);
      setForm({ first_name: '', last_name: '', email: '', password: '', phone: '', role: 'staff' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    const updated = await api.put(`/users/${u.id}`, { is_active: !u.is_active });
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, ...updated } : x));
  };

  const roleColor = { superadmin: 'var(--accent)', admin: 'var(--blue)', staff: 'var(--text-3)' };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>Team & Settings</h1>
          <p style={{ color: 'var(--text-2)' }}>{users.length} team members</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#fff', padding: '10px 18px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '14px' }}
        >
          <Plus size={16} /> Add Team Member
        </button>
      </div>

      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Loading...</div>
        ) : users.map((u, idx) => (
          <div key={u.id} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '16px 20px',
            borderBottom: idx < users.length - 1 ? '1px solid var(--border)' : 'none',
            opacity: u.is_active ? 1 : 0.5
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--bg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '14px', color: 'var(--accent)', flexShrink: 0
            }}>
              {u.first_name?.[0]}{u.last_name?.[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{u.first_name} {u.last_name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{u.email}</div>
            </div>
            {u.phone && <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>{u.phone}</div>}
            <span style={{ fontSize: '12px', fontWeight: 700, color: roleColor[u.role], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {u.role}
            </span>
            {u.id !== user?.id && (
              <button
                onClick={() => toggleActive(u)}
                style={{ background: 'transparent', color: u.is_active ? 'var(--red)' : 'var(--green)', padding: '6px', borderRadius: '6px', display: 'flex' }}
                title={u.is_active ? 'Deactivate' : 'Reactivate'}
              >
                {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
              </button>
            )}
          </div>
        ))}
      </div>

      {showAdd && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '100%', maxWidth: '440px', animation: 'fadeIn 0.2s ease' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '18px' }}>Add Team Member</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>First Name *</label>
                  <input value={form.first_name} onChange={e => setForm(p => ({...p, first_name: e.target.value}))} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Last Name *</label>
                  <input value={form.last_name} onChange={e => setForm(p => ({...p, last_name: e.target.value}))} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Email *</label>
                <input value={form.email} type="email" onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Temp Password *</label>
                <input value={form.password} type="password" onChange={e => setForm(p => ({...p, password: e.target.value}))} required minLength={8} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Role</label>
                  <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              {error && <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', padding: '10px', color: 'var(--red)', fontSize: '13px' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, background: 'var(--bg-3)', color: 'var(--text-2)', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 1, background: 'var(--accent)', color: '#fff', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
