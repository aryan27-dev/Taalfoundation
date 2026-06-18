'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Mail, Zap, CheckCircle2, Clock, AlertTriangle, FileX, X } from 'lucide-react'

interface Fee {
  id: string
  amount: number
  dueDate: string
  paidDate?: string
  status: string
  feeType: string
  month?: string
  waivedReason?: string
  student: { id: string; name: string; email: string; batch?: { name: string } | null }
}

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  PAID: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  PENDING: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock },
  OVERDUE: { bg: 'bg-rose-100', text: 'text-rose-700', icon: AlertTriangle },
  WAIVED: { bg: 'bg-slate-100', text: 'text-slate-700', icon: FileX },
}

export default function FeesClient({ fees: initial, summary, collectedThisMonth }: {
  fees: Fee[]
  summary: { status: string; _sum: { amount: number | null }; _count: number }[]
  collectedThisMonth: number
}) {
  const [fees, setFees] = useState(initial)
  const [tab, setTab] = useState<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'>('ALL')
  const [loading, setLoading] = useState(false)
  const [waiveId, setWaiveId] = useState<string | null>(null)
  const [waiveReason, setWaiveReason] = useState('')

  const filtered = tab === 'ALL' ? fees : fees.filter((f) => f.status === tab)

  const getStat = (s: string) => summary.find((x) => x.status === s)

  async function generate() {
    if (!confirm('Generate fees for all active students for this month?')) return
    setLoading(true)
    const res = await fetch('/api/admin/fees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate' }) })
    setLoading(false)
    const d = await res.json()
    if (res.ok) { toast.success(`${d.created} fee records created`); window.location.reload() }
    else toast.error('Failed to generate fees')
  }

  async function remind() {
    if (!confirm('Send reminder emails to all students with pending/overdue fees?')) return
    setLoading(true)
    const res = await fetch('/api/admin/fees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'remind' }) })
    setLoading(false)
    const d = await res.json()
    if (res.ok) toast.success(`Reminders sent to ${d.sent} students`)
    else toast.error('Failed to send reminders')
  }

  async function waive() {
    if (!waiveId || !waiveReason.trim()) { toast.error('Please provide a reason'); return }
    const res = await fetch('/api/admin/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'waive', feeId: waiveId, waivedReason: waiveReason }),
    })
    if (res.ok) {
      setFees((prev) => prev.map((f) => f.id === waiveId ? { ...f, status: 'WAIVED', waivedReason: waiveReason } : f))
      toast.success('Fee waived')
      setWaiveId(null)
      setWaiveReason('')
    } else toast.error('Failed to waive fee')
  }

  return (
    <div className="font-inter space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 m-0">Fees Management</h1>
          <p className="text-slate-500 mt-2 m-0 text-base">Collected this month: <strong className="text-[#10b981]">{formatCurrency(collectedThisMonth)}</strong></p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={remind} 
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Mail size={16} /> Send Reminders
          </button>
          <button 
            onClick={generate} 
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50 border-none"
          >
            <Zap size={16} /> Generate This Month&apos;s Fees
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['PENDING', 'PAID', 'OVERDUE', 'WAIVED'].map((s) => {
          const stat = getStat(s)
          const { bg, text, icon: Icon } = statusColors[s]
          const isSelected = tab === s
          return (
            <button 
              key={s} 
              onClick={() => setTab(s as typeof tab)} 
              className={`text-left p-5 rounded-2xl transition-all cursor-pointer border-2 ${
                isSelected ? `border-blue-500 ${bg}` : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={isSelected ? 'text-blue-700' : 'text-slate-400'} />
                <p className="m-0 text-xs font-bold text-slate-500 uppercase tracking-wider">{s}</p>
              </div>
              <p className={`m-0 text-2xl font-bold ${isSelected ? 'text-blue-900' : text}`}>{formatCurrency(stat?._sum.amount || 0)}</p>
              <p className="m-0 mt-1 text-xs font-medium text-slate-500">{stat?._count || 0} fees</p>
            </button>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {(['ALL', 'PENDING', 'PAID', 'OVERDUE', 'WAIVED'] as const).map((t) => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors decoration-none border-none cursor-pointer whitespace-nowrap ${
              tab === t ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t === 'ALL' ? 'All Fees' : t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Student', 'Month', 'Amount', 'Due Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((f) => {
                const { bg, text, icon: Icon } = statusColors[f.status] || { bg: 'bg-slate-100', text: 'text-slate-700', icon: CheckCircle2 }
                return (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors bg-white">
                    <td className="px-6 py-4">
                      <p className="m-0 font-bold text-slate-900">{f.student.name}</p>
                      <p className="m-0 mt-0.5 text-xs font-medium text-slate-500">{f.student.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{f.month || f.feeType.replace('_', ' ')}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(f.amount)}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(f.dueDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${bg} ${text}`}>
                        <Icon size={14} /> {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {f.status === 'PENDING' || f.status === 'OVERDUE' ? (
                        <button 
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs transition-colors cursor-pointer"
                          onClick={() => { setWaiveId(f.id); setWaiveReason('') }}
                        >
                          Waive
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-500 font-medium flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                <FileX size={32} />
              </div>
              No fees found for this category.
            </div>
          )}
        </div>
      </div>

      {/* Waive modal */}
      {waiveId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="m-0 text-xl font-bold text-slate-900">Waive Fee</h3>
              <button onClick={() => setWaiveId(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 border-none bg-transparent cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <label className="block font-semibold text-sm mb-1.5 text-slate-700">Reason for waiver <span className="text-rose-500">*</span></label>
            <textarea
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
              rows={3}
              placeholder="e.g. Financial hardship, scholarship, etc."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border resize-y text-slate-900 font-medium"
            />
            
            <div className="flex gap-3 justify-end mt-6">
              <button 
                onClick={() => setWaiveId(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors border-none cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={waive}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors border-none shadow-sm cursor-pointer"
              >
                Waive Fee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
