import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const fee = await prisma.fee.findUnique({
    where: { id },
    include: { student: { include: { batch: true } } },
  })

  if (!fee) return NextResponse.json({ error: 'Fee not found' }, { status: 404 })
  if (fee.status !== 'PAID') return NextResponse.json({ error: 'Receipt only available for paid fees' }, { status: 400 })

  // Students can only download their own receipts; admins can download any
  if (session.user.role !== 'ADMIN' && fee.studentId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── Build PDF ─────────────────────────────────────────────────────────────
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const regular = await doc.embedFont(StandardFonts.Helvetica)

  const orange = rgb(0.976, 0.451, 0.086)
  const dark = rgb(0.059, 0.090, 0.165)
  const gray = rgb(0.392, 0.455, 0.545)
  const lightGray = rgb(0.969, 0.980, 0.992)
  const green = rgb(0.086, 0.643, 0.239)

  // Header background strip
  page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: dark })

  // Academy name
  page.drawText('Taal Foundation', { x: 40, y: height - 45, font: bold, size: 22, color: orange })
  page.drawText('Kathak Dance Academy', { x: 40, y: height - 65, font: regular, size: 11, color: rgb(0.8, 0.85, 0.9) })

  // RECEIPT label
  page.drawText('RECEIPT', { x: width - 130, y: height - 45, font: bold, size: 18, color: rgb(1, 1, 1) })
  page.drawText(`#${fee.id.slice(-8).toUpperCase()}`, { x: width - 130, y: height - 65, font: regular, size: 10, color: rgb(0.7, 0.75, 0.8) })

  // Paid stamp
  page.drawRectangle({ x: width - 115, y: height - 165, width: 90, height: 36, color: rgb(0.94, 0.99, 0.96), borderColor: green, borderWidth: 1.5, borderOpacity: 1 })
  page.drawText('✓  PAID', { x: width - 105, y: height - 152, font: bold, size: 14, color: green })

  // Student info section
  const infoTop = height - 130
  page.drawText('Billed To', { x: 40, y: infoTop, font: bold, size: 10, color: gray })
  page.drawText(fee.student.name, { x: 40, y: infoTop - 18, font: bold, size: 14, color: dark })
  page.drawText(fee.student.email, { x: 40, y: infoTop - 34, font: regular, size: 10, color: gray })
  if (fee.student.batch) {
    page.drawText(`Batch: ${fee.student.batch.name}`, { x: 40, y: infoTop - 48, font: regular, size: 10, color: gray })
  }

  // Payment info
  const paidDate = fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
  const dueDate = new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  page.drawText('Payment Date', { x: width - 200, y: infoTop, font: bold, size: 10, color: gray })
  page.drawText(paidDate, { x: width - 200, y: infoTop - 18, font: regular, size: 11, color: dark })
  page.drawText('Due Date', { x: width - 200, y: infoTop - 42, font: bold, size: 10, color: gray })
  page.drawText(dueDate, { x: width - 200, y: infoTop - 58, font: regular, size: 11, color: dark })

  // Divider
  page.drawLine({ start: { x: 40, y: height - 220 }, end: { x: width - 40, y: height - 220 }, thickness: 1, color: rgb(0.9, 0.92, 0.95) })

  // Table header
  const tableTop = height - 250
  page.drawRectangle({ x: 40, y: tableTop - 8, width: width - 80, height: 26, color: lightGray })
  page.drawText('Description', { x: 52, y: tableTop + 4, font: bold, size: 10, color: gray })
  page.drawText('Period', { x: 320, y: tableTop + 4, font: bold, size: 10, color: gray })
  page.drawText('Amount', { x: width - 110, y: tableTop + 4, font: bold, size: 10, color: gray })

  // Table row
  const feeLabel = fee.feeType === 'MONTHLY' ? 'Monthly Tuition Fee'
    : fee.feeType === 'ANNUAL_EVENT' ? 'Annual Event Fee'
    : fee.feeType === 'REGISTRATION' ? 'Event Registration Fee'
    : fee.feeType === 'UNIFORM' ? 'Uniform / Accessories'
    : 'Fee'

  page.drawText(feeLabel, { x: 52, y: tableTop - 22, font: regular, size: 11, color: dark })
  page.drawText(fee.month || '—', { x: 320, y: tableTop - 22, font: regular, size: 11, color: dark })
  page.drawText(`Rs. ${fee.amount.toLocaleString('en-IN')}`, { x: width - 130, y: tableTop - 22, font: bold, size: 11, color: dark })

  page.drawLine({ start: { x: 40, y: tableTop - 40 }, end: { x: width - 40, y: tableTop - 40 }, thickness: 0.5, color: rgb(0.9, 0.92, 0.95) })

  // Total box
  page.drawRectangle({ x: width - 220, y: tableTop - 100, width: 180, height: 50, color: dark })
  page.drawText('TOTAL PAID', { x: width - 210, y: tableTop - 72, font: bold, size: 9, color: rgb(0.7, 0.75, 0.85) })
  page.drawText(`Rs. ${fee.amount.toLocaleString('en-IN')}`, { x: width - 210, y: tableTop - 90, font: bold, size: 16, color: orange })

  // Payment reference
  if (fee.razorpayPaymentId) {
    page.drawText('Payment Reference', { x: 40, y: tableTop - 75, font: bold, size: 9, color: gray })
    page.drawText(fee.razorpayPaymentId, { x: 40, y: tableTop - 90, font: regular, size: 10, color: dark })
  }

  // Footer
  page.drawLine({ start: { x: 40, y: 80 }, end: { x: width - 40, y: 80 }, thickness: 1, color: rgb(0.9, 0.92, 0.95) })
  page.drawText('Thank you for your payment! Keep dancing. 🎭', { x: 40, y: 58, font: bold, size: 11, color: orange })
  page.drawText('Taal Foundation • Kathak Dance Academy', { x: 40, y: 40, font: regular, size: 9, color: gray })
  page.drawText(`Generated on ${new Date().toLocaleDateString('en-IN')}`, { x: width - 200, y: 40, font: regular, size: 9, color: gray })

  const pdfBytes = await doc.save()

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt-${fee.id.slice(-8).toUpperCase()}.pdf"`,
    },
  })
}
