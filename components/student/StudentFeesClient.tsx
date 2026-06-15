'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Fee {
  id: string; amount: number; dueDate: string; paidDate?: string; status: string
  feeType: string; month?: string; razorpayPaymentId?: string; event?: { title: string } | null
}

const statusStyle: Record<string, { bg: string; color: string }> = {
  PAID: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  PENDING: { bg: 'rgba(249,115,22,0.1)', color: '#f97316' },
  OVERDUE: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  WAIVED: { bg: 'rgba(148,163,184,0.15)', color: '#64748b' },
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function StudentFeesClient({ fees: initial }: { fees: Fee[] }) {
  const [fees, setFees] = useState(initial)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [tab, setTab] = useState<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE'>('ALL')

  const filtered = tab === 'ALL' ? fees : fees.filter((f) => f.status === tab)
  const totalPending = fees.filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE').reduce((s, f) => s + f.amount, 0)
  const totalPaid = fees.filter((f) => f.status === 'PAID').reduce((s, f) => s + f.amount, 0)

  async function pay(fee: Fee) {
    setPayingId(fee.id)
    try {
      const res = await fetch('/api/fees/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeId: fee.id }),
      })
      if (!res.ok) { toast.error('Failed to initiate payment'); setPayingId(null); return }
      const { orderId, amount, currency, keyId } = await res.json()

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          order_id: orderId,
          name: 'Taal Foundation',
          description: `Fee Payment — ${fee.month || fee.feeType}`,
          theme: { color: '#f97316' },
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            const verify = await fetch('/api/fees/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                feeId: fee.id,
              }),
            })
            if (verify.ok) {
              setFees((prev) => prev.map((f) => f.id === fee.id ? { ...f, status: 'PAID', paidDate: new Date().toISOString(), razorpayPaymentId: response.razorpay_payment_id } : f))
              toast.success('Payment successful! Confirmation sent to your email.')
            } else {
              toast.error('Payment verification failed. Contact admin.')
            }
          },
          modal: { ondismiss: () => setPayingId(null) },
        })
        rzp.open()
      }
      document.body.appendChild(script)
    } catch {
      toast.error('Something went wrong')
      setPayingId(null)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem' }}>My Fees</h1>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Pending', value: formatCurrency(totalPending), color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
          { label: 'Total Paid', value: formatCurrency(totalPaid), color: '#16a34a', bg: 'rgba(34,197,94,0.08)' },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '14px', padding: '1.25rem', border: `1px solid ${s.color}30` }}>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['ALL', 'PENDING', 'PAID', 'OVERDUE'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.4rem 1rem', borderRadius: '999px', border: 'none', fontSize: '0.85rem',
            fontWeight: tab === t ? 700 : 500, cursor: 'pointer',
            background: tab === t ? '#0f172a' : '#f1f5f9', color: tab === t ? '#fff' : '#374151',
          }}>{t}</button>
        ))}
      </div>

      {/* Fee list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {filtered.map((fee) => {
          const { bg, color } = statusStyle[fee.status] || { bg: '#f1f5f9', color: '#374151' }
          const canPay = fee.status === 'PENDING' || fee.status === 'OVERDUE'
          return (
            <div key={fee.id} style={{
              background: '#fff', borderRadius: '14px', padding: '1.25rem',
              border: `1px solid ${canPay ? '#fbbf24' : '#e2e8f0'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                    {formatCurrency(fee.amount)}
                  </p>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: bg, color }}>
                    {fee.status}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  {fee.event ? fee.event.title : fee.month || fee.feeType.replace('_', ' ')}
                  {' · '}
                  {fee.status === 'PAID' ? `Paid ${formatDate(fee.paidDate!)}` : `Due ${formatDate(fee.dueDate)}`}
                </p>
                {fee.razorpayPaymentId && (
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>ID: {fee.razorpayPaymentId}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {canPay && (
                  <button
                    onClick={() => pay(fee)}
                    disabled={payingId === fee.id}
                    style={{
                      padding: '0.625rem 1.5rem', borderRadius: '10px', border: 'none',
                      background: 'linear-gradient(45deg,#f97316,#fbbf24)',
                      color: '#0f172a', fontWeight: 700, fontSize: '0.9rem',
                      cursor: payingId === fee.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    {payingId === fee.id ? 'Processing…' : 'Pay Now'}
                  </button>
                )}
                {fee.status === 'PAID' && (
                  <a
                    href={`/api/student/fees/${fee.id}/receipt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.625rem 1.25rem', borderRadius: '10px',
                      border: '1.5px solid #e2e8f0', background: '#fff',
                      color: '#374151', fontWeight: 600, fontSize: '0.875rem',
                      textDecoration: 'none', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}
                  >
                    ↓ Receipt
                  </a>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            No fees found in this category.
          </div>
        )}
      </div>
    </div>
  )
}
