import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, Search, Phone, Mail, MapPin } from 'lucide-react';

const STATUS_OPTIONS = ['lead', 'estimate', 'active', 'completed', 'lost'];
const SOURCE_OPTIONS = ['website', 'referral', 'google', 'yelp', 'facebook', 'door_knock', 'repeat', 'other'];

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', state: 'LA', zip: '', source: '', status: 'lead' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/clients').then(setClients).finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c => {
    const name = `${c.first_name} ${c.last_name}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || c.phone?.includes(search) || c.email?.includes(search);
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newClient = await api.post('/clients', form);
      setClients(prev => [newClient, ...prev]);
      setShowAdd(false);
      setForm({ first_name: '', last_name: '', email: '', phone: '', address: '', city: '', state: 'LA', zip: '', source: '', status: 'lead' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>Clients</h1>
          <p style={{ color: 'var(--text-2)' }}>{clients.length} total clients</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--accent)', color: '#fff',
            padding: '10px 18px', borderRadius: 'var(--radius)',
            fontWeight: 600, fontSize: '14px'
          }}
        >
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, email..."
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '160px' }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Phone', 'Email', 'Location', 'Source', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>No clients found</td></tr>
            ) : filtered.map(client => (
              <tr
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{client.first_name} {client.last_name}</div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-2)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} />{client.phone || '—'}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-2)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={12} />{client.email || '—'}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-2)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={12} />{[client.city, client.state].filter(Boolean).join(', ') || '—'}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-2)', fontSize: '13px', textTransform: 'capitalize' }}>
                  {client.source || '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span className={`badge badge-${client.status}`}>{client.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Client Modal */}
      {showAdd && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '24px'
        }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '32px',
            width: '100%', maxWidth: '520px', animation: 'fadeIn 0.2s ease'
          }}>
            <h2 style={{ marginBottom: '24px', fontSize: '18px' }}>Add New Client</h2>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="504-555-0100" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Email</label>
                  <input value={form.email} type="email" onChange={e => setForm(p => ({...p, email: e.target.value}))} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Address</label>
                <input value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>City</label>
                  <input value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>State</label>
                  <input value={form.state} onChange={e => setForm(p => ({...p, state: e.target.value}))} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>ZIP</label>
                  <input value={form.zip} onChange={e => setForm(p => ({...p, zip: e.target.value}))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Source</label>
                  <select value={form.source} onChange={e => setForm(p => ({...p, source: e.target.value}))}>
                    <option value="">Select source</option>
                    {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, background: 'var(--bg-3)', color: 'var(--text-2)', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, background: 'var(--accent)', color: '#fff', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>
                  {saving ? 'Saving...' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
