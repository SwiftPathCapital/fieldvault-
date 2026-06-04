import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Plus, Search, Briefcase } from 'lucide-react';

const STATUSES = ['new', 'estimate_sent', 'approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'cancelled'];
const SERVICE_TYPES = ['spray_foam', 'blown_in', 'fireproofing', 'foundation', 'home_inspection', 'moisture_remediation', 'other'];

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ client_id: '', title: '', service_type: 'spray_foam', status: 'new', assigned_to: '', job_address: '', job_city: '', job_state: 'LA', square_footage: '', estimated_value: '', scheduled_date: '', follow_up_date: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/jobs'), api.get('/clients'), api.get('/users')])
      .then(([j, c, u]) => { setJobs(j); setClients(c); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    const clientName = `${j.clients?.first_name || ''} ${j.clients?.last_name || ''}`.toLowerCase();
    const matchSearch = !search || j.title?.toLowerCase().includes(search.toLowerCase()) || clientName.includes(search.toLowerCase());
    const matchStatus = !statusFilter || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form };
      if (!body.square_footage) delete body.square_footage;
      if (!body.estimated_value) delete body.estimated_value;
      if (!body.scheduled_date) delete body.scheduled_date;
      if (!body.follow_up_date) delete body.follow_up_date;
      if (!body.assigned_to) delete body.assigned_to;
      const newJob = await api.post('/jobs', body);
      setJobs(prev => [newJob, ...prev]);
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>Jobs</h1>
          <p style={{ color: 'var(--text-2)' }}>{jobs.length} total jobs</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#fff', padding: '10px 18px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '14px' }}
        >
          <Plus size={16} /> New Job
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs or clients..." style={{ paddingLeft: '36px' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '180px' }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
      </div>

      {/* Jobs Table */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Job', 'Client', 'Assigned', 'Service', 'Scheduled', 'Value', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                <Briefcase size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                No jobs found
              </td></tr>
            ) : filtered.map(job => (
              <tr
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{job.title}</div>
                  {job.job_city && <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{job.job_city}, {job.job_state}</div>}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-2)' }}>
                  {job.clients?.first_name} {job.clients?.last_name}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-2)' }}>
                  {job.users ? `${job.users.first_name} ${job.users.last_name}` : <span style={{ color: 'var(--text-3)' }}>—</span>}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-2)', textTransform: 'capitalize' }}>
                  {job.service_type?.replace(/_/g, ' ')}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-2)' }}>
                  {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : '—'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-2)' }}>
                  {job.estimated_value ? `$${Number(job.estimated_value).toLocaleString()}` : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span className={`badge badge-${job.status}`}>{job.status.replace(/_/g, ' ')}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Job Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '100%', maxWidth: '540px', animation: 'fadeIn 0.2s ease', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '18px' }}>New Job</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Client *</label>
                <select value={form.client_id} onChange={e => setForm(p => ({...p, client_id: e.target.value}))} required>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Job Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Attic Spray Foam - New Orleans" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Assign To</label>
                <select value={form.assigned_to} onChange={e => setForm(p => ({...p, assigned_to: e.target.value}))}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Service Type *</label>
                  <select value={form.service_type} onChange={e => setForm(p => ({...p, service_type: e.target.value}))}>
                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Job Address</label>
                <input value={form.job_address} onChange={e => setForm(p => ({...p, job_address: e.target.value}))} placeholder="Street address of job site" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>City</label>
                  <input value={form.job_city} onChange={e => setForm(p => ({...p, job_city: e.target.value}))} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Sq Ft</label>
                  <input value={form.square_footage} type="number" onChange={e => setForm(p => ({...p, square_footage: e.target.value}))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Estimated Value ($)</label>
                  <input value={form.estimated_value} type="number" onChange={e => setForm(p => ({...p, estimated_value: e.target.value}))} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Scheduled Date</label>
                  <input value={form.scheduled_date} type="date" onChange={e => setForm(p => ({...p, scheduled_date: e.target.value}))} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Follow-up Date</label>
                <input value={form.follow_up_date} type="date" onChange={e => setForm(p => ({...p, follow_up_date: e.target.value}))} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, background: 'var(--bg-3)', color: 'var(--text-2)', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ flex: 1, background: 'var(--accent)', color: '#fff', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>
                  {saving ? 'Saving...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
