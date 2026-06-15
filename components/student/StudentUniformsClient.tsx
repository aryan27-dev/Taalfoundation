'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface UniformItem { id: string; name: string; price: number; sizes: string[]; category: string; stock: number; description?: string }
interface OrderItem { item: UniformItem; size: string; quantity: number; price: number }
interface Order { id: string; totalAmount: number; status: string; orderedAt: string; items: OrderItem[] }

const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: 'rgba(249,115,22,0.1)', color: '#f97316' },
  CONFIRMED: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  READY: { bg: 'rgba(168,85,247,0.1)', color: '#a855f7' },
  DELIVERED: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  CANCELLED: { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
}

export default function StudentUniformsClient({ catalog, orders: initialOrders }: { catalog: UniformItem[]; orders: Order[] }) {
  const [tab, setTab] = useState<'shop' | 'orders'>('shop')
  const [orders, setOrders] = useState(initialOrders)
  const [cart, setCart] = useState<{ itemId: string; size: string; quantity: number }[]>([])
  const [loading, setLoading] = useState(false)

  function addToCart(itemId: string, size: string) {
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === itemId && c.size === size)
      if (existing) return prev.map((c) => c.itemId === itemId && c.size === size ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { itemId, size, quantity: 1 }]
    })
  }

  const cartTotal = cart.reduce((sum, c) => {
    const item = catalog.find((i) => i.id === c.itemId)
    return sum + (item?.price || 0) * c.quantity
  }, 0)

  async function placeOrder() {
    if (cart.length === 0) { toast.error('Cart is empty'); return }
    setLoading(true)
    const res = await fetch('/api/student/uniforms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    })
    setLoading(false)
    if (res.ok) {
      const order = await res.json()
      setOrders((prev) => [order, ...prev])
      setCart([])
      setTab('orders')
      toast.success('Order placed! The academy will contact you when it\'s ready.')
    } else toast.error('Failed to place order')
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem' }}>Uniforms & Accessories</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[{ key: 'shop', label: '🛍️ Shop' }, { key: 'orders', label: `📦 My Orders (${orders.length})` }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as 'shop' | 'orders')} style={{
            padding: '0.5rem 1.25rem', borderRadius: '999px', border: 'none', fontSize: '0.9rem',
            fontWeight: tab === key ? 700 : 500, cursor: 'pointer',
            background: tab === key ? '#0f172a' : '#f1f5f9', color: tab === key ? '#fff' : '#374151',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'shop' && (
        <>
          {/* Cart summary */}
          {cart.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg,#f97316,#fbbf24)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{cart.reduce((s, c) => s + c.quantity, 0)} items in cart</p>
                <p style={{ margin: '2px 0 0', color: 'rgba(15,23,42,0.65)', fontSize: '0.875rem' }}>Total: {formatCurrency(cartTotal)}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setCart([])} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'rgba(15,23,42,0.15)', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
                <button onClick={placeOrder} disabled={loading} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fbbf24', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Placing…' : 'Place Order'}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {catalog.map((item) => (
              <div key={item.id} style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{item.category}</span>
                  <span style={{ fontSize: '0.75rem', color: item.stock > 5 ? '#16a34a' : item.stock > 0 ? '#f97316' : '#ef4444', fontWeight: 600 }}>
                    {item.stock > 0 ? `${item.stock} left` : 'Out of stock'}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</h3>
                {item.description && <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#64748b' }}>{item.description}</p>}
                <p style={{ margin: '0 0 0.75rem', fontSize: '1.25rem', fontWeight: 700, color: '#f97316' }}>{formatCurrency(item.price)}</p>
                {item.stock > 0 && (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {item.sizes.map((size) => (
                      <button key={size} onClick={() => addToCart(item.id, size)} style={{
                        padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1.5px solid #e2e8f0',
                        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: '#f8fafc',
                        color: '#374151',
                      }}>{size}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {catalog.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              No items available yet
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => {
            const { bg, color } = statusColors[order.status] || { bg: '#f1f5f9', color: '#374151' }
            return (
              <div key={order.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Order · {formatDate(order.orderedAt)}</p>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: bg, color }}>{order.status}</span>
                </div>
                {order.items.map((oi, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#475569', padding: '0.25rem 0' }}>
                    <span>{oi.item.name} — Size {oi.size} × {oi.quantity}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(oi.price * oi.quantity)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <strong>Total: {formatCurrency(order.totalAmount)}</strong>
                </div>
              </div>
            )
          })}
          {orders.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              No orders yet. Browse the shop tab to order uniforms.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
