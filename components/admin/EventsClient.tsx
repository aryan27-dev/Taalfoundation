'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CalendarPlus, Trash2, CalendarDays, IndianRupee, Users, FileText, X, Zap } from 'lucide-react'

interface Event {
  id: string
  title: string
  description?: string
  eventDate: string
  feeAmount: number
  isOptional: boolean
  _count: { registrations: number; fees: number }
}

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border text-slate-900"

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
    <div className="font-inter space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 m-0">Events</h1>
          <p className="text-slate-500 mt-2 m-0 text-base">{events.length} events total</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm border-none"
        >
          <CalendarPlus size={18} /> Create Event
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="m-0 text-xl font-bold text-slate-900">Create Event</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 border-none bg-transparent cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={addEvent} className="flex flex-col gap-4">
              {[
                { label: 'Event Title *', key: 'title', type: 'text', placeholder: 'Annual Day 2025' },
                { label: 'Event Date *', key: 'eventDate', type: 'date', placeholder: '' },
                { label: 'Fee Amount (₹)', key: 'feeAmount', type: 'number', placeholder: '500' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block font-semibold text-sm mb-1.5 text-slate-700">{label}</label>
                  <input 
                    type={type} 
                    placeholder={placeholder} 
                    value={form[key as keyof typeof form] as string}
                    required={label.includes('*')} 
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className={inputClass} 
                  />
                </div>
              ))}
              <div>
                <label className="block font-semibold text-sm mb-1.5 text-slate-700">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} 
                  placeholder="Event details…"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border resize-y text-slate-900" 
                />
              </div>
              
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 mt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none mb-3">
                  <input 
                    type="checkbox" 
                    checked={form.isOptional} 
                    onChange={(e) => setForm({ ...form, isOptional: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-900">Optional event (students register individually)</span>
                </label>
                
                {!form.isOptional && (
                  <div className="flex gap-2 items-start bg-orange-50 p-3 rounded-lg border border-orange-100 text-orange-700 mt-2">
                    <Zap size={16} className="mt-0.5 flex-shrink-0" />
                    <p className="m-0 text-xs font-semibold leading-relaxed">
                      Fee will be auto-generated for all active students.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 justify-end mt-4">
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
                  {loading ? 'Creating…' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {events.map((ev) => (
          <div key={ev.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex gap-4 items-start justify-between flex-wrap group transition-shadow hover:shadow-md">
            <div className="flex-1 min-w-[250px]">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="m-0 text-lg font-bold text-slate-900">{ev.title}</h3>
                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                  ev.isOptional ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                }`}>
                  {ev.isOptional ? 'Optional' : 'Mandatory'}
                </span>
              </div>
              {ev.description && <p className="m-0 mb-4 text-slate-600 text-sm leading-relaxed">{ev.description}</p>}
              
              <div className="flex gap-x-6 gap-y-3 text-sm font-medium text-slate-600 flex-wrap">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-slate-400" /> {formatDate(ev.eventDate)}
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee size={16} className="text-slate-400" /> {formatCurrency(ev.feeAmount)}
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-400" /> {ev._count.registrations} registered
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" /> {ev._count.fees} fees generated
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => deleteEvent(ev.id)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 shrink-0"
              title="Delete Event"
            >
              <Trash2 size={16} /> <span className="md:hidden">Remove</span>
            </button>
          </div>
        ))}
        
        {events.length === 0 && (
          <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <CalendarPlus size={32} />
            </div>
            <p className="m-0 font-medium">No events yet. Click <strong>Create Event</strong> to add one.</p>
          </div>
        )}
      </div>
    </div>
  )
}
