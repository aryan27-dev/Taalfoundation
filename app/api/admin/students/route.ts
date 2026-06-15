import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendMail, welcomeEmail } from '@/lib/mailer'
import { sendWhatsApp, welcomeMessage } from '@/lib/whatsapp'
import { generateTempPassword } from '@/lib/utils'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const batchId = searchParams.get('batchId') || undefined

  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      ...(batchId && { batchId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      batch: true,
      feeStructure: true,
      fees: { where: { status: 'PENDING' }, orderBy: { dueDate: 'desc' }, take: 1 },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(students)
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { name, email, phone, batchId, feeAmount, parentName, parentPhone, address, dateOfBirth } = body

  if (!name || !email || !feeAmount) {
    return NextResponse.json({ error: 'Name, email and fee amount are required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 })

  const tempPassword = generateTempPassword()
  const hash = await bcrypt.hash(tempPassword, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hash,
      phone,
      batchId: batchId || null,
      parentName,
      parentPhone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      mustResetPass: true,
      role: 'STUDENT',
      feeStructure: {
        create: {
          baseAmount: Number(feeAmount),
          currentAmount: Number(feeAmount),
        },
      },
    },
    include: { batch: true, feeStructure: true },
  })

  try {
    const { subject, html } = welcomeEmail(name, email, tempPassword)
    await sendMail({ to: email, subject, html })
  } catch { /* Email failure shouldn't block account creation */ }

  // WhatsApp welcome (if phone provided)
  if (phone) {
    try {
      await sendWhatsApp(phone, welcomeMessage(name, email, tempPassword))
    } catch { /* WhatsApp failure is non-blocking */ }
  }

  return NextResponse.json(user, { status: 201 })
}
