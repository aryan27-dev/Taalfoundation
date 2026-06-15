import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const batchId = searchParams.get('batchId')

  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const [students, attendance] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'STUDENT', isActive: true, ...(batchId && { batchId }) },
      select: { id: true, name: true, batchId: true, batch: true },
      orderBy: { name: 'asc' },
    }),
    prisma.attendance.findMany({
      where: { date: { gte: dayStart, lte: dayEnd }, ...(batchId && { batchId }) },
    }),
  ])

  return NextResponse.json({ students, attendance })
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { records } = await req.json()
  // records: [{ studentId, batchId, date, status, notes }]

  const upserts = await Promise.all(
    records.map((r: { studentId: string; batchId: string; date: string; status: string; notes?: string }) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date: new Date(r.date) } },
        create: {
          studentId: r.studentId,
          batchId: r.batchId,
          date: new Date(r.date),
          status: r.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
          notes: r.notes,
        },
        update: {
          status: r.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
          notes: r.notes,
        },
      })
    )
  )

  return NextResponse.json({ saved: upserts.length })
}
