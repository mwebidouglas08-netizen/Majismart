import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Wifi, CreditCard, Bell, TrendingUp, Droplets, AlertTriangle, CheckCircle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../api'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [levels, setLevels] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/revenue-chart?days=7'),
      api.get('/dashboard/water-levels'),
      api.get('/alerts?resolved=false&limit=5')
    ]).then(([s, r, l, a]) => {
      setSummary(s); setRevenue(r); setLevels(l); setAlerts(a)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  const statCards = [
    { label: 'Total Nodes',      value: summary?.nodes?.total || 0,        sub: `${summary?.nodes?.active||0} active`, icon: Wifi,        color: '#1a7fd4' },
    { label: 'Total Revenue',    value: `Ksh ${Number(summary?.payments?.total_revenue||0).toLocaleString()}`, sub: `${summary?.payments?.total_transactions||0} transactions`, icon: CreditCard, color: '#0d9e75' },
    { label: 'Litres Dispensed', value: `${Number(summary?.payments?.total_litres||0).toLocaleString()}L`, sub: 'all time', icon: Droplets, color: '#6f42c1' },
    { label: 'Open Alerts',      value: summary?.alerts?.open || 0,        sub: `${summary?.alerts?.critical||0} critical`, icon: Bell, color: '#d93025' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <LayoutDashboard size={24} color="#1a7fd4" /> Dashboard
        </h1>
        <p style={{ color: '#5f6368', marginTop: 4 }}>Real-time overview of Kenya's MajiSmart network</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16, marginBottom: 24 }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: '#5f6368', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#202124' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#9aa0a6', marginTop: 4 }}>{s.sub}</div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: s.color+'15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="#1a7fd4" /> Revenue (7 days)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`Ksh ${v}`, 'Revenue']} labelFormatter={l => `Date: ${l}`} />
              <Bar dataKey="revenue" fill="#1a7fd4" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={16} color="#0d9e75" /> Water Levels — Current
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {levels.slice(0,6).map(n => (
              <div key={n.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#3c4043' }}>{n.name}</span>
                  <span style={{ fontSize: 12, color: n.water_level < 20 ? '#d93025' : '#5f6368', fontWeight: n.water_level < 20 ? 700 : 400 }}>
                    {n.water_level ?? '--'}%
                  </span>
                </div>
                <div style={{ height: 6, background: '#f1f3f4', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: (n.water_level ?? 0)+'%', borderRadius: 99,
                    background: n.water_level < 20 ? '#d93025' : n.water_level < 40 ? '#e8a020' : '#0d9e75',
                    transition: 'width 1s'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts + Nodes row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={16} color="#d93025" /> Recent Alerts
            </h3>
            <Link to="/app/alerts" style={{ fontSize: 13, color: '#1a7fd4' }}>View all</Link>
          </div>
          {alerts.length === 0
            ? <div style={{ textAlign: 'center', color: '#9aa0a6', padding: '20px 0', fontSize: 14 }}>
                <CheckCircle size={24} color="#0d9e75" style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                No open alerts
              </div>
            : alerts.map(a => (
              <div key={a.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f1f3f4' }}>
                <AlertTriangle size={16} color={a.severity==='critical'?'#d93025':'#e8a020'} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{a.node_name}</div>
                  <div style={{ fontSize: 12, color: '#5f6368' }}>{a.message}</div>
                  <div style={{ fontSize: 11, color: '#9aa0a6', marginTop: 2 }}>{new Date(a.created_at).toLocaleString()}</div>
                </div>
                <span className={`badge badge-${a.severity==='critical'?'critical':'warning'}`} style={{ marginLeft: 'auto', height: 'fit-content', flexShrink: 0 }}>
                  {a.severity}
                </span>
              </div>
            ))}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wifi size={16} color="#1a7fd4" /> Node Overview
            </h3>
            <Link to="/app/nodes" style={{ fontSize: 13, color: '#1a7fd4' }}>Manage</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Active',      val: summary?.nodes?.active || 0,  color: '#0d9e75', bg: '#e1f5ee' },
              { label: 'Warning',     val: summary?.nodes?.warning || 0, color: '#e8a020', bg: '#fef3d8' },
              { label: 'Offline',     val: summary?.nodes?.offline || 0, color: '#9aa0a6', bg: '#f1f3f4' },
              { label: 'Total',       val: summary?.nodes?.total || 0,   color: '#1a7fd4', bg: '#e8f4fd' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 12, color: s.color, opacity: .8 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '12px 14px', background: '#f8f9fa', borderRadius: 8 }}>
            <div style={{ fontSize: 13, color: '#5f6368', marginBottom: 2 }}>Today's Revenue</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1a7fd4' }}>
              Ksh {Number(summary?.payments?.today_revenue || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
