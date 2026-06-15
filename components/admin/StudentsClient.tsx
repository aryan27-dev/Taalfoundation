'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  name: string
  email: string
  phone?: string
  isActive: boolean
  joinDate: string
  batch?: { id: string; name: string } | null
  feeStructure?: { currentAmount: number } | null
  fees: { amount: number; dueDate: string }[]
}

interface Batch { id: string; name: string }

const input = {
  width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px',
  border: '1.5px solid #e2e8f0', fontSize: '0.9rem', background: '#f8fafc',
  outline: 'none', boxSizing: 'border-box' as const,
}

const btn = (variant: 'primary' | 'ghost' | 'danger' = 'primary') => ({
  padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
  fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
  background: variant === 'primary' ? 'linear-gradient(45deg,#f97316,#fbbf24)'
    : variant === 'danger' ? 'rgba(239,68,68,0.1)' : '#f1f5f9',
  color: variant === 'primary' ? '#0f172a' : variant === 'danger' ? '#ef4444' : '#374151',
})

export default function StudentsClient({ students: initial, batches }: { students: Student[]; batches: Batch[] }) {
  const router = useRouter()
  const [students, setStudents] = useState(initial)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', batchId: '', feeAmount: '',
    parentName: '', parentPhone: '', address: '',
  })

  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) ||
           s.email.toLowerCase().includes(search.toLowerCase())
  )

  async function addStudent(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      const student = await res.json()
      setStudents((prev) => [student, ...prev])
      setShowAdd(false)
      setForm({ name: '', email: '', phone: '', batchId: '', feeAmount: '', parentName: '', parentPhone: '', address: '' })
      toast.success('Student added! Credentials sent to their email.')
    } else {
      const d = await res.json()
      toast.error(d.error || 'Failed to add student')
    }
  }

  async function deactivate(id: string) {
    if (!confirm('Deactivate this student?')) return
    const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setStudents((prev) => prev.map((s) => s.id === id ? { ...s, isActive: false } : s))
      toast.success('Student deactivated')
    }
  }

  async function resetPassword(id: string) {
    if (!confirm('Send new temporary password to this student?')) return
    const res = await fetch(`/api/admin/students/${id}`, { method: 'POST' })
    if (res.ok) toast.success('New password sent to student\'s email')
    else toast.error('Failed to reset password')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Students</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>{students.filter((s) => s.isActive).length} active students</p>
        </div>
        <button style={btn('primary')} onClick={() => setShowAdd(true)}>+ Add Student</button>
      </div>

      {/* Search */}
      <input
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ ...input, maxWidth: '360px', marginBottom: '1.25rem' }}
      />

      {/* Add modal */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Add New Student</h2>
            <form onSubmit={addStudent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Priya Sharma', full: false },
                { label: 'Email Address *', key: 'email', type: 'email', placeholder: 'priya@example.com', full: false },
                { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 90000 00000', full: false },
                { label: 'Monthly Fee (₹) *', key: 'feeAmount', type: 'number', placeholder: '1500', full: false },
                { label: 'Parent Name', key: 'parentName', type: 'text', placeholder: 'Ramesh Sharma', full: false },
                { label: 'Parent Phone', key: 'parentPhone', type: 'tel', placeholder: '+91 90000 00000', full: false },
                { label: 'Address', key: 'address', type: 'text', placeholder: 'Flat 2, Pimple Saudagar, Pune', full: true },
              ].map(({ label, key, type, placeholder, full }) => (
                <div key={key} style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '4px' }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key as keyof typeof form]} required={label.includes('*')}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={input} />
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: '4px' }}>Batch</label>
                <select value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} style={{ ...input }}>
                  <option value="">Select batch (optional)</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <p style={{ gridColumn: '1 / -1', fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                A temporary password will be emailed to the student automatically.
              </p>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" style={btn('ghost')} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" style={btn('primary')} disabled={loading}>{loading ? 'Adding…' : 'Add Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Name', 'Batch', 'Monthly Fee', 'Pending', 'Joined', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{s.name}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{s.email}</p>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>{s.batch?.name || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                <td style={{ padding: '0.875rem 1rem', color: '#0f172a', fontWeight: 500 }}>{s.feeStructure ? formatCurrency(s.feeStructure.currentAmount) : '—'}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  {s.fees.length > 0 ? (
                    <span style={{ color: '#f97316', fontWeight: 600 }}>{formatCurrency(s.fees[0].amount)}</span>
                  ) : (
                    <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 600 }}>✓ Paid</span>
                  )}
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>{formatDate(s.joinDate)}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '999px',
                    background: s.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                    color: s.isActive ? '#16a34a' : '#64748b',
                  }}>{s.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button style={{ ...btn('ghost'), padding: '0.35rem 0.65rem', fontSize: '0.8rem' }} onClick={() => router.push(`/admin/students/${s.id}`)}>View</button>
                    <button style={{ ...btn('ghost'), padding: '0.35rem 0.65rem', fontSize: '0.8rem' }} onClick={() => resetPassword(s.id)}>Reset PW</button>
                    {s.isActive && <button style={{ ...btn('danger'), padding: '0.35rem 0.65rem', fontSize: '0.8rem' }} onClick={() => deactivate(s.id)}>Remove</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No students found</div>
        )}
      </div>
    </div>
  )
}
