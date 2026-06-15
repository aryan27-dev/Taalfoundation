'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description?: string
  eventDate: string
  feeAmount: number
  isOptional: boolean
  _count: { registrations: number; fees: number }
}

const btn = (v: 'primary' | 'ghost' | 'danger' = 'primary') => ({
  padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 600,
  fontSize: '0.85rem', cursor: 'pointer',
  background: v === 'primary' ? 'linear-gradient(45deg,#f97316,#fbbf24)' : v === 'danger' ? 'rgba(239,68,68,0.1)' : '#f1f5f9',
  color: v === 'primary' ? '#0f172a' : v === 'danger' ? '#ef4444' : '#374151',
})

export default function EventsClient({ events: initial }: { events: Event[] }) {
  const [events, setEvents] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', eventDate: '', feeAmount: '', isOptional: false })

  async function addEvent(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      const ev = await res.json()
      setEvents((prev) => [{ ...ev, _count: { registrations: 0, fees: 0 } }, ...prev])
      setShowAdd(false)
      setForm({ title: '', description: '', eventDate: '', feeAmount: '', isOptional: false })
      toast.success(`Event created! ${form.isOptional ? 'Optional' : 'Fees auto-generated for all students.'}`)
    } else {
      const d = await res.json()
      toast.error(d.error || 'Failed to create event')
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return
    const res = await fetch('/api/admin/events', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { setEvents((prev) => prev.filter((e) => e.id !== id)); toast.success('Event deleted') }
    else toast.error('Failed to delete event')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Events</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>{events.length} events total</p>
        </div>
        <button style={btn('primary')} onClick={() => setShowAdd(true)}>+ Create Event</button>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px' }}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Create Event</h2>
            <form onSubmit={addEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Event Title *', key: 'title', type: 'text', placeholder: 'Annual Day 2025' },
                { label: 'Event Date *', key: 'eventDate', type: 'date', placeholder: '' },
                { label: 'Fee Amount (₹)', key: 'feeAmount', type: 'number', placeholder: '500' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key as keyof typeof form] as string}
                    required={label.includes('*')} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Event details…"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isOptional} onChange={(e) => setForm({ ...form, isOptional: e.target.checked })} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Optional event (students register individually)</span>
              </label>
              {!form.isOptional && <p style={{ fontSize: '0.8rem', color: '#f97316', margin: 0 }}>⚡ Fee will be auto-generated for all active students</p>}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" style={btn('ghost')} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" style={btn('primary')} disabled={loading}>{loading ? 'Creating…' : 'Create Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {events.map((ev) => (
          <div key={ev.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{ev.title}</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px',
                  background: ev.isOptional ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)',
                  color: ev.isOptional ? '#3b82f6' : '#f97316' }}>
                  {ev.isOptional ? 'Optional' : 'Mandatory'}
                </span>
              </div>
              {ev.description && <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.9rem' }}>{ev.description}</p>}
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                <span>📅 {formatDate(ev.eventDate)}</span>
                <span>💰 {formatCurrency(ev.feeAmount)}</span>
                <span>👥 {ev._count.registrations} registered</span>
                <span>📄 {ev._count.fees} fees generated</span>
              </div>
            </div>
            <button style={{ ...btn('danger'), padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => deleteEvent(ev.id)}>Delete</button>
          </div>
        ))}
        {events.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            No events yet. Click <strong>Create Event</strong> to add one.
          </div>
        )}
      </div>
    </div>
  )
}
