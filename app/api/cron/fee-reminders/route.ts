import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail, feeReminderEmail } from '@/lib/mailer'
import { sendWhatsApp, feeReminderMessage } from '@/lib/whatsapp'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const overdue = await prisma.fee.findMany({
    where: { status: { in: ['PENDING', 'OVERDUE'] } },
    include: { student: true },
  })

  // Mark old pending fees as overdue
  const now = new Date()
  const overdueIds = overdue.filter((f) => new Date(f.dueDate) < now && f.status === 'PENDING').map((f) => f.id)
  if (overdueIds.length > 0) {
    await prisma.fee.updateMany({ where: { id: { in: overdueIds } }, data: { status: 'OVERDUE' } })
  }

  let sent = 0
  for (const fee of overdue) {
    try {
      const dueDateStr = new Date(fee.dueDate).toLocaleDateString('en-IN')
      const month = fee.month || 'this period'

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

  return NextResponse.json({ sent, markedOverdue: overdueIds.length })
}
