'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShoppingBag, PackageSearch, Trash2, CheckCircle2 } from 'lucide-react'

interface UniformItem { id: string; name: string; price: number; sizes: string[]; category: string; stock: number; description?: string }
interface OrderItem { item: UniformItem; size: string; quantity: number; price: number }
interface Order { id: string; totalAmount: number; status: string; orderedAt: string; items: OrderItem[] }

const statusColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-orange-100', text: 'text-orange-700' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  READY: { bg: 'bg-purple-100', text: 'text-purple-700' },
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-700' },
  CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-700' },
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
    <div className="font-inter space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 m-0">Uniforms & Accessories</h1>

      <div className="flex gap-2">
        {[{ key: 'shop', label: 'Shop', icon: ShoppingBag }, { key: 'orders', label: `My Orders (${orders.length})`, icon: PackageSearch }].map(({ key, label, icon: Icon }) => (
          <button 
            key={key} 
            onClick={() => setTab(key as 'shop' | 'orders')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors decoration-none border-none cursor-pointer ${
              tab === key ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'shop' && (
        <div className="space-y-5">
          {/* Cart summary */}
          {cart.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div>
                <p className="font-bold text-blue-900 text-lg m-0 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-blue-600" />
                  {cart.reduce((s, c) => s + c.quantity, 0)} items in cart
                </p>
                <p className="text-blue-700 text-sm mt-1 m-0 font-medium">Total: {formatCurrency(cartTotal)}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setCart([])} 
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-slate-600 font-semibold text-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Trash2 size={14} /> Clear
                </button>
                <button 
                  onClick={placeOrder} 
                  disabled={loading} 
                  className={`px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors border-none shadow-sm flex items-center gap-1.5 ${
                    loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  }`}
                >
                  {loading ? 'Placing…' : <><CheckCircle2 size={16} /> Place Order</>}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {catalog.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
                    {item.category}
                  </span>
                  <span className={`text-xs font-bold ${item.stock > 5 ? 'text-[#10b981]' : item.stock > 0 ? 'text-orange-500' : 'text-rose-500'}`}>
                    {item.stock > 0 ? `${item.stock} left` : 'Out of stock'}
                  </span>
                </div>
                <h3 className="m-0 text-lg font-bold text-slate-900 mb-2">{item.name}</h3>
                {item.description && <p className="m-0 text-sm text-slate-500 mb-4 flex-1">{item.description}</p>}
                
                <div className="mt-auto">
                  <p className="m-0 text-xl font-bold text-slate-900 mb-4">{formatCurrency(item.price)}</p>
                  {item.stock > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.sizes.map((size) => (
                        <button 
                          key={size} 
                          onClick={() => addToCart(item.id, size)} 
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {catalog.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={32} />
              </div>
              <p className="text-slate-500 font-medium m-0">No items available yet.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.map((order) => {
            const { bg, text } = statusColors[order.status] || { bg: 'bg-slate-100', text: 'text-slate-700' }
            return (
              <div key={order.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                  <div>
                    <p className="m-0 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Placed</p>
                    <p className="m-0 text-sm font-medium text-slate-900 mt-1">{formatDate(order.orderedAt)}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${bg} ${text}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  {order.items.map((oi, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-slate-700 font-medium">
                        {oi.item.name} <span className="text-slate-400 mx-1">—</span> Size {oi.size} <span className="text-slate-400 mx-1">×</span> {oi.quantity}
                      </span>
                      <span className="font-bold text-slate-900">{formatCurrency(oi.price * oi.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-lg">Total</span>
                  <span className="font-bold text-blue-600 text-xl">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            )
          })}
          {orders.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                <PackageSearch size={32} />
              </div>
              <p className="text-slate-500 font-medium m-0">No orders yet. Browse the shop tab to order uniforms.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
