import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Admin ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taalfoundation.com' },
    update: {},
    create: {
      name: 'Taal Admin',
      email: 'admin@taalfoundation.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      mustResetPass: false,
      isActive: true,
    },
  })
  console.log('✓ Admin created:', admin.email)

  // ── Batch ────────────────────────────────────────────────────────────────
  const batch = await prisma.batch.findFirst({ where: { name: 'Beginners Batch A' } })
    ?? await prisma.batch.create({
      data: {
        name: 'Beginners Batch A',
        schedule: 'Mon / Wed / Fri — 5:00 PM to 6:30 PM',
        instructor: 'Guru Meera Devi',
        capacity: 20,
      },
    })
  console.log('✓ Batch created:', batch.name)

  // ── Student ──────────────────────────────────────────────────────────────
  const studentHash = await bcrypt.hash('Student@1234', 12)
  const existingStudent = await prisma.user.findUnique({ where: { email: 'student@taalfoundation.com' } })
  const student = existingStudent ?? await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'student@taalfoundation.com',
      passwordHash: studentHash,
      role: 'STUDENT',
      phone: '9876543210',
      mustResetPass: false,
      isActive: true,
      batchId: batch.id,
      feeStructure: {
        create: {
          baseAmount: 1500,
          currentAmount: 1500,
        },
      },
    },
  })
  console.log('✓ Student created:', student.email)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('   EXAMPLE LOGIN CREDENTIALS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Admin  → admin@taalfoundation.com')
  console.log('          Admin@1234')
  console.log('  Student→ student@taalfoundation.com')
  console.log('          Student@1234')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
