'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      toast.error('Invalid email or password')
    } else {
      toast.success('Logged in!')
      // Let the server session determine the destination
      // The redirect page will read the session and forward to the right dashboard
      router.push('/auth/redirect')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px', height: '56px', background: 'linear-gradient(45deg,#f97316,#fbbf24)',
            borderRadius: '16px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.5rem',
          }}>🎭</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Taal Foundation</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>Student & Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem', color: '#374151' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#fbbf24'; e.target.style.boxShadow = '0 0 0 3px rgba(251,191,36,0.15)' }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#fbbf24'; e.target.style.boxShadow = '0 0 0 3px rgba(251,191,36,0.15)' }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: '-4px' }}>
            <a href="/forgot-password" style={{ fontSize: '0.85rem', color: '#f97316', fontWeight: 500 }}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: '12px', border: 'none',
              background: loading ? '#e2e8f0' : 'linear-gradient(45deg,#f97316,#fbbf24)',
              color: loading ? '#94a3b8' : '#0f172a', fontWeight: 700, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          Your credentials are provided by the academy admin.
        </p>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
          <a href="/" style={{ color: '#64748b', fontSize: '0.85rem' }}>← Back to website</a>
        </div>
      </div>
    </div>
  )
}
