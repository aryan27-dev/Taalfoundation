import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail, annualIncrementEmail } from '@/lib/mailer'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const structures = await prisma.studentFeeStructure.findMany({
    include: { student: true },
  })

  let updated = 0
  for (const s of structures) {
    const newAmount = s.currentAmount + 100
    await prisma.studentFeeStructure.update({
      where: { id: s.id },
      data: { currentAmount: newAmount, incrementYear: s.incrementYear + 1 },
    })

    await prisma.notification.create({
      data: {
        userId: s.studentId,
        title: 'Annual Fee Revision',
        message: `Your monthly fee has been revised to ₹${newAmount} effective this year.`,
        type: 'FEE_UPDATE',
      },
    })

    try {
      const { subject, html } = annualIncrementEmail(s.student.name, newAmount)
      await sendMail({ to: s.student.email, subject, html })
    } catch { /* continue */ }

    updated++
  }

  return NextResponse.json({ updated, year: new Date().getFullYear() })
}
