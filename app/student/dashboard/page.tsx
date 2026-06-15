import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StudentDashboardClient from '@/components/student/StudentDashboardClient'

export default async function StudentDashboardPage() {
  const session = await auth()
  const userId = session!.user.id

  const [user, pendingFees, upcomingEvents, announcements, attendance] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { batch: true, feeStructure: true },
    }),
    prisma.fee.findMany({
      where: { studentId: userId, status: { in: ['PENDING', 'OVERDUE'] } },
      orderBy: { dueDate: 'asc' },
      take: 1,
    }),
    prisma.event.findMany({
      where: { eventDate: { gte: new Date() } },
      include: { registrations: { where: { studentId: userId } } },
      orderBy: { eventDate: 'asc' },
      take: 3,
    }),
    prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.attendance.findMany({
      where: {
        studentId: userId,
        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ])

  const present = attendance.filter((a) => a.status === 'PRESENT').length
  const total = attendance.length

  return (
    <StudentDashboardClient
      user={JSON.parse(JSON.stringify(user))}
      pendingFee={pendingFees[0] ? JSON.parse(JSON.stringify(pendingFees[0])) : null}
      upcomingEvents={JSON.parse(JSON.stringify(upcomingEvents))}
      announcements={JSON.parse(JSON.stringify(announcements))}
      attendanceStats={{ present, total }}
    />
  )
}
