'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/menu', label: 'Menu' },
  { href: '/dashboard/qr', label: 'QR Code' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export default function DashboardNav({ menuUrl }: { menuUrl: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  function navLinkClass(href: string, mobile = false) {
    const base = mobile
      ? 'block px-3 py-2.5 text-sm rounded-lg transition-colors'
      : 'px-3 py-1.5 text-sm rounded-lg transition-colors'
    const active = 'bg-orange-50 text-orange-600 font-medium'
    const inactive = 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
    return `${base} ${isActive(href) ? active : inactive}`
  }

  return (
    <header className="bg-white border-b border-orange-100 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-orange-500 text-base tracking-tight">
            DigiMenu
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map(link => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={menuUrl}
            target="_blank"
            className="hidden sm:flex items-center gap-1 text-xs text-slate-500 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50"
          >
            View menu ↗
          </Link>
          <div className="hidden sm:block">
            <LogoutButton />
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="sm:hidden border-t border-orange-100 bg-white px-4 py-3 flex flex-col gap-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={navLinkClass(link.href, true)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-orange-100 mt-2 pt-2 flex items-center justify-between">
            <Link
              href={menuUrl}
              target="_blank"
              onClick={() => setOpen(false)}
              className="text-sm text-slate-500 hover:text-orange-500"
            >
              View menu ↗
            </Link>
            <LogoutButton />
          </div>
        </div>
      )}
    </header>
  )
}