import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'
import { excelResponse } from '@/lib/excel'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const batchId = searchParams.get('batchId')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 })

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', batchId, isActive: true },
    orderBy: { name: 'asc' },
  })

  const dateFilter: { gte?: Date; lte?: Date } = {}
  if (from) dateFilter.gte = new Date(from)
  if (to) dateFilter.lte = new Date(to)

  const records = await prisma.attendance.findMany({
    where: {
      batchId,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    },
    orderBy: { date: 'asc' },
  })

  const dates = [...new Set(records.map((r) => r.date.toISOString().split('T')[0]))].sort()
  const recordMap = new Map(records.map((r) => [`${r.studentId}-${r.date.toISOString().split('T')[0]}`, r.status]))

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Attendance')
  ws.addRow(['Student', ...dates, 'Present %'])
  ws.getRow(1).font = { bold: true }

  for (const student of students) {
    let present = 0
    const row: (string | number)[] = [student.name]
    for (const d of dates) {
      const status = recordMap.get(`${student.id}-${d}`) || ''
      row.push(status)
      if (status === 'PRESENT' || status === 'LATE') present++
    }
    const pct = dates.length > 0 ? Math.round((present / dates.length) * 100) : 0
    row.push(`${pct}%`)
    ws.addRow(row)
  }

  const buf = await wb.xlsx.writeBuffer()
  return excelResponse(Buffer.from(buf), `attendance-${batchId}-${new Date().toISOString().split('T')[0]}.xlsx`)
}
