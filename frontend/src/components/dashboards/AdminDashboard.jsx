import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wifi, CreditCard, Bell, Droplets, TrendingUp,
  Users, AlertTriangle, CheckCircle, Activity, Shield
} from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../api'

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [levels, setLevels] = useState([])
  const [alerts, setAlerts] = useState([])
  const [users, setUsers] = useState([])
  const [countyStats, setCountyStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/revenue-chart?days=7'),
      api.get('/dashboard/water-levels'),
      api.get('/alerts?resolved=false&limit=5'),
      api.get('/users'),
      api.get('/dashboard/county-stats'),
    ]).then(([s, r, l, a, u, c]) => {
      setSummary(s); setRevenue(r); setLevels(l)
      setAlerts(a); setUsers(u); setCountyStats(c)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Shield size={22} color="#1a5f9e" />
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a5f9e' }}>Admin Control Centre</h1>
        </div>
        <p style={{ color: '#5f6368', fontSize: 14 }}>Full system oversight — all nodes, counties, users and transactions</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Nodes',      value: summary?.nodes?.total || 0,       sub: `${summary?.nodes?.active||0} active`, icon: Wifi,        color: '#1a7fd4', bg: '#e8f4fd' },
          { label: 'Total Revenue',    value: `Ksh ${Number(summary?.payments?.total_revenue||0).toLocaleString()}`, sub: 'all time', icon: CreditCard, color: '#0d9e75', bg: '#e1f5ee' },
          { label: 'Litres Dispensed', value: `${Number(summary?.payments?.total_litres||0).toLocaleString()}L`,     sub: 'all time', icon: Droplets,  color: '#6f42c1', bg: '#f0e8fc' },
          { label: 'System Users',     value: users.length,                                                           sub: 'registered', icon: Users,    color: '#e8a020', bg: '#fef3d8' },
          { label: 'Open Alerts',      value: summary?.alerts?.open || 0,       sub: `${summary?.alerts?.critical||0} critical`, icon: Bell, color: '#d93025', bg: '#fce8e6' },
          { label: 'Today Revenue',    value: `Ksh ${Number(summary?.payments?.today_revenue||0).toLocaleString()}`, sub: 'today', icon: TrendingUp, color: '#0d6e56', bg: '#e1f5ee' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: '#5f6368', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#9aa0a6', marginTop: 2 }}>{s.sub}</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 18, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#1a5f9e' }}>Revenue — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={revenue} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => [`Ksh ${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#1a7fd4" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#1a5f9e' }}>County Performance</h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={countyStats} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="county" tick={{ fontSize: 10 }} width={65} />
              <Tooltip formatter={v => [`Ksh ${Number(v).toFixed(0)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#0d9e75" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts + Users + Node status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
        {/* Alerts */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><Bell size={15} color="#d93025" /> Active Alerts</h3>
            <Link to="/app/alerts" style={{ fontSize: 12, color: '#1a7fd4' }}>Manage all</Link>
          </div>
          {alerts.length === 0
            ? <div style={{ textAlign: 'center', color: '#9aa0a6', padding: '16px 0', fontSize: 13 }}><CheckCircle size={20} color="#0d9e75" style={{ display: 'block', margin: '0 auto 6px' }} /> All clear</div>
            : alerts.map(a => (
              <div key={a.id} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid #f1f3f4' }}>
                <AlertTriangle size={14} color={a.severity === 'critical' ? '#d93025' : '#e8a020'} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.node_name}</div>
                  <div style={{ fontSize: 11, color: '#5f6368' }}>{a.message}</div>
                </div>
                <span className={`badge badge-${a.severity === 'critical' ? 'critical' : 'warning'}`} style={{ fontSize: 10, flexShrink: 0 }}>{a.severity}</span>
              </div>
            ))}
        </div>

        {/* Recent users */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><Users size={15} color="#e8a020" /> System Users</h3>
            <Link to="/app/users" style={{ fontSize: 12, color: '#1a7fd4' }}>Manage</Link>
          </div>
          {users.slice(0, 5).map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid #f1f3f4' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8f4fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#1a7fd4', flexShrink: 0 }}>
                {u.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                <div style={{ fontSize: 11, color: '#9aa0a6' }}>{u.county || 'Kenya'}</div>
              </div>
              <span className={`badge badge-${u.role === 'admin' ? 'critical' : u.role === 'county_officer' ? 'active' : 'info'}`} style={{ fontSize: 10 }}>
                {u.role.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>

        {/* Node status grid */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}><Wifi size={15} color="#1a7fd4" /> Node Health</h3>
            <Link to="/app/nodes" style={{ fontSize: 12, color: '#1a7fd4' }}>All nodes</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Active',      val: summary?.nodes?.active || 0,  color: '#0d9e75', bg: '#e1f5ee' },
              { label: 'Warning',     val: summary?.nodes?.warning || 0, color: '#e8a020', bg: '#fef3d8' },
              { label: 'Offline',     val: summary?.nodes?.offline || 0, color: '#9aa0a6', bg: '#f1f3f4' },
              { label: 'Total',       val: summary?.nodes?.total || 0,   color: '#1a7fd4', bg: '#e8f4fd' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: s.color, opacity: .8 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {levels.slice(0, 4).map(n => (
            <div key={n.id} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: '#3c4043', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{n.name}</span>
                <span style={{ color: n.water_level < 20 ? '#d93025' : '#0d9e75', fontWeight: 600 }}>{n.water_level ?? '--'}%</span>
              </div>
              <div style={{ height: 5, background: '#f1f3f4', borderRadius: 99 }}>
                <div style={{ height: '100%', width: `${n.water_level || 0}%`, background: n.water_level < 20 ? '#d93025' : '#0d9e75', borderRadius: 99, transition: 'width 1s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
