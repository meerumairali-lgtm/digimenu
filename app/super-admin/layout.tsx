'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Store, Settings, FileText,
  Menu, X, ChevronRight, LogOut, ScrollText, Mail, Megaphone,
  LifeBuoy, // add this
} from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/super-admin/dashboard', icon: LayoutDashboard },
  { label: 'Restaurants', href: '/super-admin/restaurants', icon: Store },
  { label: 'Audit Logs', href: '/super-admin/audit', icon: ScrollText },
  { label: 'Content', href: '/super-admin/content', icon: FileText },
  { label: 'Emails', href: '/super-admin/emails', icon: Mail },
  { label: 'Announcements', href: '/super-admin/announcements', icon: Megaphone },
  { label: 'Support', href: '/super-admin/support', icon: LifeBuoy }, // add this
  { label: 'Settings', href: '/super-admin/settings', icon: Settings },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Menuberg" width={44} height={44} style={{ objectFit: 'contain' }} />
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-black text-white text-base tracking-tight">Menuberg</span>
                <span className="text-sky-400 text-xs font-semibold">.com</span>
              </div>
              <p className="text-xs text-sky-400 font-medium">Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  {item.label}
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut size={16} />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-xs text-gray-400">Admin Active</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}