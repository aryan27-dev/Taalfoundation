import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const schedules = await prisma.classSchedule.findMany({ orderBy: { startTime: 'asc' } })
  return NextResponse.json(schedules)
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const schedule = await prisma.classSchedule.create({ data: { ...body, startTime: new Date(body.startTime), endTime: new Date(body.endTime) } })
  return NextResponse.json(schedule, { status: 201 })
}

export async function PATCH(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, ...data } = await req.json()
  const schedule = await prisma.classSchedule.update({
    where: { id },
    data: {
      ...data,
      ...(data.startTime && { startTime: new Date(data.startTime) }),
      ...(data.endTime && { endTime: new Date(data.endTime) }),
    },
  })
  return NextResponse.json(schedule)
}

export async function DELETE(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await prisma.classSchedule.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
