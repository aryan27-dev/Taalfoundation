import { prisma } from '@/lib/prisma'
import BatchesClient from '@/components/admin/BatchesClient'

export default async function AdminBatchesPage() {
  const batches = await prisma.batch.findMany({
    include: { _count: { select: { students: true } } },
    orderBy: { name: 'asc' },
  })

  return <BatchesClient batches={JSON.parse(JSON.stringify(batches))} />
}
