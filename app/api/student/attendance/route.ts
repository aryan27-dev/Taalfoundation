import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // YYYY-MM

  let dateFilter = {}
  if (month) {
    const [y, m] = month.split('-').map(Number)
    dateFilter = { date: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) } }
  }

  const attendance = await prisma.attendance.findMany({
    where: { studentId: session.user.id, ...dateFilter },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(attendance)
}
