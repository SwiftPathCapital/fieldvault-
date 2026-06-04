import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, CheckSquare, Square } from 'lucide-react';

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', due_date: '', priority: 'normal' });
  const [filter, setFilter] = useState('open');

  useEffect(() => {
    api.get('/todos').then(setTodos).finally(() => setLoading(false));
  }, []);

  const filtered = todos.filter(t => filter === 'all' ? true : filter === 'open' ? !t.is_done : t.is_done);

  const toggle = async (todo) => {
    const updated = await api.put(`/todos/${todo.id}`, { is_done: !todo.is_done });
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, ...updated } : t));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const body = { ...form };
    if (!body.due_date) delete body.due_date;
    const newTodo = await api.post('/todos', body);
    setTodos(prev => [newTodo, ...prev]);
    setShowAdd(false);
    setForm({ title: '', due_date: '', priority: 'normal' });
  };

  const deleteTodo = async (id) => {
    await api.del(`/todos/${id}`);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const priorityColor = { low: 'var(--text-3)', normal: 'var(--blue)', high: 'var(--red)' };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', marginBottom: '4px' }}>To-Do</h1>
          <p style={{ color: 'var(--text-2)' }}>{todos.filter(t => !t.is_done).length} open tasks</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: '#fff', padding: '10px 18px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '14px' }}
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px', width: 'fit-content' }}>
        {[['open', 'Open'], ['done', 'Completed'], ['all', 'All']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
              background: filter === val ? 'var(--bg-3)' : 'transparent',
              color: filter === val ? 'var(--text)' : 'var(--text-3)',
              transition: 'all 0.15s'
            }}
          >{label}</button>
        ))}
      </div>

      {/* Todo list */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
            {filter === 'open' ? 'All caught up! ✓' : 'No tasks here'}
          </div>
        ) : filtered.map((todo, idx) => (
          <div
            key={todo.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px 20px',
              borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              opacity: todo.is_done ? 0.5 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            <button onClick={() => toggle(todo)} style={{ background: 'transparent', color: todo.is_done ? 'var(--green)' : 'var(--border-light)', padding: 0, flexShrink: 0 }}>
              {todo.is_done ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, textDecoration: todo.is_done ? 'line-through' : 'none' }}>{todo.title}</div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '3px' }}>
                {todo.due_date && (
                  <span style={{ fontSize: '11px', color: new Date(todo.due_date) < new Date() && !todo.is_done ? 'var(--red)' : 'var(--text-3)' }}>
                    Due {new Date(todo.due_date).toLocaleDateString()}
                  </span>
                )}
                {todo.jobs?.title && <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>• {todo.jobs.title}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: priorityColor[todo.priority], textTransform: 'uppercase' }}>
                {todo.priority}
              </span>
              <button onClick={() => deleteTodo(todo.id)} style={{ background: 'transparent', color: 'var(--text-3)', padding: '4px', fontSize: '16px', lineHeight: 1 }}>×</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Todo Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '100%', maxWidth: '440px', animation: 'fadeIn 0.2s ease' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '18px' }}>Add Task</h2>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Task *</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="What needs to be done?" required autoFocus />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Due Date</label>
                  <input value={form.due_date} type="date" onChange={e => setForm(p => ({...p, due_date: e.target.value}))} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, background: 'var(--bg-3)', color: 'var(--text-2)', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, background: 'var(--accent)', color: '#fff', padding: '10px', borderRadius: 'var(--radius)', fontWeight: 600 }}>Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
