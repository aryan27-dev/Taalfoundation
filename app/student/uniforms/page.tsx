import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StudentUniformsClient from '@/components/student/StudentUniformsClient'

export default async function StudentUniformsPage() {
  const session = await auth()
  const [catalog, orders] = await Promise.all([
    prisma.uniformItem.findMany({ where: { isAvailable: true }, orderBy: { name: 'asc' } }),
    prisma.uniformOrder.findMany({
      where: { studentId: session!.user.id },
      include: { items: { include: { item: true } } },
      orderBy: { orderedAt: 'desc' },
    }),
  ])
  return <StudentUniformsClient catalog={JSON.parse(JSON.stringify(catalog))} orders={JSON.parse(JSON.stringify(orders))} />
}
