import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import StudentAttendanceClient from '@/components/student/StudentAttendanceClient'

export default async function StudentAttendancePage() {
  const session = await auth()
  const now = new Date()
  const attendance = await prisma.attendance.findMany({
    where: {
      studentId: session!.user.id,
      date: { gte: new Date(now.getFullYear(), now.getMonth() - 2, 1) },
    },
    orderBy: { date: 'desc' },
  })

  const present = attendance.filter((a) => a.status === 'PRESENT').length
  const absent = attendance.filter((a) => a.status === 'ABSENT').length
  const late = attendance.filter((a) => a.status === 'LATE').length

  return (
    <StudentAttendanceClient
      attendance={JSON.parse(JSON.stringify(attendance))}
      stats={{ present, absent, late, total: attendance.length }}
    />
  )
}
