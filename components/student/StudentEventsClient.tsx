'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Event {
  id: string; title: string; description?: string; eventDate: string
  feeAmount: number; isOptional: boolean
  registrations: { studentId: string }[]
  fees: { id: string; status: string; amount: number }[]
}

export default function StudentEventsClient({ events: initial }: { events: Event[] }) {
  const [events, setEvents] = useState(initial)
  const [registering, setRegistering] = useState<string | null>(null)

  async function register(eventId: string) {
    setRegistering(eventId)
    const res = await fetch('/api/student/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    })
    setRegistering(null)
    if (res.ok) {
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, registrations: [{ studentId: 'me' }] } : e))
      toast.success('Registered! Fee will appear in your fees section.')
    } else {
      const d = await res.json()
      toast.error(d.error || 'Failed to register')
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem' }}>Upcoming Events</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {events.map((ev) => {
          const isRegistered = ev.registrations.length > 0
          const myFee = ev.fees[0]
          return (
            <div key={ev.id} style={{
              background: '#fff', borderRadius: '16px', padding: '1.5rem',
              border: `1px solid ${isRegistered ? '#fbbf24' : '#e2e8f0'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{ev.title}</h2>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px',
                      background: ev.isOptional ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)',
                      color: ev.isOptional ? '#3b82f6' : '#f97316',
                    }}>
                      {ev.isOptional ? 'Optional' : 'All students'}
                    </span>
                    {isRegistered && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                        ✓ Registered
                      </span>
                    )}
                  </div>
                  {ev.description && <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.9rem' }}>{ev.description}</p>}
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#64748b', flexWrap: 'wrap' }}>
                    <span>📅 {formatDate(ev.eventDate)}</span>
                    <span>💰 {ev.feeAmount > 0 ? formatCurrency(ev.feeAmount) : 'Free'}</span>
                    {myFee && <span style={{ color: myFee.status === 'PAID' ? '#16a34a' : '#f97316', fontWeight: 600 }}>Fee: {myFee.status}</span>}
                  </div>
                </div>

                {ev.isOptional && !isRegistered && (
                  <button
                    onClick={() => register(ev.id)}
                    disabled={registering === ev.id}
                    style={{
                      padding: '0.625rem 1.5rem', borderRadius: '10px', border: 'none',
                      background: 'linear-gradient(45deg,#f97316,#fbbf24)',
                      color: '#0f172a', fontWeight: 700, fontSize: '0.9rem',
                      cursor: registering === ev.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    {registering === ev.id ? 'Registering…' : 'Register'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {events.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            No upcoming events
          </div>
        )}
      </div>
    </div>
  )
}
