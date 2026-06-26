'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, X, Pencil, Users } from 'lucide-react'

interface Batch {
  id: string
  name: string
  schedule: string
  instructor: string
  capacity: number
  isActive: boolean
  _count: { students: number }
}

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border text-slate-900"

export default function BatchesClient({ batches: initial }: { batches: Batch[] }) {
  const [batches, setBatches] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [editBatch, setEditBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', schedule: '', instructor: '', capacity: '20' })

  function openEdit(b: Batch) {
    setForm({ name: b.name, schedule: b.schedule, instructor: b.instructor, capacity: String(b.capacity) })
    setEditBatch(b)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const isEdit = !!editBatch
    const res = await fetch('/api/admin/batches', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEdit ? { id: editBatch!.id, ...form, capacity: Number(form.capacity) } : { ...form, capacity: Number(form.capacity) }),
    })
    setLoading(false)
    if (res.ok) {
      const batch = await res.json()
      if (isEdit) {
        setBatches((prev) => prev.map((b) => b.id === batch.id ? { ...b, ...batch } : b))
        setEditBatch(null)
        toast.success('Batch updated')
      } else {
        setBatches((prev) => [...prev, { ...batch, _count: { students: 0 } }])
        setShowAdd(false)
        setForm({ name: '', schedule: '', instructor: '', capacity: '20' })
        toast.success('Batch created')
      }
    } else toast.error('Failed to save batch')
  }

  async function deactivate(id: string) {
    if (!confirm('Deactivate this batch?')) return
    const res = await fetch('/api/admin/batches', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) {
      setBatches((prev) => prev.map((b) => b.id === id ? { ...b, isActive: false } : b))
      toast.success('Batch deactivated')
    }
  }

  const modalOpen = showAdd || !!editBatch

  return (
    <div className="font-inter space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 m-0">Batches</h1>
          <p className="text-slate-500 mt-2 m-0">Manage class batches and schedules</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditBatch(null); setForm({ name: '', schedule: '', instructor: '', capacity: '20' }) }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm border-none cursor-pointer shadow-sm">
          <Plus size={18} /> Add Batch
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="m-0 text-xl font-bold text-slate-900">{editBatch ? 'Edit Batch' : 'New Batch'}</h2>
              <button onClick={() => { setShowAdd(false); setEditBatch(null) }} className="p-1.5 rounded-lg hover:bg-slate-100 border-none bg-transparent cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="flex flex-col gap-4">
              {[
                { label: 'Batch Name *', key: 'name', placeholder: 'Beginner Kathak' },
                { label: 'Schedule *', key: 'schedule', placeholder: 'Mon & Wed 5–7 PM' },
                { label: 'Instructor *', key: 'instructor', placeholder: 'Guru Name' },
                { label: 'Capacity', key: 'capacity', placeholder: '20', type: 'number' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block font-semibold text-sm mb-1.5 text-slate-700">{label}</label>
                  <input type={type || 'text'} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={label.includes('*')} placeholder={placeholder} className={inputClass} />
                </div>
              ))}
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => { setShowAdd(false); setEditBatch(null) }} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm border-none cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm border-none cursor-pointer disabled:opacity-50">{loading ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {batches.map((b) => (
          <div key={b.id} className={`bg-white rounded-2xl p-6 border shadow-sm flex justify-between items-start gap-4 flex-wrap ${b.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="m-0 text-lg font-bold text-slate-900">{b.name}</h3>
                {!b.isActive && <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">Inactive</span>}
              </div>
              <p className="m-0 text-sm text-slate-600">{b.schedule}</p>
              <p className="m-0 text-sm text-slate-500 mt-1">Instructor: {b.instructor}</p>
              <p className="m-0 text-xs text-slate-400 mt-2 flex items-center gap-1"><Users size={14} /> {b._count.students} / {b.capacity} students</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(b)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer flex items-center gap-1.5">
                <Pencil size={14} /> Edit
              </button>
              {b.isActive && (
                <button onClick={() => deactivate(b.id)} className="px-4 py-2 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs cursor-pointer">Deactivate</button>
              )}
            </div>
          </div>
        ))}
        {batches.length === 0 && <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border">No batches yet.</div>}
      </div>
    </div>
  )
}
