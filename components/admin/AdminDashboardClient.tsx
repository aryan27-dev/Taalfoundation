'use client'

import { useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, TrendingUp, Clock, AlertTriangle, ChevronRight, CalendarDays, IndianRupee } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  stats: {
    totalStudents: number
    pendingAmount: number
    pendingCount: number
    collectedThisMonth: number
    overdueCount: number
  }
  monthlyData: { month: string; amount: number }[]
  recentStudents: {
    id: string
    name: string
    email: string
    batch?: { name: string } | null
    fees: { amount: number; dueDate: string }[]
  }[]
  upcomingEvents: { id: string; title: string; eventDate: string; feeAmount: number }[]
  recentPayments: {
    id: string
    amount: number
    paidDate: string | null
    razorpayPaymentId: string | null
    notes: string | null
    month: string | null
    student: { id: string; name: string; email: string }
  }[]
  adminName: string
}

export default function AdminDashboardClient({ stats, monthlyData, recentStudents, upcomingEvents, recentPayments, adminName }: Props) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30000)
    return () => clearInterval(interval)
  }, [router])

  function paymentMethod(fee: Props['recentPayments'][0]) {
    if (fee.razorpayPaymentId) return 'Online'
    if (fee.notes?.includes('offline')) return 'Cash/UPI'
    return 'Offline'
  }
  return (
    <div className="font-inter space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 m-0">Dashboard</h1>
        <p className="text-slate-500 mt-2 m-0 text-base">Welcome back, {adminName} — here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Students', value: stats.totalStudents.toString(), icon: Users, color: 'text-blue-600', border: 'border-l-blue-500', bg: 'bg-blue-50' },
          { label: 'Collected This Month', value: formatCurrency(stats.collectedThisMonth), icon: TrendingUp, color: 'text-[#10b981]', border: 'border-l-[#10b981]', bg: 'bg-green-50' },
          { label: 'Pending Fees', value: formatCurrency(stats.pendingAmount), icon: Clock, color: 'text-orange-500', border: 'border-l-orange-500', bg: 'bg-orange-50', sub: `${stats.pendingCount} students` },
          { label: 'Overdue Fees', value: stats.overdueCount.toString(), icon: AlertTriangle, color: 'text-rose-600', border: 'border-l-rose-500', bg: 'bg-rose-50', sub: 'Need attention' },
        ].map((s) => (
          <div key={s.label} className={`bg-white border-y border-r border-slate-200 rounded-2xl p-6 shadow-sm border-l-4 ${s.border}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="m-0 text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className="m-0 mt-2 text-2xl lg:text-3xl font-bold text-slate-900">{s.value}</p>
                {s.sub && <p className="m-0 mt-1 text-xs font-medium text-slate-500">{s.sub}</p>}
              </div>
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                <s.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 m-0 mb-6">Monthly Fee Collection</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis fontSize={12} tick={{ fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} dx={-10} />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), 'Collected']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="amount" fill="url(#blueGrad)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 m-0 mb-6 flex items-center justify-between">
            Upcoming Events
            <Link href="/admin/events" className="text-sm font-semibold text-blue-600 hover:text-blue-700 decoration-none flex items-center">
              Manage <ChevronRight size={16} />
            </Link>
          </h2>
          
          {upcomingEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <CalendarDays size={32} className="text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm font-medium m-0">No upcoming events</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <p className="m-0 font-bold text-sm text-slate-900">{e.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-slate-500">{formatDate(e.eventDate)}</span>
                    <span className="text-xs font-bold text-slate-700">{e.feeAmount > 0 ? formatCurrency(e.feeAmount) : 'Free'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 m-0 flex items-center gap-2">
            <IndianRupee size={20} className="text-[#10b981]" /> Recent Payments
          </h2>
          <Link href="/admin/fees" className="text-sm font-semibold text-blue-600 hover:text-blue-700 decoration-none flex items-center">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                {['Student', 'Amount', 'Month', 'Paid On', 'Method', 'Reference'].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors bg-white">
                  <td className="px-6 py-4 font-bold text-slate-900">{f.student.name}</td>
                  <td className="px-6 py-4 font-bold text-[#10b981]">{formatCurrency(f.amount)}</td>
                  <td className="px-6 py-4 text-slate-600">{f.month || '—'}</td>
                  <td className="px-6 py-4 text-slate-600">{f.paidDate ? formatDate(f.paidDate) : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      paymentMethod(f) === 'Online' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {paymentMethod(f)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                    {f.razorpayPaymentId || f.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentPayments.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">No payments recorded yet.</div>
          )}
        </div>
      </div>

      {/* Recent students with pending fees */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 m-0">Students with Pending Fees</h2>
          <Link href="/admin/fees" className="text-sm font-semibold text-blue-600 hover:text-blue-700 decoration-none flex items-center">
            View all <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                {['Student', 'Batch', 'Amount Due', 'Due Date', ''].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentStudents.filter((s) => s.fees.length > 0).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors bg-white">
                  <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{s.batch?.name || '—'}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">{formatCurrency(s.fees[0]?.amount || 0)}</td>
                  <td className="px-6 py-4 text-slate-600">{s.fees[0] ? formatDate(s.fees[0].dueDate) : '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/students/${s.id}`} className="text-blue-600 hover:text-blue-800 font-bold decoration-none text-xs px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors inline-block">
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentStudents.filter((s) => s.fees.length > 0).length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">
              No students with pending fees.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
