import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export default async function StudentSchedulePage() {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session!.user.id }, include: { batch: true } })

  const schedules = await prisma.classSchedule.findMany({
    where: {
      OR: [{ batchId: null }, ...(user?.batchId ? [{ batchId: user.batchId }] : [])],
    },
    orderBy: { startTime: 'asc' },
  })

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>Class Schedule</h1>
      {user?.batch && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(249,115,22,0.1)', borderRadius: '999px', padding: '4px 12px', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f97316' }}>Batch: {user.batch.name}</span>
        </div>
      )}

      {user?.batch && (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>Regular Schedule</p>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>{user.batch.schedule}</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Instructor: {user.batch.instructor}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {schedules.map((s) => (
          <div key={s.id} style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{s.title}</h3>
                {s.description && <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: '#64748b' }}>{s.description}</p>}
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  {format(new Date(s.startTime), 'dd MMM, h:mm a')} → {format(new Date(s.endTime), 'h:mm a')}
                </p>
              </div>
              {s.isRecurring && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                  🔁 {s.recurrence}
                </span>
              )}
            </div>
          </div>
        ))}
        {schedules.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            No classes scheduled yet
          </div>
        )}
      </div>
    </div>
  )
}
