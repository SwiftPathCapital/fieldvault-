import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, Building2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SuperAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', phone: '', email: '', address: '' });

  useEffect(() => {
    if (user?.role !== 'superadmin') { navigate('/dashboard'); return; }
    api.get('/tenants').then(setTenants).finally(() => setLoading(false));
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const t = await api.post('/tenants', form);
    setTenants(prev => [...prev, t]);
    setShowAdd(false);
    setForm({ name: '', slug: '', phone: '', email: '', address: '' });
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '26px' }}>All Tenants</h1>
            <span className="badge badge-approved">Super Admin</span>
          </div>
          <p style={{ color: 'var(--text-2)' }}>Manage all organizations on FieldVault</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#fff', padding: '10px 18px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '14px' }}
        >
          <Plus size={16} /> Add Tenant
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-3)', padding: '40px' }}>Loading...</div>
        ) : tenants.map(t => (
          <div
            key={t.id}
            style={{
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '24px',
              cursor: 'pointer', transition: 'border-color 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px',
                  background: 'var(--accent-dim)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Building2 size={20} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>/{t.slug}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {t.phone && <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>📞 {t.phone}</div>}
              {t.email && <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>✉️ {t.email}</div>}
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-3)' }}>
              Created {new Date(t.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {showAdd && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '100%', maxWidth: '440px', animation: 'fadeIn 0.2s ease' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '18px' }}>Add New Tenant</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Company Name *</label>
                <input value={form.name} onChange={e => { setForm(p => ({...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})); }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Slug *</label>
                <input value={form.slug} onChange={e => setForm(p => ({...p, slug: e.target.value}))} required placeholder="company-name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Email</label>
                  <input value={form.email} type="email" onChange={e => setForm(p => ({...p, email: e.target.value}))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, background: 'var(--bg-3)', color: 'var(--text-2)', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, background: 'var(--accent)', color: '#fff', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>Create Tenant</button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
