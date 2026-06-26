'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Users, CheckSquare, IndianRupee, Calendar, Shirt, Megaphone, Clock, LogOut, Layers } from 'lucide-react'
import Logo from '@/components/Logo'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/batches', label: 'Batches', icon: Layers },
  { href: '/admin/attendance', label: 'Attendance', icon: CheckSquare },
  { href: '/admin/fees', label: 'Fees', icon: IndianRupee },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/uniforms', label: 'Uniforms', icon: Shirt },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/schedule', label: 'Schedule', icon: Clock },
]

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-w-[256px] bg-[#111827] text-slate-300 flex flex-col h-screen sticky top-0 overflow-hidden font-inter">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Logo size={48} />
          <div>
            <p className="m-0 text-xs text-slate-500 font-medium">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 overflow-y-auto mt-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-[14px] transition-colors relative ${
                active 
                  ? 'bg-white/10 text-white font-medium' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#10b981] rounded-r-full" />
              )}
              <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? "text-[#10b981]" : ""} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 p-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <span className="text-slate-300 text-sm font-semibold">{adminName.charAt(0)}</span>
          </div>
          <div>
            <p className="m-0 text-[14px] font-semibold text-white truncate max-w-[120px]">{adminName}</p>
            <p className="m-0 text-xs text-slate-500">Administrator</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-none bg-rose-500/10 text-rose-400 text-[14px] font-semibold cursor-pointer transition-colors hover:bg-rose-500/20"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
