import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const events = await prisma.event.findMany({
    where: { eventDate: { gte: new Date() } },
    include: {
      registrations: { where: { studentId: session.user.id } },
      fees: { where: { studentId: session.user.id } },
    },
    orderBy: { eventDate: 'asc' },
  })

  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { eventId } = await req.json()

  const existing = await prisma.eventRegistration.findUnique({
    where: { studentId_eventId: { studentId: session.user.id, eventId } },
  })
  if (existing) return NextResponse.json({ error: 'Already registered' }, { status: 409 })

  const reg = await prisma.eventRegistration.create({
    data: { studentId: session.user.id, eventId },
  })

  return NextResponse.json(reg, { status: 201 })
}
