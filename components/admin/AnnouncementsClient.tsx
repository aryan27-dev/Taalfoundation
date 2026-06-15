'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface Announcement {
  id: string
  title: string
  content: string
  isPublished: boolean
  targetBatch?: string | null
  createdAt: string
}

interface Batch { id: string; name: string }

const btn = (v: 'primary' | 'ghost' | 'danger' = 'primary') => ({
  padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 600,
  fontSize: '0.85rem', cursor: 'pointer',
  background: v === 'primary' ? 'linear-gradient(45deg,#f97316,#fbbf24)' : v === 'danger' ? 'rgba(239,68,68,0.1)' : '#f1f5f9',
  color: v === 'primary' ? '#0f172a' : v === 'danger' ? '#ef4444' : '#374151',
})

export default function AnnouncementsClient({ announcements: initial, batches }: { announcements: Announcement[]; batches: Batch[] }) {
  const [announcements, setAnnouncements] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', targetBatch: '', isPublished: true })

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, targetBatch: form.targetBatch || null }),
    })
    setLoading(false)
    if (res.ok) {
      const ann = await res.json()
      setAnnouncements((prev) => [ann, ...prev])
      setShowAdd(false)
      setForm({ title: '', content: '', targetBatch: '', isPublished: true })
      toast.success('Announcement posted!')
    } else toast.error('Failed to post')
  }

  async function remove(id: string) {
    if (!confirm('Delete this announcement?')) return
    const res = await fetch('/api/admin/announcements', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { setAnnouncements((prev) => prev.filter((a) => a.id !== id)); toast.success('Deleted') }
    else toast.error('Failed to delete')
  }

  async function togglePublish(ann: Announcement) {
    const res = await fetch('/api/admin/announcements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ann.id, isPublished: !ann.isPublished }),
    })
    if (res.ok) {
      setAnnouncements((prev) => prev.map((a) => a.id === ann.id ? { ...a, isPublished: !a.isPublished } : a))
      toast.success(ann.isPublished ? 'Unpublished' : 'Published')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Announcements</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Post notices for all students or specific batches</p>
        </div>
        <button style={btn('primary')} onClick={() => setShowAdd(true)}>+ New Announcement</button>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '560px' }}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>New Announcement</h2>
            <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Class schedule update"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Content *</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={5}
                  placeholder="Write the announcement here…"
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Target</label>
                <select value={form.targetBatch} onChange={(e) => setForm({ ...form, targetBatch: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                  <option value="">All Students</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Publish immediately</span>
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" style={btn('ghost')} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" style={btn('primary')} disabled={loading}>{loading ? 'Posting…' : 'Post Announcement'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {announcements.map((ann) => (
          <div key={ann.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: `1px solid ${ann.isPublished ? '#e2e8f0' : '#fde68a'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{ann.title}</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px',
                    background: ann.isPublished ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.2)',
                    color: ann.isPublished ? '#16a34a' : '#92400e' }}>
                    {ann.isPublished ? 'Published' : 'Draft'}
                  </span>
                  {ann.targetBatch && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                      Batch only
                    </span>
                  )}
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{formatDate(ann.createdAt)}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ ...btn('ghost'), padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => togglePublish(ann)}>
                  {ann.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button style={{ ...btn('danger'), padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => remove(ann.id)}>Delete</button>
              </div>
            </div>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{ann.content}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            No announcements yet.
          </div>
        )}
      </div>
    </div>
  )
}
