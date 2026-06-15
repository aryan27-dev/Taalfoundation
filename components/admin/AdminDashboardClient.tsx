'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  stats: {
    totalStudents: number
    pendingAmount: number
    pendingCount: number
    collectedThisMonth: number
    overdueCount: number
  }
  monthlyData: { month: string; amount: number }[]
  recentStudents: {
    id: string
    name: string
    email: string
    batch?: { name: string } | null
    fees: { amount: number; dueDate: string }[]
  }[]
  upcomingEvents: { id: string; title: string; eventDate: string; feeAmount: number }[]
  adminName: string
}

const card = {
  background: '#fff',
  borderRadius: '16px',
  padding: '1.5rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
}

export default function AdminDashboardClient({ stats, monthlyData, recentStudents, upcomingEvents }: Props) {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Welcome back — here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Active Students', value: stats.totalStudents.toString(), icon: '👥', color: '#3b82f6' },
          { label: 'Collected This Month', value: formatCurrency(stats.collectedThisMonth), icon: '✅', color: '#22c55e' },
          { label: 'Pending Fees', value: formatCurrency(stats.pendingAmount), icon: '⏳', color: '#f97316', sub: `${stats.pendingCount} students` },
          { label: 'Overdue Fees', value: stats.overdueCount.toString(), icon: '⚠️', color: '#ef4444', sub: 'Need attention' },
        ].map((s) => (
          <div key={s.label} style={{ ...card, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>{s.value}</p>
                {s.sub && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{s.sub}</p>}
              </div>
              <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart */}
        <div style={card}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 1.25rem' }}>Monthly Fee Collection</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" fontSize={12} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis fontSize={12} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), 'Collected']}
                contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}
              />
              <Bar dataKey="amount" fill="url(#grad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming events */}
        <div style={card}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 1rem' }}>Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No upcoming events</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingEvents.map((e) => (
                <div key={e.id} style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{e.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{formatDate(e.eventDate)} · {formatCurrency(e.feeAmount)}</p>
                </div>
              ))}
            </div>
          )}
          <a href="/admin/events" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: '#f97316', fontSize: '0.85rem', fontWeight: 600 }}>
            Manage Events →
          </a>
        </div>
      </div>

      {/* Recent students with pending fees */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Students with Pending Fees</h2>
          <a href="/admin/fees" style={{ color: '#f97316', fontSize: '0.85rem', fontWeight: 600 }}>View all →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              {['Student', 'Batch', 'Amount Due', 'Due Date', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentStudents.filter((s) => s.fees.length > 0).map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '0.75rem', fontWeight: 500, color: '#0f172a' }}>{s.name}</td>
                <td style={{ padding: '0.75rem', color: '#64748b' }}>{s.batch?.name || '—'}</td>
                <td style={{ padding: '0.75rem', color: '#f97316', fontWeight: 600 }}>{formatCurrency(s.fees[0]?.amount || 0)}</td>
                <td style={{ padding: '0.75rem', color: '#64748b' }}>{s.fees[0] ? formatDate(s.fees[0].dueDate) : '—'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <a href={`/admin/students/${s.id}`} style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600 }}>View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
