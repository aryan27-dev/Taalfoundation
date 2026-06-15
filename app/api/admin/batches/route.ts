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
  const batches = await prisma.batch.findMany({ include: { _count: { select: { students: true } } }, orderBy: { name: 'asc' } })
  return NextResponse.json(batches)
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, schedule, instructor, capacity } = await req.json()
  if (!name || !schedule || !instructor) return NextResponse.json({ error: 'Name, schedule and instructor required' }, { status: 400 })
  const batch = await prisma.batch.create({ data: { name, schedule, instructor, capacity: capacity || 20 } })
  return NextResponse.json(batch, { status: 201 })
}

export async function PATCH(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, ...data } = await req.json()
  const batch = await prisma.batch.update({ where: { id }, data })
  return NextResponse.json(batch)
}

export async function DELETE(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await prisma.batch.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
