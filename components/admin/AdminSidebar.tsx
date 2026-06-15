'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/students', label: 'Students', icon: '👥' },
  { href: '/admin/attendance', label: 'Attendance', icon: '✅' },
  { href: '/admin/fees', label: 'Fees', icon: '💰' },
  { href: '/admin/events', label: 'Events', icon: '🎭' },
  { href: '/admin/uniforms', label: 'Uniforms', icon: '👗' },
  { href: '/admin/announcements', label: 'Announcements', icon: '📢' },
  { href: '/admin/schedule', label: 'Schedule', icon: '🗓️' },
]

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      background: '#0f172a',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem',
        }}>
          <div style={{
            width: '36px', height: '36px', background: 'linear-gradient(45deg,#f97316,#fbbf24)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
          }}>🎭</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Taal Foundation</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflow: 'auto' }}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.7rem 0.875rem',
                borderRadius: '10px',
                marginBottom: '2px',
                fontSize: '0.9rem',
                fontWeight: active ? 600 : 400,
                color: active ? '#fbbf24' : 'rgba(248,250,252,0.75)',
                background: active ? 'rgba(251,191,36,0.12)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <span style={{ fontSize: '1.1rem', width: '20px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{adminName}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Administrator</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            width: '100%', padding: '0.6rem', borderRadius: '8px', border: 'none',
            background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: '0.85rem',
            fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s',
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
