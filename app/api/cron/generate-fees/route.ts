import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail, feeReminderEmail } from '@/lib/mailer'
import { format, endOfMonth } from 'date-fns'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const month = format(new Date(), 'yyyy-MM')
  const due = endOfMonth(new Date())

  const students = await prisma.user.findMany({
    where: { isActive: true, role: 'STUDENT' },
    include: { feeStructure: true },
  })

  let created = 0
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

      await prisma.notification.create({
        data: {
          userId: student.id,
          title: 'Monthly Fee Generated',
          message: `Your fee of ₹${student.feeStructure.currentAmount} for ${month} is due by ${due.toLocaleDateString('en-IN')}.`,
          type: 'FEE_REMINDER',
        },
      })

      try {
        const { subject, html } = feeReminderEmail(
          student.name,
          student.feeStructure.currentAmount,
          due.toLocaleDateString('en-IN'),
          month
        )
        await sendMail({ to: student.email, subject, html })
      } catch { /* continue */ }

      created++
    }
  }

  return NextResponse.json({ month, created })
}
