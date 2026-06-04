import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';

const EVENT_COLORS = {
  appointment: 'var(--blue)',
  estimate: 'var(--yellow)',
  job: 'var(--accent)',
  follow_up: 'var(--green)',
  other: 'var(--text-3)'
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', start_time: '', end_time: '', event_type: 'appointment', assigned_to: '' });

  useEffect(() => {
    api.get('/users').then(setUsers);
  }, []);

  useEffect(() => {
    const start = startOfMonth(currentDate).toISOString();
    const end = endOfMonth(currentDate).toISOString();
    api.get(`/calendar?start=${start}&end=${end}`).then(setEvents).finally(() => setLoading(false));
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (d) => events.filter(e => isSameDay(new Date(e.start_time), d));

  const handleAdd = async (e) => {
    e.preventDefault();
    const body = { ...form };
    if (!body.assigned_to) delete body.assigned_to;
    const newEvent = await api.post('/calendar', body);
    setEvents(prev => [...prev, newEvent]);
    setShowAdd(false);
    setForm({ title: '', description: '', start_time: '', end_time: '', event_type: 'appointment', assigned_to: '' });
  };

  const openAddForDate = (d) => {
    const dateStr = format(d, "yyyy-MM-dd'T'09:00");
    setForm(p => ({ ...p, start_time: dateStr }));
    setShowAdd(true);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '26px' }}>Calendar</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', display: 'flex', color: 'var(--text-2)' }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', minWidth: '160px', textAlign: 'center' }}>
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', display: 'flex', color: 'var(--text-2)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setCurrentDate(new Date())} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-2)', padding: '8px 14px', borderRadius: 'var(--radius)', fontSize: '13px', fontWeight: 600 }}>
            Today
          </button>
          <button
            onClick={() => setShowAdd(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '14px' }}
          >
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ padding: '10px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((d, i) => {
            const dayEvents = getEventsForDay(d);
            const isCurrentMonth = isSameMonth(d, currentDate);
            const isT = isToday(d);

            return (
              <div
                key={i}
                onClick={() => openAddForDate(d)}
                style={{
                  minHeight: '100px',
                  padding: '8px',
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: i < days.length - 7 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  opacity: isCurrentMonth ? 1 : 0.35,
                  transition: 'background 0.15s',
                  background: isT ? 'rgba(249,115,22,0.04)' : 'transparent'
                }}
                onMouseEnter={e => e.currentTarget.style.background = isT ? 'rgba(249,115,22,0.08)' : 'var(--bg-3)'}
                onMouseLeave={e => e.currentTarget.style.background = isT ? 'rgba(249,115,22,0.04)' : 'transparent'}
              >
                <div style={{
                  width: '26px', height: '26px',
                  borderRadius: '50%',
                  background: isT ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: isT ? 700 : 400,
                  color: isT ? '#fff' : isCurrentMonth ? 'var(--text)' : 'var(--text-3)',
                  marginBottom: '4px'
                }}>
                  {format(d, 'd')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {dayEvents.slice(0, 3).map(ev => (
                    <div key={ev.id} style={{
                      fontSize: '11px', fontWeight: 500,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: `${EVENT_COLORS[ev.event_type]}22`,
                      color: EVENT_COLORS[ev.event_type],
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {format(new Date(ev.start_time), 'h:mma')} {ev.title}
                      {ev.users && <span style={{ opacity: 0.7 }}> · {ev.users.first_name}</span>}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: '10px', color: 'var(--text-3)', padding: '0 4px' }}>+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '100%', maxWidth: '440px', animation: 'fadeIn 0.2s ease' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '18px' }}>Add Event</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required autoFocus />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Type</label>
                <select value={form.event_type} onChange={e => setForm(p => ({...p, event_type: e.target.value}))}>
                  {Object.keys(EVENT_COLORS).map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Start *</label>
                  <input value={form.start_time} type="datetime-local" onChange={e => setForm(p => ({...p, start_time: e.target.value}))} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>End</label>
                  <input value={form.end_time} type="datetime-local" onChange={e => setForm(p => ({...p, end_time: e.target.value}))} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Assign To</label>
                <select value={form.assigned_to} onChange={e => setForm(p => ({...p, assigned_to: e.target.value}))}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Notes</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, background: 'var(--bg-3)', color: 'var(--text-2)', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, background: 'var(--accent)', color: '#fff', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
