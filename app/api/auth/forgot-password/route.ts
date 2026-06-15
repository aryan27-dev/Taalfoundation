import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail, otpEmail } from '@/lib/mailer'
import { generateOTP } from '@/lib/utils'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'No account found with this email' }, { status: 404 })

  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  // Invalidate previous tokens
  await prisma.passwordResetToken.updateMany({
    where: { email, used: false },
    data: { used: true },
  })

  await prisma.passwordResetToken.create({ data: { email, otp, expiresAt } })

  const { subject, html } = otpEmail(user.name, otp)
  await sendMail({ to: email, subject, html })

  return NextResponse.json({ success: true })
}
