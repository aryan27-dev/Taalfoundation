import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendMail, feeReminderEmail } from '@/lib/mailer'
import { sendWhatsApp, feeReminderMessage } from '@/lib/whatsapp'
import { completeFeePayment } from '@/lib/payments'
import { format, endOfMonth } from 'date-fns'

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
  const studentId = searchParams.get('studentId')

  const fees = await prisma.fee.findMany({
    where: {
      ...(status && { status: status as 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED' }),
      ...(month && { month }),
      ...(studentId && { studentId }),
    },
    include: { student: { select: { id: true, name: true, email: true, batch: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(fees)
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const { action, feeId, waivedReason, paymentNote, studentId, amount, feeType, dueDate, month } = body

  if (action === 'waive') {
    if (!feeId) return NextResponse.json({ error: 'feeId required' }, { status: 400 })
    const fee = await prisma.fee.update({
      where: { id: feeId },
      data: { status: 'WAIVED', waivedReason },
    })
    return NextResponse.json(fee)
  }

  if (action === 'markPaid') {
    if (!feeId) return NextResponse.json({ error: 'feeId required' }, { status: 400 })
    const result = await completeFeePayment({
      feeId,
      paymentNote: paymentNote ? `Cash/UPI offline: ${paymentNote}` : 'Cash/UPI offline',
    })
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 404 })
    return NextResponse.json(result.fee)
  }

  if (action === 'createOneOff') {
    if (!studentId || !amount) return NextResponse.json({ error: 'studentId and amount required' }, { status: 400 })
    const fee = await prisma.fee.create({
      data: {
        studentId,
        amount: Number(amount),
        dueDate: dueDate ? new Date(dueDate) : endOfMonth(new Date()),
        feeType: feeType || 'OTHER',
        month: month || null,
        status: 'PENDING',
      },
      include: { student: { select: { id: true, name: true, email: true, batch: true } } },
    })
    return NextResponse.json(fee, { status: 201 })
  }

  if (action === 'generate') {
    const monthStr = format(new Date(), 'yyyy-MM')
    const due = endOfMonth(new Date())

    const students = await prisma.user.findMany({
      where: { isActive: true, role: 'STUDENT' },
      include: { feeStructure: true },
    })

    const created: string[] = []
    for (const student of students) {
      if (!student.feeStructure) continue
      const existing = await prisma.fee.findFirst({ where: { studentId: student.id, month: monthStr } })
      if (!existing) {
        await prisma.fee.create({
          data: {
            studentId: student.id,
            amount: student.feeStructure.currentAmount,
            dueDate: due,
            feeType: 'MONTHLY',
            month: monthStr,
            status: 'PENDING',
          },
        })
        created.push(student.id)
      }
    }
    return NextResponse.json({ created: created.length })
  }

  if (action === 'remind') {
    const overdue = await prisma.fee.findMany({
      where: { status: { in: ['PENDING', 'OVERDUE'] } },
      include: { student: true },
    })

    let sent = 0
    for (const fee of overdue) {
      try {
        const dueDateStr = new Date(fee.dueDate).toLocaleDateString('en-IN')
        const monthLabel = fee.month || 'this month'

        const { subject, html } = feeReminderEmail(fee.student.name, fee.amount, dueDateStr, monthLabel)
        await sendMail({ to: fee.student.email, subject, html })

        if (fee.student.phone) {
          await sendWhatsApp(fee.student.phone, feeReminderMessage(fee.student.name, fee.amount, dueDateStr, monthLabel))
        }

        sent++
      } catch { /* continue */ }
    }
    return NextResponse.json({ sent })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
