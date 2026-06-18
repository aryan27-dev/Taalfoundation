'use client'

import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle2, TrendingUp, Calendar, Megaphone, Clock, CalendarDays, ExternalLink, GraduationCap } from 'lucide-react'

interface Props {
  user: {
    name: string; email: string; joinDate: string; profilePhoto?: string | null
    batch?: { name: string; schedule: string } | null
    feeStructure?: { currentAmount: number } | null
  } | null
  pendingFee: { id: string; amount: number; dueDate: string; status: string; month?: string } | null
  upcomingEvents: { id: string; title: string; eventDate: string; feeAmount: number; registrations: { studentId: string }[] }[]
  announcements: { id: string; title: string; content: string; createdAt: string }[]
  attendanceStats: { present: number; total: number }
}

export default function StudentDashboardClient({ user, pendingFee, upcomingEvents, announcements, attendanceStats }: Props) {
  const attendancePct = attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0

  return (
    <div className="font-inter space-y-6">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 m-0 flex items-center gap-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-600 mt-2 flex items-center gap-2">
          <GraduationCap size={18} />
          {user?.batch?.name || 'No batch assigned'}
        </p>
      </div>

      {/* Pay fee banner */}
      {pendingFee && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-rose-900 text-lg m-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Fee due: {formatCurrency(pendingFee.amount)} {pendingFee.month ? `for ${pendingFee.month}` : ''}
            </p>
            <p className="text-rose-700 text-sm mt-1 m-0">Due on {formatDate(pendingFee.dueDate)}</p>
          </div>
          <Link href="/student/fees" className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-colors decoration-none">
            Pay Now →
          </Link>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Fee status */}
        <div className={`bg-white rounded-2xl p-6 border ${pendingFee ? 'border-rose-200' : 'border-[#10b981]'}`}>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider m-0">Fee Status</p>
          <div className="flex items-center gap-3 mt-4">
            {pendingFee ? (
              <>
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <span className="text-rose-600 text-xl font-bold">!</span>
                </div>
                <p className="text-3xl font-bold text-rose-600 m-0">Pending</p>
              </>
            ) : (
              <>
                <CheckCircle2 size={36} className="text-[#10b981]" strokeWidth={2.5} />
                <p className="text-3xl font-bold text-[#10b981] m-0">Paid</p>
              </>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-4 m-0">
            {pendingFee ? `Due: ${formatDate(pendingFee.dueDate)}` : 'Up to date'}
          </p>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider m-0">This Month</p>
          <div className="flex items-center gap-3 mt-4">
            <p className="text-4xl font-bold text-slate-900 m-0">{attendancePct}%</p>
            <div className="ml-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
              <TrendingUp className="text-blue-500" size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-4 m-0">{attendanceStats.present} / {attendanceStats.total} classes attended</p>
        </div>

        {/* Monthly fee */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider m-0">Monthly Fee</p>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900 m-0 inline-block">
              {user?.feeStructure ? formatCurrency(user.feeStructure.currentAmount) : '—'}
            </p>
            <span className="text-slate-500 ml-2">/ month</span>
          </div>
          <p className="text-slate-500 text-sm mt-4 m-0">Recurring payment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming events */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 m-0">Upcoming Events</h2>
            <Link href="/student/events" className="text-blue-500 hover:text-blue-600 text-sm font-semibold decoration-none">
              View all →
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
                <CalendarDays size={32} strokeWidth={1.5} />
              </div>
              <p className="text-slate-500 text-sm m-0">No upcoming events scheduled for this week.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              {upcomingEvents.slice(0, 3).map((ev) => (
                <div key={ev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="bg-white w-12 h-12 rounded-lg border border-slate-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs text-blue-500 font-bold uppercase">{new Date(ev.eventDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-bold text-slate-900 leading-none">{new Date(ev.eventDate).getDate()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 m-0">{ev.title}</p>
                    <p className="text-sm text-slate-500 m-0 mt-1">
                      {ev.feeAmount > 0 ? formatCurrency(ev.feeAmount) : 'Free Event'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {/* Class schedule */}
          {user?.batch && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 m-0 mb-6">My Class Schedule</h2>
              <div className="bg-blue-50 rounded-xl p-5 mb-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <p className="font-bold text-slate-900 text-lg m-0">{user.batch.name}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar size={18} className="text-slate-400" />
                    <span className="text-sm">Class Schedule</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock size={18} className="text-slate-400" />
                    <span className="text-sm">{user.batch.schedule}</span>
                  </div>
                </div>
              </div>
              <Link href="/student/schedule" className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors decoration-none">
                View full schedule <ExternalLink size={16} />
              </Link>
            </div>
          )}

          {/* Recent announcements */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 m-0">Latest Notices</h2>
              <Link href="/student/announcements" className="text-blue-500 hover:text-blue-600 text-sm font-semibold decoration-none">
                View all →
              </Link>
            </div>
            {announcements.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                  <Megaphone size={32} strokeWidth={1.5} />
                </div>
                <p className="text-slate-500 text-sm m-0">No new announcements at the moment.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {announcements.slice(0, 2).map((ann) => (
                  <div key={ann.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-4">
                    <Megaphone className="text-slate-400 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm m-0">{ann.title}</p>
                      <p className="text-xs text-slate-500 m-0 mt-1">{formatDate(ann.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

