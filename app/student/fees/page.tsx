import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StudentFeesClient from '@/components/student/StudentFeesClient'

export default async function StudentFeesPage() {
  const session = await auth()
  const fees = await prisma.fee.findMany({
    where: { studentId: session!.user.id },
    include: { event: true },
    orderBy: { createdAt: 'desc' },
  })
  return <StudentFeesClient fees={JSON.parse(JSON.stringify(fees))} />
}
