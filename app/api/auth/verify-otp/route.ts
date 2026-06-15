import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { email, otp, newPassword } = await req.json()
  if (!email || !otp || !newPassword) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const token = await prisma.passwordResetToken.findFirst({
    where: { email, otp, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })

  if (!token) return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { email }, data: { passwordHash: hash, mustResetPass: false } })
  await prisma.passwordResetToken.update({ where: { id: token.id }, data: { used: true } })

  return NextResponse.json({ success: true })
}
