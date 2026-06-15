import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendMail, feeReminderEmail } from '@/lib/mailer'
import { sendWhatsApp, feeReminderMessage } from '@/lib/whatsapp'
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
  const { action, feeId, waivedReason } = await req.json()

  // Waive a fee
  if (action === 'waive') {
    if (!feeId) return NextResponse.json({ error: 'feeId required' }, { status: 400 })
    const fee = await prisma.fee.update({
      where: { id: feeId },
      data: { status: 'WAIVED', waivedReason },
    })
    return NextResponse.json(fee)
  }

  // Generate monthly fees manually
  if (action === 'generate') {
    const month = format(new Date(), 'yyyy-MM')
    const due = endOfMonth(new Date())

    const students = await prisma.user.findMany({
      where: { isActive: true, role: 'STUDENT' },
      include: { feeStructure: true },
    })

    const created: string[] = []
    for (const student of students) {
      if (!student.feeStructure) continue
      const existing = await prisma.fee.findFirst({ where: { studentId: student.id, month } })
      if (!existing) {
        await prisma.fee.create({
          data: {
            studentId: student.id,
            amount: student.feeStructure.currentAmount,
            dueDate: due,
            feeType: 'MONTHLY',
            month,
            status: 'PENDING',
          },
        })
        created.push(student.id)
      }
    }
    return NextResponse.json({ created: created.length })
  }

  // Send bulk reminders
  if (action === 'remind') {
    const overdue = await prisma.fee.findMany({
      where: { status: { in: ['PENDING', 'OVERDUE'] } },
      include: { student: true },
    })

    let sent = 0
    for (const fee of overdue) {
      try {
        const dueDateStr = new Date(fee.dueDate).toLocaleDateString('en-IN')
        const month = fee.month || 'this month'

        // Email
        const { subject, html } = feeReminderEmail(fee.student.name, fee.amount, dueDateStr, month)
        await sendMail({ to: fee.student.email, subject, html })

        // WhatsApp (if phone on file)
        if (fee.student.phone) {
          await sendWhatsApp(fee.student.phone, feeReminderMessage(fee.student.name, fee.amount, dueDateStr, month))
        }

        sent++
      } catch { /* continue */ }
    }
    return NextResponse.json({ sent })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
