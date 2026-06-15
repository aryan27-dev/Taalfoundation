import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { password } = await req.json()
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hash, mustResetPass: false },
  })

  return NextResponse.json({ success: true })
}
