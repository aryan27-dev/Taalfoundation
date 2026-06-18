'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import { Megaphone, Plus, X, Globe, Users, Trash2, PowerOff, Power } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  isPublished: boolean
  targetBatch?: string | null
  createdAt: string
}

interface Batch { id: string; name: string }

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border text-slate-900"

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
    <div className="font-inter space-y-6 max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 m-0">Announcements</h1>
          <p className="text-slate-500 mt-2 m-0 text-base">Post notices for all students or specific batches</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm border-none"
        >
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="m-0 text-xl font-bold text-slate-900">New Announcement</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 border-none bg-transparent cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={add} className="flex flex-col gap-4">
              <div>
                <label className="block font-semibold text-sm mb-1.5 text-slate-700">Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  required 
                  placeholder="e.g. Class schedule update"
                  className={inputClass}
                />
              </div>
              
              <div>
                <label className="block font-semibold text-sm mb-1.5 text-slate-700">Content <span className="text-rose-500">*</span></label>
                <textarea 
                  value={form.content} 
                  onChange={(e) => setForm({ ...form, content: e.target.value })} 
                  required 
                  rows={5}
                  placeholder="Write the announcement here…"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border resize-y text-slate-900"
                />
              </div>
              
              <div>
                <label className="block font-semibold text-sm mb-1.5 text-slate-700">Target Audience</label>
                <select 
                  value={form.targetBatch} 
                  onChange={(e) => setForm({ ...form, targetBatch: e.target.value })}
                  className={inputClass}
                >
                  <option value="">All Students (Global)</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 mt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={form.isPublished} 
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-900">Publish immediately</span>
                </label>
              </div>
              
              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAdd(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors border-none shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Posting…' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {announcements.map((ann) => (
          <div key={ann.id} className={`bg-white rounded-2xl p-6 border shadow-sm transition-all ${ann.isPublished ? 'border-slate-200' : 'border-amber-200 bg-amber-50/30'}`}>
            <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
              <div>
                <div className="flex gap-3 items-center flex-wrap mb-2">
                  <h3 className="m-0 text-lg font-bold text-slate-900">{ann.title}</h3>
                  <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                    ann.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ann.isPublished ? 'Published' : 'Draft'}
                  </span>
                  
                  {ann.targetBatch ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                      <Users size={12} /> Batch Only
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      <Globe size={12} /> Global
                    </span>
                  )}
                </div>
                <p className="m-0 text-xs font-semibold text-slate-500 uppercase tracking-wider">{formatDate(ann.createdAt)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => togglePublish(ann)}
                  className={`px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                    ann.isPublished 
                      ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' 
                      : 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700'
                  }`}
                >
                  {ann.isPublished ? <><PowerOff size={14} /> Unpublish</> : <><Power size={14} /> Publish</>}
                </button>
                <button 
                  onClick={() => remove(ann.id)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Delete Announcement"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
            <p className="m-0 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
          </div>
        ))}
        
        {announcements.length === 0 && (
          <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Megaphone size={32} />
            </div>
            <p className="m-0 font-medium">No announcements yet. Click <strong>New Announcement</strong> to post one.</p>
          </div>
        )}
      </div>
    </div>
  )
}
