import ExcelJS from 'exceljs'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateTempPassword } from '@/lib/utils'
import { sendMail, welcomeEmail } from '@/lib/mailer'
import { sendWhatsApp, welcomeMessage } from '@/lib/whatsapp'

export const STUDENT_IMPORT_HEADERS = [
  'name', 'email', 'phone', 'parentName', 'parentPhone', 'address', 'batchName', 'monthlyFee', 'dateOfBirth',
] as const

export type StudentImportRow = {
  name: string
  email: string
  phone?: string
  parentName?: string
  parentPhone?: string
  address?: string
  batchName?: string
  monthlyFee: number
  dateOfBirth?: string
}

export async function buildStudentTemplateWorkbook(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Students')
  ws.addRow([...STUDENT_IMPORT_HEADERS])
  ws.addRow(['Priya Sharma', 'priya@example.com', '9876543210', 'Ramesh Sharma', '9876543211', 'Pune', 'Beginner Batch', 1500, '2010-05-15'])
  ws.getRow(1).font = { bold: true }
  STUDENT_IMPORT_HEADERS.forEach((_, i) => { ws.getColumn(i + 1).width = 18 })
  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}

export async function parseStudentImportWorkbook(buffer: ArrayBuffer | Buffer): Promise<{ rows: (StudentImportRow & { rowNum: number })[]; errors: { row: number; reason: string }[] }> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buffer as unknown as ExcelJS.Buffer)
  const ws = wb.worksheets[0]
  if (!ws) return { rows: [], errors: [{ row: 0, reason: 'No worksheet found' }] }

  const headerRow = ws.getRow(1)
  const headers: string[] = []
  headerRow.eachCell((cell, col) => { headers[col - 1] = String(cell.value || '').trim().toLowerCase() })

  const rows: (StudentImportRow & { rowNum: number })[] = []
  const errors: { row: number; reason: string }[] = []

  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return
    const get = (key: string) => {
      const idx = headers.indexOf(key)
      if (idx < 0) return ''
      const val = row.getCell(idx + 1).value
      if (val == null) return ''
      if (typeof val === 'object' && 'text' in (val as object)) return String((val as { text: string }).text).trim()
      return String(val).trim()
    }

    const name = get('name')
    const email = get('email')
    const monthlyFee = Number(get('monthlyfee'))

    if (!name && !email) return

    if (!name || !email) {
      errors.push({ row: rowNum, reason: 'Name and email are required' })
      return
    }
    if (!monthlyFee || isNaN(monthlyFee)) {
      errors.push({ row: rowNum, reason: 'Valid monthlyFee is required' })
      return
    }

    rows.push({
      rowNum,
      name,
      email: email.toLowerCase(),
      phone: get('phone') || undefined,
      parentName: get('parentname') || undefined,
      parentPhone: get('parentphone') || undefined,
      address: get('address') || undefined,
      batchName: get('batchname') || undefined,
      monthlyFee,
      dateOfBirth: get('dateofbirth') || undefined,
    })
  })

  return { rows, errors }
}

export async function createStudentRecord(data: StudentImportRow, autoCreateBatch = true) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('Email already exists')

  let batchId: string | null = null
  if (data.batchName) {
    let batch = await prisma.batch.findFirst({ where: { name: { equals: data.batchName, mode: 'insensitive' } } })
    if (!batch && autoCreateBatch) {
      batch = await prisma.batch.create({
        data: { name: data.batchName, schedule: 'TBD', instructor: 'TBD', capacity: 30 },
      })
    }
    batchId = batch?.id || null
  }

  const tempPassword = generateTempPassword()
  const hash = await bcrypt.hash(tempPassword, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: hash,
      phone: data.phone,
      batchId,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      address: data.address,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      mustResetPass: true,
      role: 'STUDENT',
      feeStructure: {
        create: { baseAmount: data.monthlyFee, currentAmount: data.monthlyFee },
      },
    },
    include: { batch: true, feeStructure: true },
  })

  try {
    const { subject, html } = welcomeEmail(data.name, data.email, tempPassword)
    await sendMail({ to: data.email, subject, html })
  } catch { /* non-blocking */ }

  if (data.phone) {
    try {
      await sendWhatsApp(data.phone, welcomeMessage(data.name, data.email, tempPassword))
    } catch { /* non-blocking */ }
  }

  return user
}

export async function workbookToBuffer(wb: ExcelJS.Workbook): Promise<Buffer> {
  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}

export function excelResponse(buffer: Buffer, filename: string) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
