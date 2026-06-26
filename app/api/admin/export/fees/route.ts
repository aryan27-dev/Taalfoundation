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
  const status = searchParams.get('status')
  const month = searchParams.get('month')

  const fees = await prisma.fee.findMany({
    where: {
      ...(status && { status: status as 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED' }),
      ...(month && { month }),
    },
    include: { student: { select: { name: true, email: true, batch: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Fees')
  ws.addRow(['Student', 'Email', 'Batch', 'Month', 'Type', 'Amount', 'Due Date', 'Paid Date', 'Status', 'Payment Ref', 'Notes'])
  ws.getRow(1).font = { bold: true }

  for (const f of fees) {
    ws.addRow([
      f.student.name, f.student.email, f.student.batch?.name || '', f.month || '', f.feeType,
      f.amount, f.dueDate.toISOString().split('T')[0],
      f.paidDate?.toISOString().split('T')[0] || '', f.status,
      f.razorpayPaymentId || '', f.notes || f.waivedReason || '',
    ])
  }

  const buf = await wb.xlsx.writeBuffer()
  return excelResponse(Buffer.from(buf), `fees-${month || 'all'}-${new Date().toISOString().split('T')[0]}.xlsx`)
}
