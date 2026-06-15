'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

const navItems = [
  { href: '/student/dashboard', label: 'Home', icon: '🏠' },
  { href: '/student/fees', label: 'Fees', icon: '💰' },
  { href: '/student/attendance', label: 'Attendance', icon: '✅' },
  { href: '/student/schedule', label: 'Schedule', icon: '🗓️' },
  { href: '/student/events', label: 'Events', icon: '🎭' },
  { href: '/student/uniforms', label: 'Uniforms', icon: '👗' },
  { href: '/student/announcements', label: 'Notices', icon: '📢' },
  { href: '/student/profile', label: 'Profile', icon: '👤' },
]

export default function StudentNav({ userName }: { userName: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav style={{
      background: '#0f172a', color: '#f8fafc', position: 'sticky', top: 0, zIndex: 40,
      boxShadow: '0 2px 16px rgba(15,23,42,0.2)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        {/* Logo */}
        <Link href="/student/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.25rem' }}>🎭</span>
          <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1rem' }}>Taal Foundation</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="desktop-nav">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.75rem', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: active ? 600 : 400,
                color: active ? '#fbbf24' : 'rgba(248,250,252,0.75)',
                background: active ? 'rgba(251,191,36,0.1)' : 'transparent',
              }}>
                <span>{item.icon}</span> {item.label}
              </Link>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'rgba(248,250,252,0.6)', display: 'none' }} id="userName">{userName}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            style={{
              padding: '0.4rem 0.875rem', borderRadius: '8px', border: 'none',
              background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', overflowX: 'auto', padding: '0.5rem 0.75rem', gap: '0.25rem',
      }}>
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '0.4rem 0.75rem', borderRadius: '8px', textDecoration: 'none',
              fontSize: '0.7rem', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap', flexShrink: 0,
              color: active ? '#fbbf24' : 'rgba(248,250,252,0.65)',
              background: active ? 'rgba(251,191,36,0.1)' : 'transparent',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
