import { prisma } from '@/lib/prisma'
import StudentsClient from '@/components/admin/StudentsClient'

export default async function StudentsPage() {
  const [students, batches] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: { batch: true, feeStructure: true, fees: { where: { status: 'PENDING' }, take: 1, orderBy: { dueDate: 'asc' } } },
      orderBy: { name: 'asc' },
    }),
    prisma.batch.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])

  return <StudentsClient students={JSON.parse(JSON.stringify(students))} batches={JSON.parse(JSON.stringify(batches))} />
}
