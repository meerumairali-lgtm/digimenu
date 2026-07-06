'use client'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  is_available: boolean
  image_url?: string
}

type Category = {
  id: string
  name: string
  menu_items: MenuItem[]
}

type HeroSlide = { image_url: string; title?: string; caption?: string }

type Restaurant = {
  id: string
  name: string
  slug: string
  tagline?: string
  phone?: string
  address?: string
  email?: string
  whatsapp?: string
  instagram?: string
  facebook?: string
  theme?: string
  currency?: string
  layout?: string
  about?: string
  opening_hours?: Record<string, { open: string; close: string; closed: boolean }>
  google_maps_url?: string
  logo_url?: string
  hero_slides?: HeroSlide[]
  cta_button?: {
    enabled: boolean
    type: 'call' | 'whatsapp' | 'reservation' | 'custom'
    label: string
    value: string
  }
}

const themes: Record<string, {
  bg: string; surface: string; surfaceRaised: string; text: string; subtext: string
  border: string; accent: string; accentSoft: string; accentText: string
  navBg: string; navText: string; navMuted: string
  priceBg: string; priceText: string
  heroOverlayFrom: string; heroOverlayTo: string
  shadow: string
  font: string; displayFont: string
}> = {
  light: {
    bg: 'linear-gradient(180deg, #FFFAF6 0%, #FDF1E7 100%)',
    surface: '#FFFFFF', surfaceRaised: '#FFFFFF', text: '#241C18', subtext: '#8A7B6F',
    border: 'rgba(36,28,24,0.08)',
    accent: 'linear-gradient(135deg, #FF9466 0%, #E2664A 100%)',
    accentSoft: 'rgba(226,102,74,0.10)', accentText: '#FFFFFF',
    navBg: 'rgba(255,252,249,0.85)', navText: '#241C18', navMuted: '#B5A89C',
    priceBg: 'linear-gradient(135deg, rgba(226,102,74,0.13), rgba(255,148,102,0.08))',
    priceText: '#C2502F',
    heroOverlayFrom: 'rgba(36,28,24,0.05)', heroOverlayTo: 'rgba(30,20,14,0.72)',
    shadow: '0 14px 40px -12px rgba(226,102,74,0.25), 0 4px 12px rgba(36,28,24,0.06)',
    font: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    displayFont: '"Fraunces", Georgia, serif',
  },
  dark: {
    bg: 'linear-gradient(160deg, #14131A 0%, #1B1A22 55%, #201C1F 100%)',
    surface: '#1E1D24', surfaceRaised: '#26242C', text: '#F5F1EA', subtext: '#96908A',
    border: 'rgba(255,255,255,0.06)',
    accent: 'linear-gradient(135deg, #F0A63A 0%, #E8823D 100%)',
    accentSoft: 'rgba(240,166,58,0.12)', accentText: '#1A1508',
    navBg: 'rgba(18,17,22,0.82)', navText: '#F5F1EA', navMuted: '#69645D',
    priceBg: 'linear-gradient(135deg, rgba(240,166,58,0.16), rgba(232,130,61,0.10))',
    priceText: '#F0A63A',
    heroOverlayFrom: 'rgba(0,0,0,0.05)', heroOverlayTo: 'rgba(8,7,5,0.85)',
    shadow: '0 16px 44px -14px rgba(240,166,58,0.22), 0 4px 14px rgba(0,0,0,0.4)',
    font: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    displayFont: '"Plus Jakarta Sans", -apple-system, sans-serif',
  },
  gold: {
    bg: 'linear-gradient(160deg, #0B0906 0%, #14100A 55%, #1A140B 100%)',
    surface: '#17130B', surfaceRaised: '#1F1810', text: '#F3E6C8', subtext: '#A9976E',
    border: 'rgba(212,175,90,0.14)',
    accent: 'linear-gradient(135deg, #E9C46A 0%, #C9942F 100%)',
    accentSoft: 'rgba(212,175,90,0.13)', accentText: '#1A1408',
    navBg: 'rgba(11,9,6,0.88)', navText: '#F3E6C8', navMuted: '#7A6C4B',
    priceBg: 'linear-gradient(135deg, rgba(233,196,106,0.16), rgba(201,148,47,0.10))',
    priceText: '#E9C46A',
    heroOverlayFrom: 'rgba(0,0,0,0.1)', heroOverlayTo: 'rgba(6,5,2,0.88)',
    shadow: '0 18px 48px -16px rgba(212,175,90,0.28), 0 4px 16px rgba(0,0,0,0.5)',
    font: '"Iowan Old Style", Georgia, serif',
    displayFont: '"Fraunces", Georgia, serif',
  },
  vibrant: {
    bg: 'linear-gradient(160deg, #0B1120 0%, #151233 55%, #1B1240 100%)',
    surface: '#1A1B33', surfaceRaised: '#22234A', text: '#F1F3FA', subtext: '#9098BE',
    border: 'rgba(255,255,255,0.08)',
    accent: 'linear-gradient(135deg, #38BDF8 0%, #A855F7 100%)',
    accentSoft: 'rgba(129,140,248,0.14)', accentText: '#0B0F24',
    navBg: 'rgba(11,17,32,0.8)', navText: '#F1F3FA', navMuted: '#585E82',
    priceBg: 'linear-gradient(135deg, rgba(255,110,199,0.16), rgba(129,140,248,0.12))',
    priceText: '#FF8AD8',
    heroOverlayFrom: 'rgba(0,0,0,0.05)', heroOverlayTo: 'rgba(6,7,18,0.85)',
    shadow: '0 18px 48px -14px rgba(129,140,248,0.3), 0 4px 16px rgba(0,0,0,0.4)',
    font: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    displayFont: '"Plus Jakarta Sans", -apple-system, sans-serif',
  },

  yellow: {
    bg: 'linear-gradient(180deg, #F7CB4D 0%, #F0BA2E 100%)',
    surface: '#FFF8E1', surfaceRaised: '#FFFDF5', text: '#1A1508', subtext: '#5C4A1E',
    border: 'rgba(26,21,8,0.14)',
    accent: 'linear-gradient(135deg, #E23D3D 0%, #A11D1D 100%)',
    accentSoft: 'rgba(214,40,40,0.12)', accentText: '#FFFFFF',
    navBg: 'rgba(247,203,77,0.92)', navText: '#1A1508', navMuted: '#8A7433',
    priceBg: 'linear-gradient(135deg, rgba(226,61,61,0.14), rgba(161,29,29,0.08))',
    priceText: '#A11D1D',
    heroOverlayFrom: 'rgba(26,21,8,0.1)', heroOverlayTo: 'rgba(20,16,6,0.78)',
    shadow: '0 14px 40px -12px rgba(26,21,8,0.28), 0 4px 12px rgba(26,21,8,0.1)',
    font: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    displayFont: '"Archivo Black", "Poppins", sans-serif',
  },
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const TOPBAR_HEIGHT = 58

// Restaurant name shrinks in steps as it gets longer, so long names
// stay fully visible (no ellipsis) instead of crowding the nav.
// Ellipsis remains as a final safety net only for extreme lengths.
function nameFontSize(name: string): number {
  const len = name.length
  if (len <= 16) return 15
  if (len <= 24) return 13
  if (len <= 32) return 12
  return 10.5
}

function socialBtn(bg: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 46, height: 46, borderRadius: '50%',
    background: bg, color: '#fff', textDecoration: 'none', flexShrink: 0,
  }
}

function WhatsAppIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
}
function InstagramIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
}
function FacebookIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
}
function PhoneIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
}
function MapPinIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
}
function EmailIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
}
function ClockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" /></svg>
}
function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
}
function BackIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
}
function PlateIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /></svg>
}
function MenuIconSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
}
function InfoIconSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>
}
function ContactIconSvg() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l9 6 9-6M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
}

// ─────────────────────────────────────────────────────────────
// Renders item descriptions with limited markdown: bold + bullet
// lists + line breaks only (no headings, no italic — kept simple
// on purpose, since descriptions are short). Used in spots where
// the full description is shown (popup, classic, swipe).
// ─────────────────────────────────────────────────────────────
function DescriptionText({ text, style }: { text: string; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
          ul: ({ children }) => <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{children}</ul>,
          li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
          strong: ({ children }) => <strong>{children}</strong>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

// Strips markdown symbols down to flat text for truncated previews
// (list/cards layouts use line-clamp, which doesn't play well with
// mixed block elements like a paragraph + bullet list together).
function flattenDescription(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // bold
    .replace(/^[-*]\s+/gm, '')         // bullet markers
    .replace(/\n+/g, ' ')              // line breaks -> space
    .trim()
}

// ─────────────────────────────────────────────────────────────
// TOP BAR — sticky at top: 0, always visible. Logo + name act as
// a "home" button (returns to menu view). Name font scales down
// for long names instead of truncating.
// ─────────────────────────────────────────────────────────────
function TopBar({
  restaurant, view, onChange, hasAbout, hasContact, t,
}: {
  restaurant: Restaurant
  view: 'menu' | 'about' | 'contact'
  onChange: (v: 'menu' | 'about' | 'contact') => void
  hasAbout: boolean; hasContact: boolean
  t: typeof themes.light
}) {
  const items: { key: 'menu' | 'about' | 'contact'; label: string; icon: React.ReactNode }[] = [
    { key: 'menu', label: 'Menu', icon: <MenuIconSvg /> },
    ...(hasAbout ? [{ key: 'about' as const, label: 'About', icon: <InfoIconSvg /> }] : []),
    ...(hasContact ? [{ key: 'contact' as const, label: 'Contact', icon: <ContactIconSvg /> }] : []),
  ]

  return (
    <div
      className="menuberg-topbar"
      style={{
        position: 'sticky', top: 0, zIndex: 200, height: TOPBAR_HEIGHT,
        background: t.navBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px',
      }}
    >
      <style>{`
        /* Desktop default: full text labels, no icons */
        .menuberg-nav-desktop { display: flex; }
        .menuberg-nav-mobile { display: none; }

        /* Below 640px: switch to icon + tiny label stack, since
           that's where a long restaurant name plus three text
           buttons starts to crowd the bar. */
        @media (max-width: 640px) {
          .menuberg-nav-desktop { display: none; }
          .menuberg-nav-mobile { display: flex; }
        }
      `}</style>

      <button
        onClick={() => onChange('menu')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
        }}
      >
        {restaurant.logo_url ? (
          <img src={restaurant.logo_url} alt="" style={{ width: 30, height: 30, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            background: t.accentSoft, color: t.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></svg>
          </div>
        )}
        <span style={{
          fontWeight: 600, fontSize: nameFontSize(restaurant.name), color: t.navText, letterSpacing: '-0.1px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{restaurant.name}</span>
      </button>

      {items.length > 1 && (
        <>
          {/* Desktop: full text pills, same treatment as before */}
          <div className="menuberg-nav-desktop" style={{ gap: 2, flexShrink: 0 }}>
            {items.map(item => (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: 999,
                  background: view === item.key ? t.accent : 'transparent',
                  color: view === item.key ? t.accentText : t.navMuted,
                  fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                  fontFamily: t.font, transition: `all 0.2s ${EASE}`,
                }}
              >{item.label}</button>
            ))}
          </div>

          {/* Mobile: icon + tiny label stacked, compact but unambiguous */}
          <div className="menuberg-nav-mobile" style={{ gap: 2, flexShrink: 0 }}>
            {items.map(item => (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '5px 9px', border: 'none', borderRadius: 10,
                  background: view === item.key ? t.accent : 'transparent',
                  color: view === item.key ? t.accentText : t.navMuted,
                  cursor: 'pointer', fontFamily: t.font,
                  transition: `all 0.2s ${EASE}`,
                }}
              >
                {item.icon}
                <span style={{ fontSize: 8.5, fontWeight: 600, lineHeight: 1 }}>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// HERO CAROUSEL — auto-rotates AND is manually swipeable. A swipe
// (or drag) interrupts the auto-timer and jumps straight to the
// target slide rather than waiting out the loop. Title (left,
// larger) + short description (left, smaller) per slide.
// ─────────────────────────────────────────────────────────────
function HeroCarousel({ restaurant, t }: { restaurant: Restaurant; t: typeof themes.light }) {
  const slides = (restaurant.hero_slides || []).filter(s => s.image_url)
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)

  useEffect(() => {
    if (slides.length < 2) return
    const id = setInterval(() => setIndex(i => (i + 1) % slides.length), 4500)
    return () => clearInterval(id)
  }, [slides.length, index])

  function goTo(next: number) {
    const wrapped = (next + slides.length) % slides.length
    setIndex(wrapped)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }
  function handleTouchEnd() {
    if (Math.abs(touchDeltaX.current) > 40) {
      // Swiped left -> next slide. Swiped right -> previous slide.
      goTo(touchDeltaX.current < 0 ? index + 1 : index - 1)
    }
    touchStartX.current = null
    touchDeltaX.current = 0
  }

  if (slides.length === 0) {
    return (
      <div style={{
        height: 220, background: `radial-gradient(circle at 30% 20%, ${t.accentSoft}, transparent 60%), linear-gradient(160deg, ${t.surfaceRaised}, ${t.bg})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent,
      }}><PlateIcon /></div>
    )
  }

  const current = slides[index]

  return (
    <div
      style={{ position: 'relative', height: 260, overflow: 'hidden', background: t.surface, touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.image_url + i}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${slide.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: i === index ? 1 : 0,
            transition: `opacity 0.6s ${EASE}`,
          }}
        />
      ))}

      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, ${t.heroOverlayFrom} 0%, ${t.heroOverlayTo} 100%)`,
      }} />

      {slides.length > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Previous"
            style={{
              position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: '50%', border: 'none',
              background: 'rgba(0,0,0,0.32)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
            }}
          ><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg></button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Next"
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              width: 32, height: 32, borderRadius: '50%', border: 'none',
              background: 'rgba(0,0,0,0.32)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
            }}
          ><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg></button>
        </>
      )}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 20px 24px', textAlign: 'left' }}>
        {current?.title && (
          <p style={{
            margin: '0 0 4px', color: '#FFFFFF', fontSize: 21, fontWeight: 700, lineHeight: 1.25,
            maxWidth: 320, textShadow: '0 2px 12px rgba(0,0,0,0.4)', fontFamily: t.displayFont,
          }}>{current.title}</p>
        )}
        {current?.caption && (
          <p style={{
            margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontWeight: 400, lineHeight: 1.45,
            maxWidth: 300, textShadow: '0 1px 8px rgba(0,0,0,0.4)',
          }}>{current.caption}</p>
        )}
      </div>

      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 10, right: 16, display: 'flex', gap: 6, zIndex: 2 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => goTo(i)} style={{
              width: i === index ? 16 : 5, height: 5, borderRadius: 3, cursor: 'pointer',
              background: i === index ? '#fff' : 'rgba(255,255,255,0.4)',
              transition: `all 0.3s ${EASE}`,
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CATEGORY PILLS — centered, sticky under the top bar, and now
// keeps the active pill scrolled into view automatically whether
// the active category changed by scrolling the page OR by a
// direct pill click.
// ─────────────────────────────────────────────────────────────
function CategoryPills({
  categories, active, onSelect, t,
}: {
  categories: Category[]; active: string; onSelect: (id: string) => void; t: typeof themes.light
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    const track = trackRef.current
    const pill = pillRefs.current[active]
    if (!track || !pill) return
    const trackRect = track.getBoundingClientRect()
    const pillRect = pill.getBoundingClientRect()
    // Only scroll if the active pill isn't already fully visible —
    // avoids fighting a scroll the user is mid-way through themselves.
    if (pillRect.left < trackRect.left || pillRect.right > trackRect.right) {
      const offset = pill.offsetLeft - (track.clientWidth - pill.clientWidth) / 2
      track.scrollTo({ left: offset, behavior: 'smooth' })
    }
  }, [active])

  if (categories.length < 2) return null
  return (
    <div style={{
      position: 'sticky', top: TOPBAR_HEIGHT, zIndex: 100,
      background: t.bg, borderBottom: `1px solid ${t.border}`,
      paddingTop: 10, paddingBottom: 10,
    }}>
      <div
        ref={trackRef}
        style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '0 20px',
          justifyContent: categories.length <= 4 ? 'center' : 'flex-start',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }}
      >
        {categories.map(cat => {
          const isActive = active === cat.id
          return (
            <button
              key={cat.id}
              ref={el => { pillRefs.current[cat.id] = el }}
              onClick={() => onSelect(cat.id)}
              style={{
                flexShrink: 0, padding: '8px 16px', borderRadius: 999,
                border: `1px solid ${isActive ? 'transparent' : t.border}`,
                background: isActive ? t.accent : t.surface,
                color: isActive ? t.accentText : t.subtext,
                fontSize: 13, fontWeight: 500, fontFamily: t.font,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: `all 0.2s ${EASE}`,
              }}
            >{cat.name}</button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ITEM DETAIL POPUP
// ─────────────────────────────────────────────────────────────
function ItemPopup({ item, t, currency, onClose }: {
  item: MenuItem; t: typeof themes.light; currency: string; onClose: () => void
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,9,8,0.55)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'menubergFadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes menubergFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes menubergSlideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: t.surfaceRaised, borderRadius: '28px 28px 0 0',
          overflow: 'hidden', animation: 'menubergSlideUp 0.35s cubic-bezier(0.32,0.72,0,1)',
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: 160, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlateIcon />
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(15,13,11,0.45)', border: 'none',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)',
            }}
          ><CloseIcon /></button>
        </div>
        <div style={{ padding: '22px 24px 36px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 600, color: t.text, lineHeight: 1.35, flex: 1, fontFamily: t.displayFont }}>{item.name}</h2>
            <span style={{ fontWeight: 600, fontSize: 16, color: t.priceText, background: t.priceBg, padding: '7px 14px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {currency} {item.price}
            </span>
          </div>
          {item.description && (
            <DescriptionText text={item.description} style={{ margin: '14px 0 0', fontSize: 14.5, color: t.subtext, lineHeight: 1.65 }} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SWIPE LAYOUT (menu items, unrelated to hero carousel)
// ─────────────────────────────────────────────────────────────
function SwipeCategory({ category, items, t, currency, onItemClick }: {
  category: Category; items: MenuItem[]; t: typeof themes.light; currency: string
  onItemClick: (item: MenuItem) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function scrollTo(index: number) {
    if (index < 0 || index >= items.length) return
    const container = scrollRef.current
    if (!container) return
    const card = container.children[index] as HTMLElement
    if (card) { container.scrollTo({ left: card.offsetLeft - 20, behavior: 'smooth' }); setActiveIndex(index) }
  }

  function handleScroll() {
    const container = scrollRef.current
    if (!container) return
    const card = container.children[0] as HTMLElement
    if (!card) return
    const cardWidth = card.offsetWidth + 12
    const index = Math.round(container.scrollLeft / cardWidth)
    setActiveIndex(Math.min(Math.max(index, 0), items.length - 1))
  }

  if (!items[0]) return null

  return (
    <div style={{ paddingTop: 32 }}>
      <div style={{ marginBottom: 14, padding: '0 20px' }}>
        <h2 style={{ margin: 0, fontSize: 12.5, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: t.text, fontFamily: t.displayFont }}>{category.name}</h2>
        <div style={{ width: 36, height: 3, borderRadius: 2, marginTop: 8, background: t.accent }} />
      </div>
      <div style={{ padding: '0 20px' }}>
        <div ref={scrollRef} onScroll={handleScroll} style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none' as any, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' as any }}>
          {items.map((item) => (
            <div
              key={item.id} onClick={() => onItemClick(item)}
              style={{
                width: 'calc(100% - 32px)', minWidth: 'calc(100% - 32px)', flexShrink: 0, scrollSnapAlign: 'center',
                background: t.surface, borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                border: `1px solid ${t.border}`, boxShadow: t.shadow,
              }}
            >
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: 190, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlateIcon /></div>
              )}
              <div style={{ padding: '16px 18px 20px' }}>
                <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 15.5, color: t.text, lineHeight: 1.3 }}>{item.name}</p>
                {item.description && <DescriptionText text={item.description} style={{ margin: '0 0 12px', fontSize: 13, color: t.subtext, lineHeight: 1.5 }} />}
                <span style={{ fontWeight: 600, fontSize: 14, color: t.priceText, background: t.priceBg, padding: '6px 13px', borderRadius: 8 }}>{currency} {item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {items.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
          {items.map((_, i) => (
            <div key={i} onClick={() => scrollTo(i)} style={{ width: activeIndex === i ? 18 : 6, height: 6, borderRadius: 3, background: activeIndex === i ? t.accent : t.border, cursor: 'pointer', transition: `all 0.25s ${EASE}` }} />
          ))}
        </div>
      )}
    </div>
  )
}

type CtaButton = {
  enabled: boolean
  type: 'call' | 'whatsapp' | 'reservation' | 'custom'
  label: string
  value: string
}

function CallIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
}
function CalendarIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
}
function LinkIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07l-1.5 1.5M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07l1.49-1.49" /></svg>
}

function ctaIcon(type: CtaButton['type']) {
  if (type === 'call') return <CallIcon />
  if (type === 'whatsapp') return <WhatsAppIcon />
  if (type === 'reservation') return <CalendarIcon />
  return <LinkIcon />
}

function ctaHref(cta: CtaButton) {
  if (cta.type === 'call') return `tel:${cta.value}`
  if (cta.type === 'whatsapp') return `https://wa.me/${cta.value.replace(/\D/g, '')}`
  return cta.value // reservation or custom: treat as a URL
}

function FloatingCTA({ cta, t }: { cta: CtaButton; t: typeof themes.light }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function expand() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  function scheduleCollapse() {
    closeTimer.current = setTimeout(() => setOpen(false), 2600)
  }
  function handleTap() {
    if (!open) { expand(); scheduleCollapse() }
  }

  return (
    
      <a href={ctaHref(cta)}
      target={cta.type === 'reservation' || cta.type === 'custom' ? '_blank' : undefined}
      rel="noopener noreferrer"
      onMouseEnter={expand}
      onMouseLeave={() => setOpen(false)}
      onClick={handleTap}
      style={{
        position: 'fixed', left: 18, bottom: 22, zIndex: 300,
        display: 'flex', alignItems: 'center',
        height: 52, minWidth: 52, borderRadius: 26,
        background: t.accent, color: t.accentText,
        textDecoration: 'none', overflow: 'hidden',
        boxShadow: '0 10px 30px -8px rgba(0,0,0,0.45)',
        transition: `all 0.35s ${EASE}`,
        paddingLeft: 15, paddingRight: open ? 20 : 15,
        cursor: 'pointer',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {ctaIcon(cta.type)}
      </span>
      <span style={{
        maxWidth: open ? 220 : 0, opacity: open ? 1 : 0,
        marginLeft: open ? 10 : 0, whiteSpace: 'nowrap', overflow: 'hidden',
        fontSize: 14, fontWeight: 600, transition: `all 0.35s ${EASE}`,
      }}>
        {cta.label}
      </span>
    </a>
  )
}

export default function MenuClient({ restaurant, categories }: {
  restaurant: Restaurant
  categories: Category[]
}) {
  const t = themes[restaurant.theme || 'light']
  const currency = restaurant.currency || 'PKR'
  const layout = restaurant.layout || 'classic'

  const [view, setView] = useState<'menu' | 'about' | 'contact'>('menu')
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const availableCategories = categories.filter(c => c.menu_items?.some(i => i.is_available))
  const hasAbout = !!(restaurant.about || restaurant.opening_hours)
  const hasContact = !!(restaurant.phone || restaurant.whatsapp || restaurant.email || restaurant.address || restaurant.instagram || restaurant.facebook)

  useEffect(() => {
    if (!activeCategory && availableCategories[0]) setActiveCategory(availableCategories[0].id)
  }, [availableCategories])

  useEffect(() => {
    if (view !== 'menu') return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveCategory(entry.target.id)
        })
      },
      { rootMargin: `-${TOPBAR_HEIGHT + 60}px 0px -60% 0px`, threshold: 0 }
    )
    availableCategories.forEach(c => {
      const el = sectionRefs.current[c.id]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [availableCategories, view])

  function scrollToCategory(id: string) {
    setActiveCategory(id)
    const el = sectionRefs.current[id]
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - TOPBAR_HEIGHT - 56
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  function changeView(next: 'menu' | 'about' | 'contact') {
    setView(next)
    window.scrollTo({ top: 0 })
  }

  function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
    return (
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: t.subtext, fontFamily: t.font,
        }}
      >
        <span style={{ display: 'flex', color: t.text }}><BackIcon /></span>
        <span style={{ fontSize: 19, fontWeight: 600, color: t.text }}>{title}</span>
      </button>
    )
  }

  const AboutPanel = () => (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 20px 56px' }}>
      <PanelHeader title="About us" onBack={() => changeView('menu')} />

      <h1 style={{ margin: '0 0 4px', fontSize: 27, fontWeight: 700, color: t.text, letterSpacing: '-0.3px', fontFamily: t.displayFont }}>{restaurant.name}</h1>
      {restaurant.tagline && (
        <p style={{ margin: '0 0 20px', fontSize: 14, color: t.subtext, lineHeight: 1.5 }}>{restaurant.tagline}</p>
      )}

      {restaurant.about && (
        <div style={{ background: t.surface, borderRadius: 20, padding: 22, marginBottom: 18, border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 14.5, color: t.subtext, lineHeight: 1.75 }}>
            <ReactMarkdown
              components={{
                h2: ({ children }) => <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: t.text }}>{children}</h2>,
                p: ({ children }) => <p style={{ margin: '0 0 10px' }}>{children}</p>,
                ul: ({ children }) => <ul style={{ margin: '0 0 10px', paddingLeft: 20 }}>{children}</ul>,
                li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                strong: ({ children }) => <strong style={{ color: t.text }}>{children}</strong>,
              }}
            >
              {restaurant.about}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {restaurant.opening_hours && (
        <div style={{ background: t.surface, borderRadius: 20, padding: 22, border: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ color: t.accent }}><ClockIcon /></span>
            <h3 style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: t.text, letterSpacing: '0.4px', textTransform: 'uppercase' }}>Opening hours</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {DAYS.map(day => {
              const hours = restaurant.opening_hours?.[day]
              const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
              const isToday = day === today
              return (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 12, background: isToday ? t.accentSoft : 'transparent' }}>
                  <span style={{ fontSize: 13.5, fontWeight: isToday ? 600 : 400, color: isToday ? t.accent : t.text }}>{day}</span>
                  <span style={{ fontSize: 13.5, color: hours?.closed ? t.subtext : (isToday ? t.accent : t.subtext), fontWeight: isToday ? 600 : 400 }}>
                    {!hours || hours.closed ? 'Closed' : `${hours.open} – ${hours.close}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  const ContactPanel = () => (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 20px 56px' }}>
      <PanelHeader title="Contact and find us" onBack={() => changeView('menu')} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {restaurant.address && (
          <div style={{ background: t.surface, borderRadius: 20, padding: 20, border: `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ color: t.accent, flexShrink: 0, marginTop: 2 }}><MapPinIcon /></span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 10px', fontSize: 14, color: t.text, lineHeight: 1.55 }}>{restaurant.address}</p>
                {restaurant.google_maps_url && (
                  <a href={restaurant.google_maps_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: t.accent, textDecoration: 'none', background: t.accentSoft, padding: '7px 14px', borderRadius: 999 }}>
                    Open in Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {(restaurant.phone || restaurant.whatsapp || restaurant.email) && (
          <div style={{ background: t.surface, borderRadius: 20, padding: 20, border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none' }}>
                <span style={{ color: t.accent }}><PhoneIcon /></span>
                <span style={{ fontSize: 14, color: t.text }}>{restaurant.phone}</span>
              </a>
            )}
            {restaurant.whatsapp && (
              <a href={`https://wa.me/${restaurant.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none' }}>
                <span style={{ color: '#25D366' }}><WhatsAppIcon /></span>
                <span style={{ fontSize: 14, color: t.text }}>WhatsApp</span>
              </a>
            )}
            {restaurant.email && (
              <a href={`mailto:${restaurant.email}`} style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none' }}>
                <span style={{ color: t.accent }}><EmailIcon /></span>
                <span style={{ fontSize: 14, color: t.text }}>{restaurant.email}</span>
              </a>
            )}
          </div>
        )}

        {(restaurant.instagram || restaurant.facebook) && (
          <div style={{ background: t.surface, borderRadius: 20, padding: 20, border: `1px solid ${t.border}` }}>
            <p style={{ margin: '0 0 14px', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: t.subtext }}>Follow us</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {restaurant.instagram && (
                <a href={`https://instagram.com/${restaurant.instagram}`} target="_blank" rel="noopener noreferrer" style={socialBtn('#E1306C')}><InstagramIcon /></a>
              )}
              {restaurant.facebook && (
                <a href={`https://facebook.com/${restaurant.facebook}`} target="_blank" rel="noopener noreferrer" style={socialBtn('#1877F2')}><FacebookIcon /></a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const MenuView = () => (
    <div>
      <HeroCarousel restaurant={restaurant} t={t} />
      <CategoryPills categories={availableCategories} active={activeCategory} onSelect={scrollToCategory} t={t} />

      <div style={{ maxWidth: layout === 'cards' ? 640 : 600, margin: '0 auto', padding: layout === 'swipe' ? '0 0 48px' : '8px 20px 48px' }}>

        {layout === 'classic' && availableCategories.map(category => {
          const items = category.menu_items.filter(i => i.is_available)
          return (
            <div key={category.id} id={category.id} ref={el => { sectionRefs.current[category.id] = el }} style={{ paddingTop: 32 }}>
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 12.5, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: t.text, fontFamily: t.displayFont }}>{category.name}</h2>
                <div style={{ width: 36, height: 3, borderRadius: 2, marginTop: 8, background: t.accent }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map(item => (
                  <div
                    key={item.id} onClick={() => setSelectedItem(item)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 4px', cursor: 'pointer', borderRadius: 14 }}
                  >
                    <div style={{ flex: 1, paddingRight: 16 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: t.text }}>{item.name}</p>
                      {item.description && <DescriptionText text={item.description} style={{ margin: '4px 0 0', fontSize: 13, color: t.subtext, lineHeight: 1.5 }} />}
                      <span style={{ display: 'inline-block', marginTop: 8, fontWeight: 600, fontSize: 13, color: t.priceText, background: t.priceBg, padding: '4px 11px', borderRadius: 7 }}>{currency} {item.price}</span>
                    </div>
                    {item.image_url && (
                      <img src={item.image_url} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {layout === 'list' && availableCategories.map(category => {
          const items = category.menu_items.filter(i => i.is_available)
          return (
            <div key={category.id} id={category.id} ref={el => { sectionRefs.current[category.id] = el }} style={{ paddingTop: 32 }}>
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 12.5, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: t.text, fontFamily: t.displayFont }}>{category.name}</h2>
                <div style={{ width: 36, height: 3, borderRadius: 2, marginTop: 8, background: t.accent }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(item => (
                  <div
                    key={item.id} onClick={() => setSelectedItem(item)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.surface, borderRadius: 18, padding: '12px 14px', cursor: 'pointer', border: `1px solid ${t.border}` }}
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: 68, height: 68, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 68, height: 68, borderRadius: 14, background: t.accentSoft, color: t.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlateIcon /></div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: t.text }}>{item.name}</p>
                      {item.description && <p style={{ margin: '3px 0 8px', fontSize: 12.5, color: t.subtext, lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{flattenDescription(item.description)}</p>}
                      <span style={{ fontWeight: 600, fontSize: 13, color: t.priceText, background: t.priceBg, padding: '4px 10px', borderRadius: 7 }}>{currency} {item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {layout === 'cards' && availableCategories.map(category => {
          const items = category.menu_items.filter(i => i.is_available)
          return (
            <div key={category.id} id={category.id} ref={el => { sectionRefs.current[category.id] = el }} style={{ paddingTop: 32 }}>
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 12.5, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: t.text, fontFamily: t.displayFont }}>{category.name}</h2>
                <div style={{ width: 36, height: 3, borderRadius: 2, marginTop: 8, background: t.accent }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {items.map(item => (
                  <div
                    key={item.id} onClick={() => setSelectedItem(item)}
                    style={{ background: t.surface, borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', border: `1px solid ${t.border}`, boxShadow: t.shadow }}
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 128, objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: 128, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlateIcon /></div>
                    )}
                    <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: t.text, lineHeight: 1.3 }}>{item.name}</p>
                      {item.description && <p style={{ margin: 0, fontSize: 12, color: t.subtext, lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{flattenDescription(item.description)}</p>}
                      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 12.5, color: t.priceText, background: t.priceBg, padding: '4px 10px', borderRadius: 7 }}>{currency} {item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {layout === 'swipe' && availableCategories.map(category => {
          const items = category.menu_items.filter(i => i.is_available)
          return <SwipeCategory key={category.id} category={category} items={items} t={t} currency={currency} onItemClick={setSelectedItem} />
        })}

      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.font }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      {selectedItem && <ItemPopup item={selectedItem} t={t} currency={currency} onClose={() => setSelectedItem(null)} />}

      <TopBar restaurant={restaurant} view={view} onChange={changeView} hasAbout={hasAbout} hasContact={hasContact} t={t} />

      {view === 'menu' && <MenuView />}
      {view === 'about' && <AboutPanel />}
      {view === 'contact' && <ContactPanel />}

      <p style={{ textAlign: 'center', color: t.subtext, fontSize: 11, padding: '8px 0 36px', opacity: 0.45 }}>
        Powered by Menuberg
      </p>

      {restaurant.cta_button?.enabled && restaurant.cta_button.value && restaurant.cta_button.label && (
        <FloatingCTA cta={restaurant.cta_button} t={t} />
      )}
    </div>
  )
}

