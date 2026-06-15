'use client'

import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  user: {
    name: string; email: string; joinDate: string; profilePhoto?: string | null
    batch?: { name: string; schedule: string } | null
    feeStructure?: { currentAmount: number } | null
  } | null
  pendingFee: { id: string; amount: number; dueDate: string; status: string; month?: string } | null
  upcomingEvents: { id: string; title: string; eventDate: string; feeAmount: number; registrations: { studentId: string }[] }[]
  announcements: { id: string; title: string; content: string; createdAt: string }[]
  attendanceStats: { present: number; total: number }
}

export default function StudentDashboardClient({ user, pendingFee, upcomingEvents, announcements, attendanceStats }: Props) {
  const attendancePct = attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>{user?.batch?.name || 'No batch assigned'}</p>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Fee status */}
        <div style={{
          background: pendingFee ? 'linear-gradient(135deg,#fef3c7,#fff7ed)' : 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
          borderRadius: '16px', padding: '1.25rem',
          border: `1px solid ${pendingFee ? '#fbbf24' : '#86efac'}`,
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 600, color: pendingFee ? '#92400e' : '#166534', textTransform: 'uppercase' }}>Fee Status</p>
          <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: pendingFee ? '#f97316' : '#16a34a' }}>
            {pendingFee ? formatCurrency(pendingFee.amount) : '✓ Paid'}
          </p>
          {pendingFee && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#92400e' }}>Due {formatDate(pendingFee.dueDate)}</p>}
        </div>

        {/* Attendance */}
        <div style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: '16px', padding: '1.25rem', border: '1px solid #93c5fd' }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 600, color: '#1d4ed8', textTransform: 'uppercase' }}>This Month</p>
          <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#1d4ed8' }}>{attendancePct}%</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#93c5fd' }}>{attendanceStats.present}/{attendanceStats.total} classes</p>
        </div>

        {/* Monthly fee */}
        <div style={{ background: 'linear-gradient(135deg,#faf5ff,#f3e8ff)', borderRadius: '16px', padding: '1.25rem', border: '1px solid #d8b4fe' }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 600, color: '#7e22ce', textTransform: 'uppercase' }}>Monthly Fee</p>
          <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#7e22ce' }}>
            {user?.feeStructure ? formatCurrency(user.feeStructure.currentAmount) : '—'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#c4b5fd' }}>per month</p>
        </div>
      </div>

      {/* Pay fee banner */}
      {pendingFee && (
        <div style={{
          background: 'linear-gradient(135deg,#f97316,#fbbf24)',
          borderRadius: '16px', padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
              Fee due: {formatCurrency(pendingFee.amount)} {pendingFee.month ? `for ${pendingFee.month}` : ''}
            </p>
            <p style={{ margin: '2px 0 0', color: 'rgba(15,23,42,0.65)', fontSize: '0.875rem' }}>Due on {formatDate(pendingFee.dueDate)}</p>
          </div>
          <Link href="/student/fees" style={{
            padding: '0.625rem 1.5rem', background: '#0f172a', color: '#fbbf24',
            borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
          }}>Pay Now →</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Upcoming events */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Upcoming Events</h2>
            <Link href="/student/events" style={{ fontSize: '0.8rem', color: '#f97316', fontWeight: 600 }}>View all →</Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No upcoming events</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingEvents.map((ev) => (
                <div key={ev.id} style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{ev.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {formatDate(ev.eventDate)} · {ev.feeAmount > 0 ? formatCurrency(ev.feeAmount) : 'Free'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent announcements */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Latest Notices</h2>
            <Link href="/student/announcements" style={{ fontSize: '0.8rem', color: '#f97316', fontWeight: 600 }}>View all →</Link>
          </div>
          {announcements.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No announcements</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {announcements.map((ann) => (
                <div key={ann.id} style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{ann.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{formatDate(ann.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Class schedule */}
        {user?.batch && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>My Class Schedule</h2>
            <div style={{ padding: '1rem', background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', borderRadius: '10px' }}>
              <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{user.batch.name}</p>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>{user.batch.schedule}</p>
            </div>
            <Link href="/student/schedule" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: '#f97316', fontSize: '0.85rem', fontWeight: 600 }}>
              View full schedule →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
