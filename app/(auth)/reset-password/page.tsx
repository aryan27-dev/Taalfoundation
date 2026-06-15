'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Password updated! Redirecting…')
      setTimeout(() => router.push('/student/dashboard'), 1500)
    } else {
      const data = await res.json()
      toast.error(data.error || 'Something went wrong')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)', padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '24px',
        padding: '2.5rem', boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px', height: '56px', background: 'linear-gradient(45deg,#f97316,#fbbf24)',
            borderRadius: '16px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.5rem',
          }}>🔒</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Set Your Password</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            This is your first login. Please set a secure password.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'New Password', value: password, setter: setPassword, placeholder: 'Minimum 8 characters' },
            { label: 'Confirm Password', value: confirm, setter: setConfirm, placeholder: 'Repeat your password' },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem', color: '#374151' }}>
                {label}
              </label>
              <input
                type="password"
                value={value}
                onChange={(e) => setter(e.target.value)}
                required
                placeholder={placeholder}
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '1.5px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc',
                  outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#fbbf24' }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0' }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: '12px', border: 'none',
              background: loading ? '#e2e8f0' : 'linear-gradient(45deg,#f97316,#fbbf24)',
              color: loading ? '#94a3b8' : '#0f172a', fontWeight: 700, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem',
            }}
          >
            {loading ? 'Saving…' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
