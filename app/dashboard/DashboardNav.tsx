'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/menu', label: 'Menu' },
  { href: '/dashboard/qr', label: 'QR Code' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '/dashboard/support', label: 'Support' }, // add this
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
    const active = 'bg-sky-500/10 text-sky-400 font-medium'
    const inactive = 'text-sky-200 hover:bg-sky-500/10 hover:text-sky-300'
    return `${base} ${isActive(href) ? active : inactive}`
  }

  return (
    <header
      className="sticky top-0 z-20"
      style={{ background: '#0D1B2A', borderBottom: '1px solid rgba(56,189,248,0.15)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Left — logo + nav links */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Menuberg"
              width={44}
              height={44}
              style={{ objectFit: 'contain' }}
            />
            <div className="flex items-baseline gap-0.5">
              <span className="font-black text-white text-xl tracking-tight">Menuberg</span>
              <span className="text-sky-400 text-xs font-semibold">.com</span>
            </div>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map(link => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right — view menu + logout + hamburger */}
        <div className="flex items-center gap-2">
          <Link
            href={menuUrl}
            target="_blank"
            className="hidden sm:flex items-center gap-1 text-xs text-sky-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-sky-500/10"
          >
            View menu ↗
          </Link>
          <div className="hidden sm:block">
            <LogoutButton />
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-sky-200 transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-sky-200 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-sky-200 transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="sm:hidden px-4 py-3 flex flex-col gap-1"
          style={{ background: '#0D1B2A', borderTop: '1px solid rgba(56,189,248,0.15)' }}
        >
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
          <div className="border-t border-sky-900 mt-2 pt-2 flex items-center justify-between">
            <Link
              href={menuUrl}
              target="_blank"
              onClick={() => setOpen(false)}
              className="text-sm text-sky-300 hover:text-white"
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