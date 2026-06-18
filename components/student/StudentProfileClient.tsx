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

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border text-slate-900"

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
    <div className="font-inter space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 m-0">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="m-0 text-lg font-bold text-slate-900">{user.name}</p>
              <p className="m-0 mt-1 text-sm text-slate-500 font-medium">{user.email}</p>
              <p className="m-0 mt-0.5 text-xs text-slate-400">Joined {formatDate(user.joinDate)}</p>
            </div>
          </div>

          {/* Batch info */}
          {user.batch && (
            <div className="p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
              <p className="m-0 mb-1 text-xs font-bold text-slate-500 uppercase tracking-wider">Batch</p>
              <p className="m-0 font-bold text-slate-900">{user.batch.name}</p>
              <p className="m-0 mt-1 text-sm text-slate-600">{user.batch.schedule} <span className="mx-1">•</span> {user.batch.instructor}</p>
            </div>
          )}

          {/* Fee info */}
          {user.feeStructure && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="m-0 mb-1 text-xs font-bold text-blue-600 uppercase tracking-wider">Monthly Fee</p>
              <p className="m-0 text-xl font-bold text-blue-700">{formatCurrency(user.feeStructure.currentAmount)}</p>
              <p className="m-0 mt-1 text-xs text-blue-500 font-medium">Base: {formatCurrency(user.feeStructure.baseAmount)} <span className="mx-1">•</span> {user.feeStructure.incrementYear} revision(s)</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Edit form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="m-0 text-lg font-bold text-slate-900">Contact Details</h2>
              {!editing && (
                <button 
                  onClick={() => setEditing(true)} 
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors border-none cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={saveProfile} className="flex flex-col gap-4">
                {[
                  { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 90000 00000' },
                  { label: 'Address', key: 'address', type: 'text', placeholder: 'Your address' },
                  { label: 'Parent Name', key: 'parentName', type: 'text', placeholder: 'Parent / Guardian name' },
                  { label: 'Parent Phone', key: 'parentPhone', type: 'tel', placeholder: '+91 90000 00000' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block font-semibold text-sm mb-1.5 text-slate-700">{label}</label>
                    <input 
                      type={type} 
                      value={form[key as keyof typeof form]} 
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })} 
                      placeholder={placeholder} 
                      className={inputClass} 
                    />
                  </div>
                ))}
                <div className="flex gap-3 justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={() => setEditing(false)} 
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors border-none cursor-pointer shadow-sm"
                  >
                    {loading ? 'Saving…' : 'Save Details'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Phone', value: user.phone },
                  { label: 'Address', value: user.address },
                  { label: 'Parent Name', value: user.parentName },
                  { label: 'Parent Phone', value: user.parentPhone },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="m-0 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className={`m-0 font-medium ${value ? 'text-slate-900' : 'text-slate-400'}`}>{value || 'Not set'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Change password */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="m-0 text-lg font-bold text-slate-900">Security</h2>
              {!changingPassword && (
                <button 
                  onClick={() => setChangingPassword(true)} 
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors border-none cursor-pointer"
                >
                  Update
                </button>
              )}
            </div>

            {changingPassword ? (
              <form onSubmit={changePassword} className="flex flex-col gap-4">
                {[
                  { label: 'New Password', key: 'newPassword', placeholder: 'Minimum 8 characters' },
                  { label: 'Confirm Password', key: 'confirm', placeholder: 'Repeat your password' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block font-semibold text-sm mb-1.5 text-slate-700">{label}</label>
                    <input 
                      type="password" 
                      value={pwForm[key as keyof typeof pwForm]} 
                      onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })} 
                      placeholder={placeholder} 
                      className={inputClass} 
                    />
                  </div>
                ))}
                <div className="flex gap-3 justify-end mt-2">
                  <button 
                    type="button" 
                    onClick={() => setChangingPassword(false)} 
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors border-none cursor-pointer shadow-sm"
                  >
                    {loading ? 'Saving…' : 'Update Password'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="m-0 text-slate-500 text-sm leading-relaxed">
                Your password was last updated when you first logged in. Keep it secure and do not share it with anyone.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
