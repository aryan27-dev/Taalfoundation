import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateTempPassword } from '@/lib/utils'
import { sendMail, welcomeEmail } from '@/lib/mailer'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      batch: true,
      feeStructure: true,
      fees: { orderBy: { createdAt: 'desc' } },
      attendances: { orderBy: { date: 'desc' }, take: 90 },
      uniformOrders: { include: { items: { include: { item: true } } }, orderBy: { orderedAt: 'desc' } },
      eventRegs: { include: { event: true }, orderBy: { registeredAt: 'desc' } },
    },
  })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  return NextResponse.json(student)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      phone: body.phone,
      batchId: body.batchId || null,
      parentName: body.parentName,
      parentPhone: body.parentPhone,
      address: body.address,
      isActive: body.isActive,
      ...(body.dateOfBirth && { dateOfBirth: new Date(body.dateOfBirth) }),
      ...(body.feeAmount && {
        feeStructure: {
          update: { currentAmount: Number(body.feeAmount) },
        },
      }),
    },
    include: { batch: true, feeStructure: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.user.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}

// Reset password — POST to /api/admin/students/[id]?action=reset-password
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  const student = await prisma.user.findUnique({ where: { id } })
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const tempPassword = generateTempPassword()
  const hash = await bcrypt.hash(tempPassword, 12)
  await prisma.user.update({ where: { id }, data: { passwordHash: hash, mustResetPass: true } })

  try {
    const { subject, html } = welcomeEmail(student.name, student.email, tempPassword)
    await sendMail({ to: student.email, subject, html })
  } catch { /* ignore */ }

  return NextResponse.json({ success: true, tempPassword })
}
