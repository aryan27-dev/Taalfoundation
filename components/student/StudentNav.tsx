'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { Search, Bell, User } from 'lucide-react'

const navItems = [
  { href: '/student/dashboard', label: 'Home' },
  { href: '/student/fees', label: 'Fees' },
  { href: '/student/attendance', label: 'Attendance' },
  { href: '/student/schedule', label: 'Schedule' },
  { href: '/student/events', label: 'Events' },
  { href: '/student/profile', label: 'Profile' },
]

export default function StudentNav({ userName }: { userName: string }) {
  const pathname = usePathname()

  return (
    <nav className="bg-[#111827] text-slate-200 sticky top-0 z-40 border-b border-slate-800 font-inter">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/student/dashboard" className="flex items-center gap-2 text-decoration-none mr-8">
          <span className="text-[#10b981] font-bold text-lg">Taal Foundation</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 h-full flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/') && item.href !== '/student/dashboard'
            return (
              <Link key={item.href} href={item.href} className={`
                flex items-center h-full text-[14px] font-medium transition-colors relative
                ${active ? 'text-[#10b981]' : 'text-slate-400 hover:text-slate-200'}
              `}>
                {item.label}
                {active && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#10b981] rounded-t-full" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-5">
          {/* Search bar */}
          <div className="hidden lg:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search resources..." 
              className="bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm rounded-full pl-9 pr-4 py-2 w-[240px] focus:outline-none focus:border-slate-600 focus:bg-slate-800 transition-colors"
            />
          </div>

          <button className="text-slate-400 hover:text-slate-200 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#111827]"></span>
          </button>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="hidden sm:block px-5 py-2 rounded-full border-none bg-blue-600 text-white text-[13px] font-semibold cursor-pointer transition-colors hover:bg-blue-700"
          >
            Sign Out
          </button>

          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 cursor-pointer hover:border-slate-500 transition-colors">
            <User size={16} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Mobile nav scrollable */}
      <div className="md:hidden border-t border-slate-800 flex overflow-x-auto px-4 py-2 gap-4 no-scrollbar">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={`
              flex flex-col items-center px-2 py-2 rounded-lg text-decoration-none text-[12px] font-medium whitespace-nowrap shrink-0
              ${active ? 'text-[#10b981] bg-[#10b981]/10' : 'text-slate-400'}
            `}>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
