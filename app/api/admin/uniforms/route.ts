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

  const existing = await prisma.uniformOrder.findUnique({
    where: { id: orderId },
    include: { items: true },
  })
  if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const order = await prisma.uniformOrder.update({
    where: { id: orderId },
    data: {
      status,
      ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
    },
  })

  if (status === 'CONFIRMED' && existing.status === 'PENDING') {
    for (const item of existing.items) {
      await prisma.uniformItem.update({
        where: { id: item.itemId },
        data: { stock: { decrement: item.quantity } },
      })
    }
  }

  if (status === 'CANCELLED' && existing.status === 'CONFIRMED') {
    for (const item of existing.items) {
      await prisma.uniformItem.update({
        where: { id: item.itemId },
        data: { stock: { increment: item.quantity } },
      })
    }
  }

  return NextResponse.json(order)
}
