'use client'

import { formatDate } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock, FileText, AlertCircle } from 'lucide-react'

interface AttendanceRecord { id: string; date: string; status: string; notes?: string | null }

const statusStyle: Record<string, { bg: string; text: string; icon: any }> = {
  PRESENT: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  ABSENT: { bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle },
  LATE: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock },
  EXCUSED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FileText },
}

export default function StudentAttendanceClient({
  attendance,
  stats,
}: {
  attendance: AttendanceRecord[]
  stats: { present: number; absent: number; late: number; total: number }
}) {
  const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

  return (
    <div className="font-inter">
      <h1 className="text-2xl font-bold text-slate-900 m-0 mb-6">My Attendance</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Attendance Rate', value: `${pct}%`, color: 'text-blue-600' },
          { label: 'Present', value: stats.present, color: 'text-[#10b981]' },
          { label: 'Absent', value: stats.absent, color: 'text-rose-600' },
          { label: 'Late', value: stats.late, color: 'text-orange-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider m-0">{s.label}</p>
            <p className={`text-3xl font-bold m-0 mt-2 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-slate-700">Overall Attendance</span>
          <span className={`text-sm font-bold ${pct >= 75 ? 'text-[#10b981]' : 'text-rose-600'}`}>{pct}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${pct >= 75 ? 'bg-[#10b981]' : 'bg-rose-500'}`} 
            style={{ width: `${pct}%` }} 
          />
        </div>
        {pct < 75 && (
          <p className="mt-3 text-sm text-rose-500 flex items-center gap-1.5 m-0 font-medium">
            <AlertCircle size={16} /> Attendance below 75% — please attend more classes
          </p>
        )}
      </div>

      {/* Records */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-800 m-0">Recent Records</h2>
        </div>
        {attendance.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-medium">No attendance records yet</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {attendance.map((rec) => {
              const { bg, text, icon: Icon } = statusStyle[rec.status] || statusStyle.PRESENT
              return (
                <div key={rec.id} className="flex justify-between items-center px-6 py-4 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-700 font-medium">{formatDate(rec.date)}</span>
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${bg} ${text}`}>
                    <Icon size={14} />
                    {rec.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
