import { prisma } from '@/lib/prisma'
import { sendMail, paymentConfirmationEmail } from '@/lib/mailer'
import { sendWhatsApp, paymentConfirmMessage } from '@/lib/whatsapp'

type CompletePaymentOptions = {
  feeId: string
  razorpayPaymentId?: string
  paymentNote?: string
}

export async function completeFeePayment({ feeId, razorpayPaymentId, paymentNote }: CompletePaymentOptions) {
  const existing = await prisma.fee.findUnique({
    where: { id: feeId },
    include: { student: true },
  })

  if (!existing) return { ok: false as const, error: 'Fee not found' }
  if (existing.status === 'PAID') return { ok: true as const, fee: existing, alreadyPaid: true }

  const fee = await prisma.fee.update({
    where: { id: feeId },
    data: {
      status: 'PAID',
      paidDate: new Date(),
      ...(razorpayPaymentId && { razorpayPaymentId }),
      ...(paymentNote && { notes: paymentNote }),
    },
    include: { student: true },
  })

  const refId = razorpayPaymentId || paymentNote || 'OFFLINE'

  try {
    const { subject, html } = paymentConfirmationEmail(fee.student.name, fee.amount, refId)
    await sendMail({ to: fee.student.email, subject, html })
  } catch { /* non-blocking */ }

  if (fee.student.phone) {
    try {
      await sendWhatsApp(fee.student.phone, paymentConfirmMessage(fee.student.name, fee.amount, refId))
    } catch { /* non-blocking */ }
  }

  await prisma.notification.create({
    data: {
      userId: fee.studentId,
      title: 'Payment Confirmed',
      message: `Your payment of ₹${fee.amount} has been received.`,
      type: 'PAYMENT',
    },
  })

  return { ok: true as const, fee, alreadyPaid: false }
}
