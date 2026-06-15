import { prisma } from '@/lib/prisma'
import FeesClient from '@/components/admin/FeesClient'
import { format } from 'date-fns'

export default async function AdminFeesPage() {
  const currentMonth = format(new Date(), 'yyyy-MM')

  const [fees, summary] = await Promise.all([
    prisma.fee.findMany({
      include: { student: { select: { id: true, name: true, email: true, batch: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.fee.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: true,
    }),
  ])

  const collected = await prisma.fee.aggregate({ where: { status: 'PAID', month: currentMonth }, _sum: { amount: true } })

  return (
    <FeesClient
      fees={JSON.parse(JSON.stringify(fees))}
      summary={JSON.parse(JSON.stringify(summary))}
      collectedThisMonth={collected._sum.amount || 0}
    />
  )
}
