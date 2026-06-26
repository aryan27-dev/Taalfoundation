import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminDashboardPage() {
  const session = await auth()

  const currentMonth = format(new Date(), 'yyyy-MM')

  const [totalStudents, pendingFees, collectedThisMonth, overdueCount, recentStudents, upcomingEvents, recentPayments] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
    prisma.fee.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true }, _count: true }),
    prisma.fee.aggregate({ where: { status: 'PAID', month: currentMonth }, _sum: { amount: true } }),
    prisma.fee.count({ where: { status: 'OVERDUE' } }),
    prisma.user.findMany({
      where: { role: 'STUDENT', isActive: true },
      include: { batch: true, fees: { where: { status: 'PENDING' }, take: 1, orderBy: { dueDate: 'asc' } } },
      orderBy: { joinDate: 'desc' },
      take: 5,
    }),
    prisma.event.findMany({
      where: { eventDate: { gte: new Date() } },
      orderBy: { eventDate: 'asc' },
      take: 3,
    }),
    prisma.fee.findMany({
      where: { status: 'PAID' },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { paidDate: 'desc' },
      take: 10,
    }),
  ])

  // Monthly collection trend (last 6 months)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const m = format(d, 'yyyy-MM')
    const agg = await prisma.fee.aggregate({ where: { status: 'PAID', month: m }, _sum: { amount: true } })
    monthlyData.push({ month: format(d, 'MMM yy'), amount: agg._sum.amount || 0 })
  }

  return (
    <AdminDashboardClient
      stats={{
        totalStudents,
        pendingAmount: pendingFees._sum.amount || 0,
        pendingCount: pendingFees._count,
        collectedThisMonth: collectedThisMonth._sum.amount || 0,
        overdueCount,
      }}
      monthlyData={monthlyData}
      recentStudents={JSON.parse(JSON.stringify(recentStudents))}
      upcomingEvents={JSON.parse(JSON.stringify(upcomingEvents))}
      recentPayments={JSON.parse(JSON.stringify(recentPayments))}
      adminName={session!.user.name}
    />
  )
}
