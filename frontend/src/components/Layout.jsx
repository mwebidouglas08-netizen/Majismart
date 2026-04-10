import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import {
  LayoutDashboard, Wifi, CreditCard, Bell, BarChart3,
  Settings, LogOut, Menu, X, Droplets, ChevronRight
} from 'lucide-react'

const nav = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/nodes',     icon: Wifi,            label: 'Nodes' },
  { to: '/app/payments',  icon: CreditCard,       label: 'Payments' },
  { to: '/app/alerts',    icon: Bell,             label: 'Alerts' },
  { to: '/app/analytics', icon: BarChart3,        label: 'Analytics' },
  { to: '/app/settings',  icon: Settings,         label: 'Settings' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#0c1a2e', color: 'white', display: 'flex',
        flexDirection: 'column', position: 'fixed', top: 0, left: open ? 0 : -240,
        height: '100vh', zIndex: 100, transition: 'left .25s',
        boxShadow: open ? '4px 0 20px rgba(0,0,0,.3)' : 'none'
      }} className="sidebar">
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'linear-gradient(135deg,#1a7fd4,#0d9e75)',
              borderRadius: 10, width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Droplets size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: .3 }}>MajiSmart</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: -2 }}>Water Intelligence</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                color: isActive ? 'white' : 'rgba(255,255,255,.55)',
                background: isActive ? 'rgba(26,127,212,.35)' : 'transparent',
                transition: 'all .15s', textDecoration: 'none'
              })}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 4, paddingLeft: 4 }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginBottom: 10, paddingLeft: 4 }}>
            {user?.role?.replace('_',' ')} • {user?.county || 'Kenya'}
          </div>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px',
              background: 'rgba(217,48,37,.15)', color: '#f28b82', border: 'none', borderRadius: 8,
              fontSize: 13, cursor: 'pointer' }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div onClick={() => setOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 99 }} />}

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 0, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          background: 'white', borderBottom: '1px solid var(--gray-200)',
          padding: '0 20px', height: 58, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button onClick={() => setOpen(!open)}
            style={{ background: 'none', border: 'none', padding: 6, borderRadius: 6, color: 'var(--gray-600)' }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg,#1a7fd4,#0d9e75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 13
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>{user?.name}</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px 20px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
