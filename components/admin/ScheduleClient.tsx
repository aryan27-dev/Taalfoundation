'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { CalendarPlus, CalendarDays, Trash2, X, RefreshCw, Clock } from 'lucide-react'

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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border text-slate-900"

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
    <div className="font-inter space-y-6 max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 m-0">Class Schedule</h1>
          <p className="text-slate-500 mt-2 m-0 text-base">Manage class slots and recurring sessions</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm border-none"
        >
          <CalendarPlus size={18} /> Add Class
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="m-0 text-xl font-bold text-slate-900">Add Class Slot</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 border-none bg-transparent cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={add} className="flex flex-col gap-4">
              <div>
                <label className="block font-semibold text-sm mb-1.5 text-slate-700">Class Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  required 
                  placeholder="e.g. Beginner Kathak"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sm mb-1.5 text-slate-700">Start <span className="text-rose-500">*</span></label>
                  <input 
                    type="datetime-local" 
                    value={form.startTime} 
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })} 
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sm mb-1.5 text-slate-700">End <span className="text-rose-500">*</span></label>
                  <input 
                    type="datetime-local" 
                    value={form.endTime} 
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })} 
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-sm mb-1.5 text-slate-700">Batch</label>
                <select 
                  value={form.batchId} 
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">All batches (General Event)</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 mt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={form.isRecurring} 
                    onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <RefreshCw size={16} className={form.isRecurring ? "text-blue-600" : "text-slate-400"} /> Recurring class
                  </span>
                </label>
                
                {form.isRecurring && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <label className="block font-semibold text-sm mb-2 text-slate-700">Repeat on days</label>
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map((d) => {
                        const isSelected = selectedDays.includes(d)
                        return (
                          <button 
                            key={d} 
                            type="button" 
                            onClick={() => toggleDay(d)} 
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                              isSelected 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {d}
                          </button>
                        )
                      })}
                    </div>
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
                  {loading ? 'Adding…' : 'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {schedules.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center gap-4 flex-wrap group">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="m-0 text-base font-bold text-slate-900">{s.title}</h3>
                {s.isRecurring && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    <RefreshCw size={12} /> {s.recurrence}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Clock size={14} className="text-slate-400" />
                <p className="m-0 text-sm font-medium text-slate-600">
                  {format(new Date(s.startTime), 'dd MMM yyyy, h:mm a')} <span className="text-slate-300 mx-1">→</span> {format(new Date(s.endTime), 'h:mm a')}
                </p>
              </div>
            </div>
            <button 
              onClick={() => remove(s.id)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="Delete Schedule"
            >
              <Trash2 size={16} /> <span className="md:hidden">Remove</span>
            </button>
          </div>
        ))}
        
        {schedules.length === 0 && (
          <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <CalendarDays size={32} />
            </div>
            <p className="m-0 font-medium">No classes scheduled yet. Click <strong>Add Class</strong> to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
