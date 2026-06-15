'use client'

import { formatDate } from '@/lib/utils'

interface AttendanceRecord { id: string; date: string; status: string; notes?: string | null }

const statusStyle: Record<string, { bg: string; color: string; emoji: string }> = {
  PRESENT: { bg: 'rgba(34,197,94,0.15)', color: '#16a34a', emoji: '✓' },
  ABSENT: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', emoji: '✗' },
  LATE: { bg: 'rgba(249,115,22,0.15)', color: '#f97316', emoji: '⏰' },
  EXCUSED: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', emoji: '📋' },
}

export default function StudentAttendanceClient({
  attendance,
  stats,
}: {
  attendance: AttendanceRecord[]
  stats: { present: number; absent: number; late: number; total: number }
}) {
  const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem' }}>My Attendance</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Attendance Rate', value: `${pct}%`, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
          { label: 'Present', value: stats.present, color: '#16a34a', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Absent', value: stats.absent, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
          { label: 'Late', value: stats.late, color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '14px', padding: '1.25rem', border: `1px solid ${s.color}30` }}>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Overall Attendance</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: pct >= 75 ? '#16a34a' : '#ef4444' }}>{pct}%</span>
        </div>
        <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 75 ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#ef4444,#dc2626)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
        </div>
        {pct < 75 && <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#ef4444' }}>⚠️ Attendance below 75% — please attend more classes</p>}
      </div>

      {/* Records */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {attendance.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No attendance records yet</div>
        ) : (
          attendance.map((rec, i) => {
            const { bg, color, emoji } = statusStyle[rec.status] || statusStyle.PRESENT
            return (
              <div key={rec.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.875rem 1.25rem', borderBottom: i < attendance.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>{formatDate(rec.date)}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: bg, color }}>
                  {emoji} {rec.status}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
