import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { razorpay } from '@/lib/razorpay'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { feeId } = await req.json()
  if (!feeId) return NextResponse.json({ error: 'feeId required' }, { status: 400 })

  const fee = await prisma.fee.findUnique({ where: { id: feeId } })
  if (!fee) return NextResponse.json({ error: 'Fee not found' }, { status: 404 })
  if (fee.studentId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (fee.status === 'PAID') return NextResponse.json({ error: 'Already paid' }, { status: 400 })

  const order = await razorpay.orders.create({
    amount: Math.round(fee.amount * 100),
    currency: 'INR',
    receipt: fee.id,
    notes: { feeId: fee.id, studentId: fee.studentId },
  })

  await prisma.fee.update({ where: { id: feeId }, data: { razorpayOrderId: order.id } })

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  })
}
