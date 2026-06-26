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

export async function PATCH(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const item = await prisma.uniformItem.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: Number(data.price) }),
      ...(data.sizes && { sizes: data.sizes }),
      ...(data.category && { category: data.category }),
      ...(data.stock !== undefined && { stock: Number(data.stock) }),
      ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
    },
  })
  return NextResponse.json(item)
}

export async function DELETE(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await prisma.uniformItem.update({ where: { id }, data: { isAvailable: false } })
  return NextResponse.json({ success: true })
}
