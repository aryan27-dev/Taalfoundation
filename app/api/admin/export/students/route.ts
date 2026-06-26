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

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: { batch: true, feeStructure: true },
    orderBy: { name: 'asc' },
  })

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Students')
  ws.addRow(['Name', 'Email', 'Phone', 'Batch', 'Monthly Fee', 'Parent Name', 'Parent Phone', 'Address', 'Status', 'Joined'])
  ws.getRow(1).font = { bold: true }

  for (const s of students) {
    ws.addRow([
      s.name, s.email, s.phone || '', s.batch?.name || '', s.feeStructure?.currentAmount || '',
      s.parentName || '', s.parentPhone || '', s.address || '', s.isActive ? 'Active' : 'Inactive',
      s.joinDate.toISOString().split('T')[0],
    ])
  }

  const buf = await wb.xlsx.writeBuffer()
  return excelResponse(Buffer.from(buf), `students-${new Date().toISOString().split('T')[0]}.xlsx`)
}
