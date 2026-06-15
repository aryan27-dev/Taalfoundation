import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const item = await prisma.uniformItem.create({
    data: {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      sizes: body.sizes,
      category: body.category,
      stock: Number(body.stock) || 0,
      isAvailable: true,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
