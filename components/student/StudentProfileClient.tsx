'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatDate, formatCurrency } from '@/lib/utils'

interface User {
  id: string; name: string; email: string; phone?: string; parentName?: string
  parentPhone?: string; address?: string; profilePhoto?: string; joinDate: string
  batch?: { name: string; schedule: string; instructor: string } | null
  feeStructure?: { currentAmount: number; baseAmount: number; incrementYear: number } | null
}

const input = {
  width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px',
  border: '1.5px solid #e2e8f0', fontSize: '0.9rem', background: '#f8fafc',
  outline: 'none', boxSizing: 'border-box' as const,
}

export default function StudentProfileClient({ user }: { user: User }) {
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ phone: user.phone || '', address: user.address || '', parentName: user.parentName || '', parentPhone: user.parentPhone || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/student/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setLoading(false)
    if (res.ok) { toast.success('Profile updated!'); setEditing(false) }
    else toast.error('Failed to update profile')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwForm.newPassword }) })
    setLoading(false)
    if (res.ok) { toast.success('Password changed!'); setChangingPassword(false); setPwForm({ currentPassword: '', newPassword: '', confirm: '' }) }
    else toast.error('Failed to change password')
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem' }}>My Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#f97316,#fbbf24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', color: '#fff', fontWeight: 700, flexShrink: 0,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</p>
              <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#64748b' }}>{user.email}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Joined {formatDate(user.joinDate)}</p>
            </div>
          </div>

          {/* Batch info */}
          {user.batch && (
            <div style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 2px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Batch</p>
              <p style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>{user.batch.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{user.batch.schedule} · {user.batch.instructor}</p>
            </div>
          )}

          {/* Fee info */}
          {user.feeStructure && (
            <div style={{ padding: '0.875rem', background: 'rgba(249,115,22,0.06)', borderRadius: '10px', border: '1px solid rgba(249,115,22,0.2)' }}>
              <p style={{ margin: '0 0 2px', fontSize: '0.75rem', fontWeight: 600, color: '#f97316', textTransform: 'uppercase' }}>Monthly Fee</p>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f97316' }}>{formatCurrency(user.feeStructure.currentAmount)}</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Base: {formatCurrency(user.feeStructure.baseAmount)} · {user.feeStructure.incrementYear} revision(s)</p>
            </div>
          )}
        </div>

        {/* Edit form */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Contact Details</h2>
            {!editing && <button onClick={() => setEditing(true)} style={{ padding: '0.4rem 0.875rem', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Edit</button>}
          </div>

          {editing ? (
            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 90000 00000' },
                { label: 'Address', key: 'address', type: 'text', placeholder: 'Your address' },
                { label: 'Parent Name', key: 'parentName', type: 'text', placeholder: 'Parent / Guardian name' },
                { label: 'Parent Phone', key: 'parentPhone', type: 'tel', placeholder: '+91 90000 00000' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px', color: '#374151' }}>{label}</label>
                  <input type={type} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} style={input} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setEditing(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(45deg,#f97316,#fbbf24)', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}>
                  {loading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Phone', value: user.phone },
                { label: 'Address', value: user.address },
                { label: 'Parent Name', value: user.parentName },
                { label: 'Parent Phone', value: user.parentPhone },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ margin: '2px 0 0', color: value ? '#0f172a' : '#94a3b8' }}>{value || 'Not set'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change password */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Security</h2>
            {!changingPassword && <button onClick={() => setChangingPassword(true)} style={{ padding: '0.4rem 0.875rem', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Change Password</button>}
          </div>

          {changingPassword ? (
            <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'New Password', key: 'newPassword', placeholder: 'Minimum 8 characters' },
                { label: 'Confirm Password', key: 'confirm', placeholder: 'Repeat your password' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px', color: '#374151' }}>{label}</label>
                  <input type="password" value={pwForm[key as keyof typeof pwForm]} onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })} placeholder={placeholder} style={input} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setChangingPassword(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(45deg,#f97316,#fbbf24)', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}>
                  {loading ? 'Saving…' : 'Update Password'}
                </button>
              </div>
            </form>
          ) : (
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Your password was last updated when you first logged in. Keep it secure and do not share it with anyone.</p>
          )}
        </div>
      </div>
    </div>
  )
}
