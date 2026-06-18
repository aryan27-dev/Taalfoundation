'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface Fee {
  id: string; amount: number; dueDate: string; paidDate?: string; status: string
  feeType: string; month?: string; razorpayPaymentId?: string; event?: { title: string } | null
}

const statusStyle: Record<string, { bg: string; text: string; icon: any }> = {
  PAID: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  PENDING: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  OVERDUE: { bg: 'bg-rose-100', text: 'text-rose-700', icon: AlertCircle },
  WAIVED: { bg: 'bg-slate-100', text: 'text-slate-600', icon: CheckCircle2 },
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
          theme: { color: '#3b82f6' },
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
    <div className="font-inter">
      <h1 className="text-2xl font-bold text-slate-900 m-0 mb-6">My Fees</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider m-0">Total Pending</p>
          <p className="text-3xl font-bold text-rose-600 m-0 mt-2">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider m-0">Total Paid</p>
          <p className="text-3xl font-bold text-[#10b981] m-0 mt-2">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['ALL', 'PENDING', 'PAID', 'OVERDUE'] as const).map((t) => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors decoration-none border-none cursor-pointer ${
              tab === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Fee list */}
      <div className="space-y-4">
        {filtered.map((fee) => {
          const { bg, text, icon: Icon } = statusStyle[fee.status] || { bg: 'bg-slate-100', text: 'text-slate-600', icon: Clock }
          const canPay = fee.status === 'PENDING' || fee.status === 'OVERDUE'
          return (
            <div key={fee.id} className={`bg-white border ${canPay ? 'border-rose-200' : 'border-slate-200'} rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4`}>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-bold text-slate-900 text-lg m-0">
                    {formatCurrency(fee.amount)}
                  </p>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${bg} ${text}`}>
                    <Icon size={14} />
                    {fee.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 m-0 font-medium">
                  {fee.event ? fee.event.title : fee.month || fee.feeType.replace('_', ' ')}
                  <span className="mx-2">•</span>
                  {fee.status === 'PAID' ? `Paid on ${formatDate(fee.paidDate!)}` : `Due on ${formatDate(fee.dueDate)}`}
                </p>
                {fee.razorpayPaymentId && (
                  <p className="text-xs text-slate-400 m-0 mt-1">Transaction ID: {fee.razorpayPaymentId}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {canPay && (
                  <button
                    onClick={() => pay(fee)}
                    disabled={payingId === fee.id}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors decoration-none border-none ${
                      payingId === fee.id 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm'
                    }`}
                  >
                    {payingId === fee.id ? 'Processing…' : 'Pay Now'}
                  </button>
                )}
                {fee.status === 'PAID' && (
                  <a
                    href={`/api/student/fees/${fee.id}/receipt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm decoration-none flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Download size={16} /> Receipt
                  </a>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-slate-500 font-medium m-0">No fees found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}
