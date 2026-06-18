'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CalendarDays, Banknote, CalendarCheck, CheckCircle2 } from 'lucide-react'

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
    <div className="font-inter space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 m-0">Upcoming Events</h1>

      <div className="flex flex-col gap-4">
        {events.map((ev) => {
          const isRegistered = ev.registrations.length > 0
          const myFee = ev.fees[0]
          return (
            <div key={ev.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${isRegistered ? 'border-blue-200' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1 min-w-[280px]">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="m-0 text-lg font-bold text-slate-900">{ev.title}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${ev.isOptional ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {ev.isOptional ? 'Optional' : 'All students'}
                    </span>
                    {isRegistered && (
                      <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                        <CheckCircle2 size={14} /> Registered
                      </span>
                    )}
                  </div>
                  {ev.description && <p className="m-0 mb-4 text-slate-600 text-sm">{ev.description}</p>}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 inline-flex">
                    <span className="flex items-center gap-1.5 font-medium"><CalendarDays size={16} className="text-slate-400" /> {formatDate(ev.eventDate)}</span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1.5 font-medium"><Banknote size={16} className="text-slate-400" /> {ev.feeAmount > 0 ? formatCurrency(ev.feeAmount) : 'Free Event'}</span>
                    {myFee && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className={`font-bold flex items-center gap-1.5 ${myFee.status === 'PAID' ? 'text-[#10b981]' : 'text-rose-500'}`}>
                          Fee: {myFee.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {ev.isOptional && !isRegistered && (
                  <button
                    onClick={() => register(ev.id)}
                    disabled={registering === ev.id}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors decoration-none border-none whitespace-nowrap shadow-sm ${
                      registering === ev.id 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    }`}
                  >
                    {registering === ev.id ? 'Registering…' : 'Register Now'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {events.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
              <CalendarCheck size={32} />
            </div>
            <p className="text-slate-500 font-medium m-0">No upcoming events right now.</p>
          </div>
        )}
      </div>
    </div>
  )
}
