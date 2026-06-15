import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { endOfMonth } from 'date-fns'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const events = await prisma.event.findMany({
    include: {
      registrations: { include: { student: { select: { id: true, name: true, email: true } } } },
      _count: { select: { registrations: true, fees: true } },
    },
    orderBy: { eventDate: 'desc' },
  })

  return NextResponse.json(events)
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, description, eventDate, feeAmount, isOptional } = body

  if (!title || !eventDate) return NextResponse.json({ error: 'Title and date required' }, { status: 400 })

  const event = await prisma.event.create({
    data: {
      title,
      description,
      eventDate: new Date(eventDate),
      feeAmount: Number(feeAmount) || 0,
      isOptional: Boolean(isOptional),
    },
  })

  // Auto-generate fees for all active students if mandatory
  if (!isOptional && Number(feeAmount) > 0) {
    const students = await prisma.user.findMany({ where: { isActive: true, role: 'STUDENT' } })
    await prisma.fee.createMany({
      data: students.map((s) => ({
        studentId: s.id,
        amount: Number(feeAmount),
        dueDate: endOfMonth(new Date(eventDate)),
        feeType: 'ANNUAL_EVENT',
        eventId: event.id,
        status: 'PENDING',
      })),
    })
  }

  return NextResponse.json(event, { status: 201 })
}

export async function PATCH(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const event = await prisma.event.update({ where: { id }, data })
  return NextResponse.json(event)
}

export async function DELETE(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await prisma.event.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
