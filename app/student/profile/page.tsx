import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StudentProfileClient from '@/components/student/StudentProfileClient'

export default async function StudentProfilePage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: { batch: true, feeStructure: true },
  })
  return <StudentProfileClient user={JSON.parse(JSON.stringify(user))} />
}
