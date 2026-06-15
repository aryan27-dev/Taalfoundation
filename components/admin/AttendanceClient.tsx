'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Batch { id: string; name: string }
interface Student { id: string; name: string; batchId?: string }
interface AttendanceRecord { studentId: string; status: string; notes?: string }

const STATUS_OPTIONS = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const
type Status = typeof STATUS_OPTIONS[number]

const statusStyle: Record<Status, { bg: string; color: string }> = {
  PRESENT: { bg: 'rgba(34,197,94,0.15)', color: '#16a34a' },
  ABSENT: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  LATE: { bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  EXCUSED: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
}

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
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Attendance</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Mark daily attendance per batch</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px', color: '#374151' }}>Batch</label>
          <select value={batchId} onChange={(e) => setBatchId(e.target.value)} style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', background: '#f8fafc', outline: 'none' }}>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px', color: '#374151' }}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', background: '#f8fafc', outline: 'none' }} />
        </div>
        <button onClick={loadAttendance} style={{ padding: '0.625rem 1.25rem', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          Load
        </button>
      </div>

      {loaded && (
        <>
          {/* Bulk actions */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', alignSelf: 'center', marginRight: '0.25rem' }}>Mark all as:</span>
            {STATUS_OPTIONS.map((s) => {
              const { bg, color } = statusStyle[s]
              return (
                <button key={s} onClick={() => markAll(s)} style={{
                  padding: '0.35rem 0.875rem', borderRadius: '999px', border: 'none',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: bg, color,
                }}>{s}</button>
              )
            })}
          </div>

          {/* Student list */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '1rem' }}>
            {students.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No students in this batch</div>
            ) : (
              students.map((student, i) => {
                const status = attendance[student.id] || 'PRESENT'
                const { bg, color } = statusStyle[status]
                return (
                  <div key={student.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 1.25rem', borderBottom: i < students.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#fbbf24)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                        fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                      }}>
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500, color: '#0f172a' }}>{student.name}</span>
                    </div>
                    <button onClick={() => toggle(student.id)} style={{
                      padding: '0.35rem 1rem', borderRadius: '999px', border: 'none',
                      fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                      background: bg, color, minWidth: '90px',
                    }}>
                      {status}
                    </button>
                  </div>
                )
              })
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={save} disabled={saving} style={{
              padding: '0.75rem 2rem', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(45deg,#f97316,#fbbf24)', color: '#0f172a',
              fontWeight: 700, fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer',
            }}>
              {saving ? 'Saving…' : '✓ Save Attendance'}
            </button>
          </div>
        </>
      )}

      {!loaded && (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          Select a batch and date, then click <strong>Load</strong> to start marking attendance.
        </div>
      )}
    </div>
  )
}
