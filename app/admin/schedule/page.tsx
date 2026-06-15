import { prisma } from '@/lib/prisma'
import ScheduleClient from '@/components/admin/ScheduleClient'

export default async function AdminSchedulePage() {
  const [schedules, batches] = await Promise.all([
    prisma.classSchedule.findMany({ orderBy: { startTime: 'asc' } }),
    prisma.batch.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])
  return <ScheduleClient schedules={JSON.parse(JSON.stringify(schedules))} batches={JSON.parse(JSON.stringify(batches))} />
}
