import { prisma } from '@/lib/prisma'
import EventsClient from '@/components/admin/EventsClient'

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: {
      registrations: { include: { student: { select: { id: true, name: true, email: true } } } },
      _count: { select: { registrations: true, fees: true } },
    },
    orderBy: { eventDate: 'desc' },
  })
  return <EventsClient events={JSON.parse(JSON.stringify(events))} />
}
