import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StudentEventsClient from '@/components/student/StudentEventsClient'

export default async function StudentEventsPage() {
  const session = await auth()
  const events = await prisma.event.findMany({
    where: { eventDate: { gte: new Date() } },
    include: {
      registrations: { where: { studentId: session!.user.id } },
      fees: { where: { studentId: session!.user.id } },
    },
    orderBy: { eventDate: 'asc' },
  })
  return <StudentEventsClient events={JSON.parse(JSON.stringify(events))} />
}
