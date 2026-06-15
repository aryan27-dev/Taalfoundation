import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export default async function StudentAnnouncementsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session!.user.id }, select: { batchId: true } })

  const announcements = await prisma.announcement.findMany({
    where: {
      isPublished: true,
      OR: [{ targetBatch: null }, ...(user?.batchId ? [{ targetBatch: user.batchId }] : [])],
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem' }}>Announcements</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {announcements.map((ann) => (
          <div key={ann.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{ann.title}</h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{formatDate(ann.createdAt)}</span>
            </div>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{ann.content}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            No announcements yet
          </div>
        )}
      </div>
    </div>
  )
}
