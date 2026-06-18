'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { CheckCircle2, Save, Download } from 'lucide-react'

interface Batch { id: string; name: string }
interface Student { id: string; name: string; batchId?: string }
interface AttendanceRecord { studentId: string; status: string; notes?: string }

const STATUS_OPTIONS = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const
type Status = typeof STATUS_OPTIONS[number]

const statusStyle: Record<Status, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-rose-100 text-rose-700',
  LATE: 'bg-orange-100 text-orange-700',
  EXCUSED: 'bg-blue-100 text-blue-700',
}

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border text-slate-900"

export default function AttendanceClient({ batches }: { batches: Batch[] }) {
  const [batchId, setBatchId] = useState(batches[0]?.id || '')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, Status>>({})
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadAttendance = useCallback(async () => {
    if (!batchId || !date) return
    const res = await fetch(`/api/admin/attendance?batchId=${batchId}&date=${date}`)
    if (!res.ok) return
    const data = await res.json()
    setStudents(data.students)
    const map: Record<string, Status> = {}
    data.students.forEach((s: Student) => { map[s.id] = 'PRESENT' })
    data.attendance.forEach((a: AttendanceRecord) => { map[a.studentId] = a.status as Status })
    setAttendance(map)
    setLoaded(true)
  }, [batchId, date])

  function toggle(studentId: string) {
    setAttendance((prev) => {
      const curr = prev[studentId] || 'PRESENT'
      const idx = STATUS_OPTIONS.indexOf(curr)
      return { ...prev, [studentId]: STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length] }
    })
  }

  function markAll(status: Status) {
    const updated: Record<string, Status> = {}
    students.forEach((s) => { updated[s.id] = status })
    setAttendance(updated)
  }

  async function save() {
    setSaving(true)
    const records = students.map((s) => ({
      studentId: s.id,
      batchId,
      date,
      status: attendance[s.id] || 'PRESENT',
    }))
    const res = await fetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }),
    })
    setSaving(false)
    if (res.ok) toast.success('Attendance saved!')
    else toast.error('Failed to save')
  }

  return (
    <div className="font-inter space-y-6 max-w-4xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 m-0">Attendance</h1>
        <p className="text-slate-500 mt-2 m-0 text-base">Mark daily attendance per batch</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold text-sm mb-1.5 text-slate-700">Batch</label>
          <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className={inputClass}>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold text-sm mb-1.5 text-slate-700">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
        <button 
          onClick={loadAttendance} 
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors border-none shadow-sm cursor-pointer flex items-center gap-2 h-[42px]"
        >
          <Download size={16} /> Load Data
        </button>
      </div>

      {loaded && (
        <div className="space-y-6">
          {/* Bulk actions */}
          <div className="flex gap-2 mb-4 flex-wrap items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-sm font-semibold text-slate-600 mr-2">Mark all as:</span>
            {STATUS_OPTIONS.map((s) => (
              <button 
                key={s} 
                onClick={() => markAll(s)} 
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-transform hover:scale-105 cursor-pointer border-none ${statusStyle[s]}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Student list */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {students.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">No students in this batch</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {students.map((student) => {
                  const status = attendance[student.id] || 'PRESENT'
                  const statusClass = statusStyle[status]
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{student.name}</span>
                      </div>
                      <button 
                        onClick={() => toggle(student.id)} 
                        className={`px-4 py-2 rounded-full text-xs font-bold min-w-[100px] cursor-pointer transition-colors border-none ${statusClass}`}
                      >
                        {status}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={save} 
              disabled={saving} 
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors border-none shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={18} /> {saving ? 'Saving…' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}

      {!loaded && (
        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <CheckCircle2 size={32} />
          </div>
          <p className="m-0 font-medium">Select a batch and date, then click <strong>Load Data</strong> to start marking attendance.</p>
        </div>
      )}
    </div>
  )
}
