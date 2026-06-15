import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      batch: true,
      feeStructure: true,
      fees: { orderBy: { createdAt: 'desc' }, take: 20 },
      attendances: { orderBy: { date: 'desc' }, take: 30 },
      uniformOrders: { include: { items: { include: { item: true } } }, orderBy: { orderedAt: 'desc' } },
    },
  })
  if (!student) notFound()

  const present = student.attendances.filter((a) => a.status === 'PRESENT').length
  const pct = student.attendances.length > 0 ? Math.round((present / student.attendances.length) * 100) : 0

  const statusStyle: Record<string, { bg: string; color: string }> = {
    PAID: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
    PENDING: { bg: 'rgba(249,115,22,0.1)', color: '#f97316' },
    OVERDUE: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    WAIVED: { bg: 'rgba(148,163,184,0.15)', color: '#64748b' },
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/students" style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>← Back to Students</Link>
      </div>

      {/* Header */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {student.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{student.name}</h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '999px', background: student.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: student.isActive ? '#16a34a' : '#64748b' }}>
              {student.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p style={{ margin: '2px 0', color: '#64748b', fontSize: '0.9rem' }}>{student.email} {student.phone && `· ${student.phone}`}</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Batch: {student.batch?.name || '—'} · Joined {formatDate(student.joinDate)}
            {student.feeStructure && ` · Monthly Fee: ${formatCurrency(student.feeStructure.currentAmount)}`}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Fees */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Recent Fees</h2>
          {student.fees.slice(0, 8).map((fee) => {
            const { bg, color } = statusStyle[fee.status] || { bg: '#f1f5f9', color: '#374151' }
            return (
              <div key={fee.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f8fafc', fontSize: '0.875rem' }}>
                <span style={{ color: '#475569' }}>{fee.month || fee.feeType}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(fee.amount)}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 6px', borderRadius: '999px', background: bg, color }}>{fee.status}</span>
                </div>
              </div>
            )
          })}
          {student.fees.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No fees yet</p>}
        </div>

        {/* Attendance */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Attendance</h2>
          <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#64748b' }}>{pct}% ({present}/{student.attendances.length} classes)</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {student.attendances.map((a) => (
              <div key={a.id} title={`${formatDate(a.date)} - ${a.status}`} style={{
                width: '18px', height: '18px', borderRadius: '4px',
                background: a.status === 'PRESENT' ? '#22c55e' : a.status === 'LATE' ? '#f97316' : a.status === 'EXCUSED' ? '#3b82f6' : '#ef4444',
              }} />
            ))}
          </div>
        </div>

        {/* Parent info */}
        {(student.parentName || student.address) && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Parent / Contact</h2>
            {[{ label: 'Parent', value: student.parentName }, { label: 'Parent Phone', value: student.parentPhone }, { label: 'Address', value: student.address }].map(({ label, value }) =>
              value ? (
                <div key={label} style={{ marginBottom: '0.5rem' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ margin: '2px 0 0', color: '#0f172a', fontSize: '0.9rem' }}>{value}</p>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  )
}
