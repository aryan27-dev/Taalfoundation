import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { completeFeePayment } from '@/lib/payments'
import { verifyRazorpaySignature } from '@/lib/razorpay'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, feeId } = await req.json()

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  if (!isValid) return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })

  const result = await completeFeePayment({ feeId, razorpayPaymentId })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 404 })

  return NextResponse.json({ success: true, fee: result.fee })
}
