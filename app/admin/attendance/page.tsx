import { prisma } from '@/lib/prisma'
import AttendanceClient from '@/components/admin/AttendanceClient'

export default async function AttendancePage() {
  const batches = await prisma.batch.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  return <AttendanceClient batches={JSON.parse(JSON.stringify(batches))} />
}
