'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface UniformItem {
  id: string; name: string; description?: string; price: number; sizes: string[]
  category: string; isAvailable: boolean; stock: number; imageUrl?: string
}

interface OrderItem { item: UniformItem; size: string; quantity: number; price: number }

interface Order {
  id: string; totalAmount: number; status: string; orderedAt: string; notes?: string
  student: { id: string; name: string; email: string }
  items: OrderItem[]
}

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'READY', 'DELIVERED', 'CANCELLED']
const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: 'rgba(249,115,22,0.1)', color: '#f97316' },
  CONFIRMED: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  READY: { bg: 'rgba(168,85,247,0.1)', color: '#a855f7' },
  DELIVERED: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  CANCELLED: { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
}

const btn = (v: 'primary' | 'ghost' | 'danger' = 'primary') => ({
  padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontWeight: 600,
  fontSize: '0.85rem', cursor: 'pointer',
  background: v === 'primary' ? 'linear-gradient(45deg,#f97316,#fbbf24)' : v === 'danger' ? 'rgba(239,68,68,0.1)' : '#f1f5f9',
  color: v === 'primary' ? '#0f172a' : v === 'danger' ? '#ef4444' : '#374151',
})

export default function UniformsAdminClient({ items: initialItems, orders: initialOrders }: { items: UniformItem[]; orders: Order[] }) {
  const [tab, setTab] = useState<'orders' | 'catalog'>('orders')
  const [orders, setOrders] = useState(initialOrders)
  const [items, setItems] = useState(initialItems)
  const [showAddItem, setShowAddItem] = useState(false)
  const [loading, setLoading] = useState(false)
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', category: 'UNIFORM', sizes: 'XS,S,M,L,XL,XXL', stock: '' })

  async function updateOrderStatus(orderId: string, status: string) {
    const res = await fetch('/api/admin/uniforms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    })
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
      toast.success(`Order marked as ${status}`)
    } else toast.error('Failed to update')
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/uniforms/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...itemForm, price: Number(itemForm.price), stock: Number(itemForm.stock), sizes: itemForm.sizes.split(',').map((s) => s.trim()) }),
    })
    setLoading(false)
    if (res.ok) {
      const item = await res.json()
      setItems((prev) => [...prev, item])
      setShowAddItem(false)
      setItemForm({ name: '', description: '', price: '', category: 'UNIFORM', sizes: 'XS,S,M,L,XL,XXL', stock: '' })
      toast.success('Item added to catalog!')
    } else toast.error('Failed to add item')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Uniforms & Accessories</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage catalog and student orders</p>
        </div>
        {tab === 'catalog' && <button style={btn('primary')} onClick={() => setShowAddItem(true)}>+ Add Item</button>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[{ key: 'orders', label: `Orders (${orders.length})` }, { key: 'catalog', label: `Catalog (${items.length})` }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as 'orders' | 'catalog')} style={{
            padding: '0.5rem 1.25rem', borderRadius: '999px', border: 'none', fontSize: '0.9rem',
            fontWeight: tab === key ? 700 : 500, cursor: 'pointer',
            background: tab === key ? '#0f172a' : '#f1f5f9', color: tab === key ? '#fff' : '#374151',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => {
            const { bg, color } = statusColors[order.status] || { bg: '#f1f5f9', color: '#374151' }
            const nextStatus = STATUS_ORDER[STATUS_ORDER.indexOf(order.status) + 1]
            return (
              <div key={order.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{order.student.name}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{order.student.email} · {formatDate(order.orderedAt)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: bg, color }}>{order.status}</span>
                    {nextStatus && nextStatus !== 'CANCELLED' && (
                      <button style={{ ...btn('ghost'), padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => updateOrderStatus(order.id, nextStatus)}>
                        → {nextStatus}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.875rem' }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.25rem 0', color: '#475569' }}>
                      <span>{item.item.name} — Size {item.size} × {item.quantity}</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <strong>Total: {formatCurrency(order.totalAmount)}</strong>
                  </div>
                </div>
              </div>
            )
          })}
          {orders.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>No orders yet</div>}
        </div>
      )}

      {tab === 'catalog' && (
        <>
          {showAddItem && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px' }}>
                <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Add Catalog Item</h2>
                <form onSubmit={addItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Item Name *', key: 'name', placeholder: 'Practice Costume' },
                    { label: 'Price (₹) *', key: 'price', placeholder: '1200' },
                    { label: 'Stock Count', key: 'stock', placeholder: '50' },
                    { label: 'Available Sizes (comma-separated)', key: 'sizes', placeholder: 'XS,S,M,L,XL,XXL' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>{label}</label>
                      <input value={itemForm[key as keyof typeof itemForm]} onChange={(e) => setItemForm({ ...itemForm, [key]: e.target.value })}
                        required={label.includes('*')} placeholder={placeholder}
                        style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Category</label>
                    <select value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      style={{ width: '100%', padding: '0.625rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                      <option value="UNIFORM">Uniform</option>
                      <option value="ACCESSORY">Accessory</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="button" style={btn('ghost')} onClick={() => setShowAddItem(false)}>Cancel</button>
                    <button type="submit" style={btn('primary')} disabled={loading}>{loading ? 'Adding…' : 'Add Item'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {items.map((item) => (
              <div key={item.id} style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{item.category}</span>
                  <span style={{ fontSize: '0.75rem', color: item.stock > 0 ? '#16a34a' : '#ef4444', fontWeight: 600 }}>{item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}</span>
                </div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</h3>
                <p style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#f97316' }}>{formatCurrency(item.price)}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Sizes: {item.sizes.join(', ')}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
