import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function PATCH(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { orderId, status } = await req.json()
  const order = await prisma.uniformOrder.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
    },
  })
  return NextResponse.json(order)
}
