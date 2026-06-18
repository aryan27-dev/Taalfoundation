'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, X, PackageOpen, Shirt, ArrowRight, Tag, Boxes, AlertCircle } from 'lucide-react'

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

const statusColors: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700 border-orange-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  READY: 'bg-purple-100 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
}

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all box-border text-slate-900"

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
    <div className="font-inter space-y-6 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 m-0">Uniforms & Accessories</h1>
          <p className="text-slate-500 mt-2 m-0 text-base">Manage catalog and student orders</p>
        </div>
        {tab === 'catalog' && (
          <button 
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm border-none"
          >
            <Plus size={18} /> Add Item
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl w-fit mb-6">
        {[
          { key: 'orders', label: `Orders (${orders.length})` }, 
          { key: 'catalog', label: `Catalog (${items.length})` }
        ].map(({ key, label }) => (
          <button 
            key={key} 
            onClick={() => setTab(key as 'orders' | 'catalog')} 
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer border-none ${
              tab === key 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const statusClass = statusColors[order.status] || 'bg-slate-100 text-slate-700 border-slate-200'
            const nextStatus = STATUS_ORDER[STATUS_ORDER.indexOf(order.status) + 1]
            return (
              <div key={order.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start mb-5 flex-wrap gap-4">
                  <div>
                    <h3 className="m-0 text-lg font-bold text-slate-900 mb-1">{order.student.name}</h3>
                    <p className="m-0 text-sm font-medium text-slate-500">{order.student.email} <span className="mx-1.5 text-slate-300">•</span> {formatDate(order.orderedAt)}</p>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusClass}`}>
                      {order.status}
                    </span>
                    {nextStatus && nextStatus !== 'CANCELLED' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, nextStatus)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer border-none shadow-sm"
                      >
                        {nextStatus} <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <Shirt size={14} />
                          </div>
                          <span className="font-medium text-slate-700">
                            {item.item.name} <span className="text-slate-400 mx-1">|</span> Size {item.size} <span className="text-slate-400 mx-1">×</span> {item.quantity}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Amount</span>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            )
          })}
          
          {orders.length === 0 && (
            <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <PackageOpen size={32} />
              </div>
              <p className="m-0 font-medium">No orders yet.</p>
            </div>
          )}
        </div>
      )}

      {tab === 'catalog' && (
        <>
          {showAddItem && (
            <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 my-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="m-0 text-xl font-bold text-slate-900">Add Catalog Item</h2>
                  <button onClick={() => setShowAddItem(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 border-none bg-transparent cursor-pointer transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={addItem} className="flex flex-col gap-4">
                  {[
                    { label: 'Item Name *', key: 'name', placeholder: 'e.g. Practice Costume' },
                    { label: 'Price (₹) *', key: 'price', placeholder: 'e.g. 1200' },
                    { label: 'Stock Count', key: 'stock', placeholder: 'e.g. 50' },
                    { label: 'Available Sizes (comma-separated)', key: 'sizes', placeholder: 'e.g. XS,S,M,L,XL,XXL' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block font-semibold text-sm mb-1.5 text-slate-700">{label}</label>
                      <input 
                        value={itemForm[key as keyof typeof itemForm]} 
                        onChange={(e) => setItemForm({ ...itemForm, [key]: e.target.value })}
                        required={label.includes('*')} 
                        placeholder={placeholder}
                        className={inputClass} 
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block font-semibold text-sm mb-1.5 text-slate-700">Category</label>
                    <select 
                      value={itemForm.category} 
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      className={inputClass}
                    >
                      <option value="UNIFORM">Uniform</option>
                      <option value="ACCESSORY">Accessory</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3 justify-end mt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowAddItem(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors border-none cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors border-none shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Adding…' : 'Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4 gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    <Tag size={12} /> {item.category}
                  </span>
                  
                  {item.stock > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                      <Boxes size={12} /> {item.stock} in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                      <AlertCircle size={12} /> Out of stock
                    </span>
                  )}
                </div>
                
                <h3 className="m-0 text-lg font-bold text-slate-900 mb-2">{item.name}</h3>
                <p className="m-0 text-2xl font-bold text-slate-900 mb-6">{formatCurrency(item.price)}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <p className="m-0 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Available Sizes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.sizes.map(size => (
                      <span key={size} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-700">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {items.length === 0 && (
            <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center col-span-full">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Shirt size={32} />
              </div>
              <p className="m-0 font-medium">Catalog is empty. Click <strong>Add Item</strong> to expand it.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
