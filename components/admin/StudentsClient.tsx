'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { UserPlus, Search, KeyRound, Ban, Eye, X, CheckCircle2, AlertCircle } from 'lucide-react'

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

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border text-slate-900"

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
    <div className="font-inter space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 m-0">Students</h1>
          <p className="text-slate-500 mt-2 m-0 text-base">{students.filter((s) => s.isActive).length} active students</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm border-none"
        >
          <UserPlus size={18} /> Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm text-slate-900"
        />
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl border border-slate-200 my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="m-0 text-xl font-bold text-slate-900">Add New Student</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 border-none bg-transparent cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={addStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Priya Sharma', full: false },
                { label: 'Email Address *', key: 'email', type: 'email', placeholder: 'priya@example.com', full: false },
                { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 90000 00000', full: false },
                { label: 'Monthly Fee (₹) *', key: 'feeAmount', type: 'number', placeholder: '1500', full: false },
                { label: 'Parent Name', key: 'parentName', type: 'text', placeholder: 'Ramesh Sharma', full: false },
                { label: 'Parent Phone', key: 'parentPhone', type: 'tel', placeholder: '+91 90000 00000', full: false },
                { label: 'Address', key: 'address', type: 'text', placeholder: 'Flat 2, Pimple Saudagar, Pune', full: true },
              ].map(({ label, key, type, placeholder, full }) => (
                <div key={key} className={full ? 'md:col-span-2' : ''}>
                  <label className="block font-semibold text-sm mb-1.5 text-slate-700">{label}</label>
                  <input 
                    type={type} 
                    placeholder={placeholder} 
                    value={form[key as keyof typeof form]} 
                    required={label.includes('*')}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })} 
                    className={inputClass} 
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block font-semibold text-sm mb-1.5 text-slate-700">Batch</label>
                <select 
                  value={form.batchId} 
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })} 
                  className={inputClass}
                >
                  <option value="">Select batch (optional)</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              
              <div className="md:col-span-2 bg-blue-50 p-3 rounded-xl border border-blue-100 flex gap-2 items-start mt-2">
                <KeyRound size={16} className="text-blue-600 mt-0.5" />
                <p className="m-0 text-xs text-blue-700 leading-relaxed font-medium">
                  A temporary password will be emailed to the student automatically upon creation.
                </p>
              </div>
              
              <div className="md:col-span-2 flex gap-3 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAdd(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors border-none shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Adding…' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Name', 'Batch', 'Monthly Fee', 'Pending', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors bg-white">
                  <td className="px-6 py-4">
                    <p className="m-0 font-bold text-slate-900">{s.name}</p>
                    <p className="m-0 mt-0.5 text-xs font-medium text-slate-500">{s.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {s.batch?.name || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {s.feeStructure ? formatCurrency(s.feeStructure.currentAmount) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    {s.fees.length > 0 ? (
                      <span className="font-bold text-rose-600 flex items-center gap-1.5"><AlertCircle size={14}/> {formatCurrency(s.fees[0].amount)}</span>
                    ) : (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1.5 w-fit"><CheckCircle2 size={14}/> Paid</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs font-medium">{formatDate(s.joinDate)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                      s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/admin/students/${s.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        title="View Profile"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button 
                        onClick={() => resetPassword(s.id)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Reset Password"
                      >
                        <KeyRound size={14} /> Reset
                      </button>
                      {s.isActive && (
                        <button 
                          onClick={() => deactivate(s.id)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 text-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Deactivate Student"
                        >
                          <Ban size={14} /> Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-500 font-medium">No students found</div>
          )}
        </div>
      </div>
    </div>
  )
}
