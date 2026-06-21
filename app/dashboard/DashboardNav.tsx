'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { User, CreditCard, Shield, LogOut, ChevronDown } from 'lucide-react'
import LogoutButton from './LogoutButton'

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/menu', label: 'Menu' },
  { href: '/dashboard/qr', label: 'QR Code' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '/dashboard/support', label: 'Support' },
]

export default function DashboardNav({
  menuUrl,
  trialDaysLeft,
}: {
  menuUrl: string
  trialDaysLeft: number | null
}) {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

        {/* Right — trial badge + view menu + profile dropdown + hamburger */}
        <div className="flex items-center gap-2">
          {trialDaysLeft != null && (
            <Link
              href="/checkout"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#F59E0B',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              {trialDaysLeft === 0
                ? 'Trial ending — upgrade now'
                : `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left in trial`}
            </Link>
          )}

          <Link
            href={menuUrl}
            target="_blank"
            className="hidden sm:flex items-center gap-1 text-xs text-sky-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-sky-500/10"
          >
            View menu ↗
          </Link>

          {/* Profile avatar dropdown — desktop */}
          <div className="hidden sm:block relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-sky-500/10 transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: '#38BDF8', color: '#0D1B2A' }}
              >
                <User size={15} />
              </div>
              <ChevronDown size={14} className="text-sky-300" />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden shadow-xl"
                style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.15)' }}
              >
                <Link
                  href="/dashboard/account"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-sky-100 hover:bg-sky-500/10 transition-colors"
                >
                  <User size={16} className="text-sky-400" />
                  My Profile
                </Link>
                <Link
                  href="/dashboard/billing"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-sky-100 hover:bg-sky-500/10 transition-colors"
                >
                  <CreditCard size={16} className="text-sky-400" />
                  Billing &amp; Subscription
                </Link>
                <Link
                  href="/dashboard/account/security"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-sky-100 hover:bg-sky-500/10 transition-colors"
                >
                  <Shield size={16} className="text-sky-400" />
                  Security
                </Link>
                <div style={{ borderTop: '1px solid rgba(56,189,248,0.1)' }}>
                  <div className="px-4 py-3">
                    <LogoutButton />
                  </div>
                </div>
              </div>
            )}
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
          {trialDaysLeft != null && (
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-semibold rounded-lg mb-1"
              style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' }}
            >
              {trialDaysLeft === 0
                ? 'Trial ending — upgrade now'
                : `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left in trial`}
            </Link>
          )}

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

          <div className="border-t border-sky-900 mt-2 pt-2 flex flex-col gap-1">
            <Link
              href={menuUrl}
              target="_blank"
              onClick={() => setOpen(false)}
              className="text-sm text-sky-300 hover:text-white px-3 py-2"
            >
              View menu ↗
            </Link>
            <Link
              href="/dashboard/account"
              onClick={() => setOpen(false)}
              className="text-sm text-sky-200 px-3 py-2"
            >
              My Profile
            </Link>
            <Link
              href="/dashboard/billing"
              onClick={() => setOpen(false)}
              className="text-sm text-sky-200 px-3 py-2"
            >
              Billing &amp; Subscription
            </Link>
            <Link
              href="/dashboard/account/security"
              onClick={() => setOpen(false)}
              className="text-sm text-sky-200 px-3 py-2"
            >
              Security
            </Link>
            <div className="px-3 py-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}