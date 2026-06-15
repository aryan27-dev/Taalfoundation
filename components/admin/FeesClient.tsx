'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

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

const statusColors: Record<string, { bg: string; color: string }> = {
  PAID: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  PENDING: { bg: 'rgba(249,115,22,0.1)', color: '#f97316' },
  OVERDUE: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  WAIVED: { bg: 'rgba(148,163,184,0.15)', color: '#64748b' },
}

const btn = (v: 'primary' | 'ghost' | 'danger' = 'primary') => ({
  padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 600,
  fontSize: '0.85rem', cursor: 'pointer',
  background: v === 'primary' ? 'linear-gradient(45deg,#f97316,#fbbf24)' : v === 'danger' ? 'rgba(239,68,68,0.1)' : '#f1f5f9',
  color: v === 'primary' ? '#0f172a' : v === 'danger' ? '#ef4444' : '#374151',
})

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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Fees</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Collected this month: <strong style={{ color: '#22c55e' }}>{formatCurrency(collectedThisMonth)}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button style={btn('ghost')} onClick={remind} disabled={loading}>📧 Send Reminders</button>
          <button style={btn('primary')} onClick={generate} disabled={loading}>⚡ Generate This Month&apos;s Fees</button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {['PENDING', 'PAID', 'OVERDUE', 'WAIVED'].map((s) => {
          const stat = getStat(s)
          const { bg, color } = statusColors[s]
          return (
            <button key={s} onClick={() => setTab(s as typeof tab)} style={{
              padding: '1.25rem', borderRadius: '12px', background: tab === s ? bg : '#fff',
              border: `2px solid ${tab === s ? color : '#e2e8f0'}`, cursor: 'pointer', textAlign: 'left',
            }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{s}</p>
              <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 700, color }}>{formatCurrency(stat?._sum.amount || 0)}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{stat?._count || 0} fees</p>
            </button>
          )
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['ALL', 'PENDING', 'PAID', 'OVERDUE', 'WAIVED'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.4rem 1rem', borderRadius: '999px', border: 'none', fontSize: '0.85rem',
            fontWeight: tab === t ? 700 : 500, cursor: 'pointer',
            background: tab === t ? '#0f172a' : '#f1f5f9', color: tab === t ? '#fff' : '#374151',
          }}>{t}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Student', 'Month', 'Amount', 'Due Date', 'Status', 'Actions'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => {
              const { bg, color } = statusColors[f.status] || { bg: '#f1f5f9', color: '#374151' }
              return (
                <tr key={f.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{f.student.name}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{f.student.email}</p>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>{f.month || f.feeType.replace('_', ' ')}</td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{formatCurrency(f.amount)}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>{formatDate(f.dueDate)}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '999px', background: bg, color }}>{f.status}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    {f.status === 'PENDING' || f.status === 'OVERDUE' ? (
                      <button style={{ ...btn('ghost'), padding: '0.35rem 0.65rem', fontSize: '0.8rem' }} onClick={() => { setWaiveId(f.id); setWaiveReason('') }}>Waive</button>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No fees found</div>}
      </div>

      {/* Waive modal */}
      {waiveId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Waive Fee</h3>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>Reason for waiver *</label>
            <textarea
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
              rows={3}
              placeholder="e.g. Financial hardship, scholarship, etc."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button style={btn('ghost')} onClick={() => setWaiveId(null)}>Cancel</button>
              <button style={btn('danger')} onClick={waive}>Waive Fee</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
