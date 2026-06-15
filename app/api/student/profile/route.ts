import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { batch: true, feeStructure: true },
    omit: { passwordHash: true },
  })

  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone, address, parentName, parentPhone, profilePhoto } = await req.json()

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { phone, address, parentName, parentPhone, profilePhoto },
    include: { batch: true, feeStructure: true },
  })

  return NextResponse.json(updated)
}
