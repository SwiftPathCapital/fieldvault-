import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Briefcase, Users, CheckSquare, Calendar, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div style={{
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-2)', fontSize: '13px', fontWeight: 500 }}>{label}</span>
      <div style={{
        width: '36px', height: '36px',
        background: `rgba(${color}, 0.12)`,
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={16} color={`rgb(${color})`} />
      </div>
    </div>
    <div>
      <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>{sub}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [todos, setTodos] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jobs'),
      api.get('/clients'),
      api.get('/todos?is_done=false'),
      api.get(`/calendar?start=${new Date().toISOString()}&end=${new Date(Date.now() + 7 * 86400000).toISOString()}`)
    ]).then(([j, c, t, e]) => {
      setJobs(j);
      setClients(c);
      setTodos(t);
      setEvents(e);
    }).finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter(j => ['scheduled', 'in_progress', 'approved'].includes(j.status));
  const newLeads = clients.filter(c => c.status === 'lead');
  const overdueJobs = jobs.filter(j => j.follow_up_date && new Date(j.follow_up_date) < new Date() && j.status !== 'completed');

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: 'var(--text-3)' }}>Loading...</div>
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.first_name} 👋
        </h1>
        <p style={{ color: 'var(--text-2)' }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Active Jobs" value={activeJobs.length} icon={Briefcase} color="249,115,22" sub="In progress or scheduled" />
        <StatCard label="Total Clients" value={clients.length} icon={Users} color="59,130,246" sub={`${newLeads.length} new leads`} />
        <StatCard label="Open To-Dos" value={todos.length} icon={CheckSquare} color="34,197,94" sub="Across all jobs" />
        <StatCard label="Upcoming Events" value={events.length} icon={Calendar} color="168,85,247" sub="Next 7 days" />
      </div>

      {/* Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Recent Jobs */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px' }}>Recent Jobs</h3>
            <button onClick={() => navigate('/jobs')} style={{ background: 'transparent', color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>
              View all →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {jobs.slice(0, 5).map(job => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-3)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  transition: 'border 0.15s',
                  border: '1px solid transparent'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{job.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                    {job.clients?.first_name} {job.clients?.last_name}
                  </div>
                </div>
                <span className={`badge badge-${job.status}`}>{job.status.replace('_', ' ')}</span>
              </div>
            ))}
            {jobs.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No jobs yet</div>}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Overdue Follow-ups */}
          {overdueJobs.length > 0 && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertCircle size={15} color="var(--red)" />
                <h3 style={{ fontSize: '14px', color: 'var(--red)' }}>Overdue Follow-ups ({overdueJobs.length})</h3>
              </div>
              {overdueJobs.slice(0, 3).map(job => (
                <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                  style={{ fontSize: '13px', padding: '6px 0', cursor: 'pointer', color: 'var(--text)' }}>
                  • {job.title}
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Events */}
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px' }}>Upcoming</h3>
              <button onClick={() => navigate('/calendar')} style={{ background: 'transparent', color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>
                Calendar →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {events.slice(0, 4).map(ev => (
                <div key={ev.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', background: 'var(--bg-3)', borderRadius: 'var(--radius)'
                }}>
                  <div style={{
                    width: '36px', minWidth: '36px', height: '36px',
                    background: 'var(--accent-dim)',
                    borderRadius: '8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                      {format(new Date(ev.start_time), 'd')}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--accent)', textTransform: 'uppercase' }}>
                      {format(new Date(ev.start_time), 'MMM')}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{ev.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                      {format(new Date(ev.start_time), 'h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
              {events.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nothing scheduled this week</div>}
            </div>
          </div>

          {/* Todos */}
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px' }}>Open To-Dos</h3>
              <button onClick={() => navigate('/todos')} style={{ background: 'transparent', color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>
                View all →
              </button>
            </div>
            {todos.slice(0, 4).map(todo => (
              <div key={todo.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 0',
                borderBottom: '1px solid var(--border)'
              }}>
                <div style={{
                  width: '16px', height: '16px',
                  border: '2px solid var(--border-light)',
                  borderRadius: '4px', flexShrink: 0
                }} />
                <div style={{ flex: 1, fontSize: '13px' }}>{todo.title}</div>
                {todo.priority === 'high' && (
                  <span style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 700 }}>HIGH</span>
                )}
              </div>
            ))}
            {todos.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: '13px', textAlign: 'center', padding: '12px' }}>All caught up ✓</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
