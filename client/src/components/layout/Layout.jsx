import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Briefcase, Calendar,
  CheckSquare, LogOut, Settings, Shield
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/todos', icon: CheckSquare, label: 'To-Do' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        minWidth: '220px',
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'var(--accent)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', flexShrink: 0
            }}>⚡</div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '18px'
            }}>FieldVault</span>
          </div>
          {user?.tenants && (
            <div style={{
              marginTop: '8px',
              fontSize: '11px',
              color: 'var(--text-3)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>{user.tenants.name}</div>
          )}
          {user?.role === 'superadmin' && (
            <div style={{ marginTop: '4px' }}>
              <span className="badge badge-approved" style={{ fontSize: '10px', padding: '2px 8px' }}>
                Super Admin
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: 'var(--radius)',
                color: isActive ? 'var(--accent)' : 'var(--text-2)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '14px',
                transition: 'all 0.15s'
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}

          {/* Admin section */}
          {(user?.role === 'superadmin' || user?.role === 'admin') && (
            <>
              <div style={{ margin: '12px 0 4px', padding: '0 12px', fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Admin
              </div>
              <NavLink
                to="/settings/users"
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: 'var(--radius)',
                  color: isActive ? 'var(--accent)' : 'var(--text-2)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  fontWeight: isActive ? 600 : 400, fontSize: '14px', transition: 'all 0.15s'
                })}
              >
                <Settings size={16} />
                Team & Settings
              </NavLink>
            </>
          )}

          {user?.role === 'superadmin' && (
            <NavLink
              to="/superadmin"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: 'var(--radius)',
                color: isActive ? 'var(--accent)' : 'var(--text-2)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                fontWeight: isActive ? 600 : 400, fontSize: '14px', transition: 'all 0.15s'
              })}
            >
              <Shield size={16} />
              All Tenants
            </NavLink>
          )}
        </nav>

        {/* User footer */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'var(--bg-3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--accent)',
            flexShrink: 0
          }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: 'var(--text-3)',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s'
            }}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: '220px',
        padding: '32px',
        minHeight: '100vh',
        maxWidth: 'calc(100vw - 220px)'
      }}>
        {children}
      </main>
    </div>
  );
}
