'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Schedule {
  id: string
  title: string
  description?: string | null
  startTime: string
  endTime: string
  batchId?: string | null
  isRecurring: boolean
  recurrence?: string | null
}

interface Batch { id: string; name: string }

const btn = (v: 'primary' | 'ghost' | 'danger' = 'primary') => ({
  padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 600,
  fontSize: '0.85rem', cursor: 'pointer',
  background: v === 'primary' ? 'linear-gradient(45deg,#f97316,#fbbf24)' : v === 'danger' ? 'rgba(239,68,68,0.1)' : '#f1f5f9',
  color: v === 'primary' ? '#0f172a' : v === 'danger' ? '#ef4444' : '#374151',
})

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function ScheduleClient({ schedules: initial, batches }: { schedules: Schedule[]; batches: Batch[] }) {
  const [schedules, setSchedules] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', startTime: '', endTime: '',
    batchId: '', isRecurring: false, recurrence: '',
  })
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  function toggleDay(day: string) {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const data = {
      ...form,
      recurrence: form.isRecurring ? selectedDays.join(',') : null,
      batchId: form.batchId || null,
    }
    const res = await fetch('/api/admin/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setLoading(false)
    if (res.ok) {
      const s = await res.json()
      setSchedules((prev) => [...prev, s].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()))
      setShowAdd(false)
      setForm({ title: '', description: '', startTime: '', endTime: '', batchId: '', isRecurring: false, recurrence: '' })
      setSelectedDays([])
      toast.success('Schedule added!')
    } else toast.error('Failed to add schedule')
  }

  async function remove(id: string) {
    if (!confirm('Delete this schedule?')) return
    const res = await fetch('/api/admin/schedule', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { setSchedules((prev) => prev.filter((s) => s.id !== id)); toast.success('Deleted') }
    else toast.error('Failed to delete')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Class Schedule</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage class slots and recurring sessions</p>
        </div>
        <button style={btn('primary')} onClick={() => setShowAdd(true)}>+ Add Class</button>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Add Class Slot</h2>
            <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Class Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Beginner Kathak"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Start *</label>
                  <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>End *</label>
                  <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Batch</label>
                <select value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                  <option value="">All batches</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Recurring class</span>
              </label>
              {form.isRecurring && (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>Repeat on days</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {DAYS.map((d) => (
                      <button key={d} type="button" onClick={() => toggleDay(d)} style={{
                        padding: '0.35rem 0.75rem', borderRadius: '999px', border: 'none', fontSize: '0.85rem',
                        fontWeight: 600, cursor: 'pointer',
                        background: selectedDays.includes(d) ? '#0f172a' : '#f1f5f9',
                        color: selectedDays.includes(d) ? '#fbbf24' : '#374151',
                      }}>{d}</button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" style={btn('ghost')} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" style={btn('primary')} disabled={loading}>{loading ? 'Adding…' : 'Add Class'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {schedules.map((s) => (
          <div key={s.id} style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{s.title}</h3>
                {s.isRecurring && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                    🔁 {s.recurrence}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                {format(new Date(s.startTime), 'dd MMM yyyy, h:mm a')} → {format(new Date(s.endTime), 'h:mm a')}
              </p>
            </div>
            <button style={{ ...btn('danger'), padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => remove(s.id)}>Remove</button>
          </div>
        ))}
        {schedules.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            No classes scheduled yet. Click <strong>Add Class</strong> to get started.
          </div>
        )}
      </div>
    </div>
  )
}
