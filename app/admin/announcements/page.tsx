import { prisma } from '@/lib/prisma'
import AnnouncementsClient from '@/components/admin/AnnouncementsClient'

export default async function AnnouncementsPage() {
  const [announcements, batches] = await Promise.all([
    prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.batch.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])
  return <AnnouncementsClient announcements={JSON.parse(JSON.stringify(announcements))} batches={JSON.parse(JSON.stringify(batches))} />
}
