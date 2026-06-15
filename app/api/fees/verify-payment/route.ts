import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { sendMail, paymentConfirmationEmail } from '@/lib/mailer'
import { sendWhatsApp, paymentConfirmMessage } from '@/lib/whatsapp'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, feeId } = await req.json()

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  if (!isValid) return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })

  const fee = await prisma.fee.update({
    where: { id: feeId },
    data: {
      status: 'PAID',
      paidDate: new Date(),
      razorpayPaymentId,
    },
    include: { student: true },
  })

  try {
    const { subject, html } = paymentConfirmationEmail(fee.student.name, fee.amount, razorpayPaymentId)
    await sendMail({ to: fee.student.email, subject, html })
  } catch { /* ignore */ }

  // WhatsApp payment confirmation
  if (fee.student.phone) {
    try {
      await sendWhatsApp(fee.student.phone, paymentConfirmMessage(fee.student.name, fee.amount, razorpayPaymentId))
    } catch { /* ignore */ }
  }

  await prisma.notification.create({
    data: {
      userId: fee.studentId,
      title: 'Payment Confirmed',
      message: `Your payment of ₹${fee.amount} has been received.`,
      type: 'PAYMENT',
    },
  })

  return NextResponse.json({ success: true, fee })
}
