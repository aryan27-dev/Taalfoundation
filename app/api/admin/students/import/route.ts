import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { buildStudentTemplateWorkbook, parseStudentImportWorkbook, createStudentRecord, excelResponse } from '@/lib/excel'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  if (searchParams.get('template') === '1') {
    const buffer = await buildStudentTemplateWorkbook()
    return excelResponse(buffer, 'student-import-template.xlsx')
  }
  return NextResponse.json({ error: 'Use ?template=1 to download template' }, { status: 400 })
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const { rows, errors } = await parseStudentImportWorkbook(buffer)

  let created = 0
  for (const row of rows) {
    try {
      await createStudentRecord(row)
      created++
    } catch (e) {
      errors.push({ row: row.rowNum, reason: e instanceof Error ? e.message : 'Failed to create' })
    }
  }

  return NextResponse.json({ created, skipped: errors.length, errors })
}
