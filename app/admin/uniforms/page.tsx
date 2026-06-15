import { prisma } from '@/lib/prisma'
import UniformsAdminClient from '@/components/admin/UniformsAdminClient'

export default async function UniformsAdminPage() {
  const [items, orders] = await Promise.all([
    prisma.uniformItem.findMany({ orderBy: { name: 'asc' } }),
    prisma.uniformOrder.findMany({
      include: {
        student: { select: { id: true, name: true, email: true } },
        items: { include: { item: true } },
      },
      orderBy: { orderedAt: 'desc' },
    }),
  ])
  return <UniformsAdminClient items={JSON.parse(JSON.stringify(items))} orders={JSON.parse(JSON.stringify(orders))} />
}
