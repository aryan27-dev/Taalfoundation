'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (res.ok) { toast.success('OTP sent to your email'); setStep('otp') }
    else { const d = await res.json(); toast.error(d.error || 'No account found') }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword: password }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Password reset! Please log in.')
      router.push('/login')
    } else {
      const d = await res.json()
      toast.error(d.error || 'Invalid or expired OTP')
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
    border: '1.5px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  const btnStyle = {
    width: '100%', padding: '0.875rem', borderRadius: '12px', border: 'none',
    background: loading ? '#e2e8f0' : 'linear-gradient(45deg,#f97316,#fbbf24)',
    color: loading ? '#94a3b8' : '#0f172a', fontWeight: 700, fontSize: '1rem',
    cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)', padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(45deg,#f97316,#fbbf24)', borderRadius: '16px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📧</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {step === 'email' ? 'Reset Password' : 'Enter OTP'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            {step === 'email' ? 'We\'ll send a 6-digit OTP to your email.' : `Check your email ${email} for the OTP.`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={sendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem', color: '#374151' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Sending…' : 'Send OTP'}</button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem', color: '#374151' }}>6-Digit OTP</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} placeholder="123456" style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem', color: '#374151' }}>New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimum 8 characters" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem', color: '#374151' }}>Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Repeat your password" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Verifying…' : 'Reset Password'}</button>
            <button type="button" onClick={() => setStep('email')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}>← Try a different email</button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
          <a href="/login" style={{ color: '#64748b', fontSize: '0.85rem' }}>← Back to login</a>
        </div>
      </div>
    </div>
  )
}
