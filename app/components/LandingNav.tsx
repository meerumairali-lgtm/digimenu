'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const name =
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'there'

        setUser({ name })
      }
    }

    checkUser()
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ]

  return (
    <header
      style={{
        background: '#0D1B2A',
        borderBottom: '1px solid rgba(56,189,248,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 1.5rem',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt="Menuberg"
            width={62}
            height={62}
            style={{
              objectFit: 'contain',
              width: '44px',
              height: '44px',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>Menuberg</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#38BDF8' }}>.com</span>
          </div>
        </Link>
        
        {/* Desktop nav links */}
        <nav
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 14,
                color: '#7DD3FC',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.background =
                  'rgba(56,189,248,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#7DD3FC'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {user ? (
            <>
              <span
                style={{
                  fontSize: 14,
                  color: '#7DD3FC',
                }}
              >
                Hi, {user.name}
              </span>

              <Link
                href="/dashboard"
                style={{
                  background: '#38BDF8',
                  color: '#0D1B2A',
                  padding: '7px 18px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Dashboard →
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  fontSize: 14,
                  color: '#7DD3FC',
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 8,
                }}
              >
                Log in
              </Link>

              <Link
                href="/signup"
                style={{
                  background: '#38BDF8',
                  color: '#0D1B2A',
                  padding: '7px 18px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Get started free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-nav"
          aria-label="Toggle menu"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              display: 'block',
              width: 22,
              height: 2,
              background: '#7DD3FC',
              borderRadius: 2,
              transition: 'all 0.2s',
              transform: menuOpen
                ? 'rotate(45deg) translate(5px, 5px)'
                : 'none',
            }}
          />

          <span
            style={{
              display: 'block',
              width: 22,
              height: 2,
              background: '#7DD3FC',
              borderRadius: 2,
              transition: 'all 0.2s',
              opacity: menuOpen ? 0 : 1,
            }}
          />

          <span
            style={{
              display: 'block',
              width: 22,
              height: 2,
              background: '#7DD3FC',
              borderRadius: 2,
              transition: 'all 0.2s',
              transform: menuOpen
                ? 'rotate(-45deg) translate(5px, -5px)'
                : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="mobile-nav"
          style={{
            background: '#112240',
            borderTop: '1px solid rgba(56,189,248,0.15)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: 15,
                color: '#7DD3FC',
                textDecoration: 'none',
                padding: '10px 12px',
                borderRadius: 8,
                display: 'block',
              }}
            >
              {link.label}
            </Link>
          ))}

          <div
            style={{
              borderTop: '1px solid rgba(56,189,248,0.15)',
              marginTop: 8,
              paddingTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {user ? (
              <>
                <span
                  style={{
                    fontSize: 14,
                    color: '#7DD3FC',
                    padding: '0 12px',
                  }}
                >
                  Hi, {user.name} 👋
                </span>

                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    background: '#38BDF8',
                    color: '#0D1B2A',
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                  }}
                >
                  Dashboard →
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontSize: 15,
                    color: '#7DD3FC',
                    textDecoration: 'none',
                    padding: '10px 12px',
                    borderRadius: 8,
                    display: 'block',
                  }}
                >
                  Log in
                </Link>

                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    background: '#38BDF8',
                    color: '#0D1B2A',
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'block',
                  }}
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .desktop-nav {
          display: flex !important;
        }

        .mobile-nav {
          display: none !important;
        }

        @media (max-width: 640px) {
          .desktop-nav {
            display: none !important;
          }

          .mobile-nav {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  )
}