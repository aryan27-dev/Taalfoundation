import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRazorpayWebhookSignature } from '@/lib/razorpay'
import { completeFeePayment } from '@/lib/payments'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')

  if (!signature || !verifyRazorpayWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity
    if (!payment) return NextResponse.json({ received: true })

    const fee = await prisma.fee.findFirst({
      where: { razorpayOrderId: payment.order_id },
    })

    if (fee) {
      await completeFeePayment({
        feeId: fee.id,
        razorpayPaymentId: payment.id,
      })
    }
  }

  return NextResponse.json({ received: true })
}
