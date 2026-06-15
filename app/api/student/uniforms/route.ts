import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [catalog, orders] = await Promise.all([
    prisma.uniformItem.findMany({ where: { isAvailable: true }, orderBy: { name: 'asc' } }),
    prisma.uniformOrder.findMany({
      where: { studentId: session.user.id },
      include: { items: { include: { item: true } } },
      orderBy: { orderedAt: 'desc' },
    }),
  ])

  return NextResponse.json({ catalog, orders })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items } = await req.json()
  // items: [{ itemId, size, quantity }]

  if (!items?.length) return NextResponse.json({ error: 'Items required' }, { status: 400 })

  const itemDetails = await prisma.uniformItem.findMany({
    where: { id: { in: items.map((i: { itemId: string }) => i.itemId) } },
  })

  const totalAmount = items.reduce((sum: number, item: { itemId: string; size: string; quantity: number }) => {
    const detail = itemDetails.find((d) => d.id === item.itemId)
    return sum + (detail?.price || 0) * item.quantity
  }, 0)

  const order = await prisma.uniformOrder.create({
    data: {
      studentId: session.user.id,
      totalAmount,
      status: 'PENDING',
      items: {
        create: items.map((item: { itemId: string; size: string; quantity: number }) => {
          const detail = itemDetails.find((d) => d.id === item.itemId)!
          return { itemId: item.itemId, size: item.size, quantity: item.quantity, price: detail.price }
        }),
      },
    },
    include: { items: { include: { item: true } } },
  })

  return NextResponse.json(order, { status: 201 })
}
