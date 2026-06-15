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
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(announcements)
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { title, content, targetBatch, isPublished } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  const ann = await prisma.announcement.create({
    data: { title, content, targetBatch: targetBatch || null, isPublished: isPublished !== false },
  })
  return NextResponse.json(ann, { status: 201 })
}

export async function PATCH(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, ...data } = await req.json()
  const ann = await prisma.announcement.update({ where: { id }, data })
  return NextResponse.json(ann)
}

export async function DELETE(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await prisma.announcement.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
