import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StudentNav from '@/components/student/StudentNav'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.mustResetPass) redirect('/reset-password')

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <StudentNav userName={session.user.name} />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        {children}
      </main>
    </div>
  )
}
