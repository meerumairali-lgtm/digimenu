'use client'
import { useEffect, useRef, useState } from 'react'

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
  // Not in the database yet — included so the UI is ready the day
  // these columns and an upload flow exist. Safe to leave undefined.
  logo_url?: string
  cover_image_urls?: string[]
}

// ─────────────────────────────────────────────────────────────
// THEME TOKENS — same 4 theme keys as before (light/dark/gold/
// vibrant), restyled with a warmer, more contemporary palette.
// Every component below reads exclusively from this object, so
// changing a value here updates the whole page consistently.
// ─────────────────────────────────────────────────────────────
const themes: Record<string, {
  bg: string; surface: string; surfaceRaised: string; text: string; subtext: string
  border: string; accent: string; accentSoft: string; accentText: string
  navBg: string; navText: string; navMuted: string
  priceBg: string; priceText: string
  heroOverlayFrom: string; heroOverlayTo: string
  shadow: string
  font: string
}> = {
  light: {
    bg: '#FAF8F5', surface: '#FFFFFF', surfaceRaised: '#FFFFFF', text: '#1C1917', subtext: '#78716C',
    border: 'rgba(28,25,23,0.07)', accent: '#D97757', accentSoft: 'rgba(217,119,87,0.12)', accentText: '#FFFFFF',
    navBg: 'rgba(255,255,255,0.82)', navText: '#1C1917', navMuted: '#9C9893',
    priceBg: 'rgba(217,119,87,0.10)', priceText: '#B25B3F',
    heroOverlayFrom: 'rgba(20,16,14,0.15)', heroOverlayTo: 'rgba(20,16,14,0.78)',
    shadow: '0 8px 30px -8px rgba(28,25,23,0.12)',
    font: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },
  dark: {
    bg: '#16151A', surface: '#1F1E24', surfaceRaised: '#26252C', text: '#F2EFEA', subtext: '#9A968F',
    border: 'rgba(255,255,255,0.07)', accent: '#E8A33D', accentSoft: 'rgba(232,163,61,0.14)', accentText: '#16151A',
    navBg: 'rgba(22,21,26,0.78)', navText: '#F2EFEA', navMuted: '#75726C',
    priceBg: 'rgba(232,163,61,0.14)', priceText: '#E8A33D',
    heroOverlayFrom: 'rgba(0,0,0,0.2)', heroOverlayTo: 'rgba(10,9,7,0.88)',
    shadow: '0 8px 30px -8px rgba(0,0,0,0.5)',
    font: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },
  gold: {
    bg: '#0E0B05', surface: '#181206', surfaceRaised: '#201805', text: '#F5E6C8', subtext: '#A6936B',
    border: 'rgba(212,160,23,0.14)', accent: '#D4A017', accentSoft: 'rgba(212,160,23,0.14)', accentText: '#15110A',
    navBg: 'rgba(14,11,5,0.82)', navText: '#F5E6C8', navMuted: '#8A7A54',
    priceBg: 'rgba(212,160,23,0.14)', priceText: '#D4A017',
    heroOverlayFrom: 'rgba(0,0,0,0.25)', heroOverlayTo: 'rgba(8,6,2,0.9)',
    shadow: '0 8px 30px -8px rgba(0,0,0,0.6)',
    font: '"Georgia", "Iowan Old Style", serif',
  },
  vibrant: {
    bg: '#0F172A', surface: '#1A2436', surfaceRaised: '#202B40', text: '#F1F5F9', subtext: '#8B98AC',
    border: 'rgba(255,255,255,0.08)', accent: '#38BDF8', accentSoft: 'rgba(56,189,248,0.14)', accentText: '#0D1B2A',
    navBg: 'rgba(15,23,42,0.78)', navText: '#F1F5F9', navMuted: '#5B6B82',
    priceBg: 'rgba(255,107,91,0.14)', priceText: '#FF8A77',
    heroOverlayFrom: 'rgba(0,0,0,0.2)', heroOverlayTo: 'rgba(6,10,20,0.9)',
    shadow: '0 8px 30px -8px rgba(0,0,0,0.5)',
    font: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'

function socialBtn(bg: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 46, height: 46, borderRadius: '50%',
    background: bg, color: '#fff', textDecoration: 'none', flexShrink: 0,
    transition: `transform 0.2s ${EASE}`,
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
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /></svg>
}

// ─────────────────────────────────────────────────────────────
// AUTO-ROTATING HERO CAROUSEL
// Falls back to a single gradient panel if no cover images are
// set yet — designed so it looks complete either way.
// ─────────────────────────────────────────────────────────────
function HeroCarousel({ restaurant, t }: { restaurant: Restaurant; t: typeof themes.light }) {
  const images = restaurant.cover_image_urls?.filter(Boolean) || []
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length < 2) return
    const id = setInterval(() => setIndex(i => (i + 1) % images.length), 4500)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <div style={{ position: 'relative', height: 280, overflow: 'hidden', background: t.surface }}>
      {images.length > 0 ? (
        images.map((src, i) => (
          <div
            key={src + i}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: i === index ? 1 : 0,
              transition: `opacity 1s ${EASE}`,
            }}
          />
        ))
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 30% 20%, ${t.accentSoft}, transparent 60%), linear-gradient(160deg, ${t.surfaceRaised}, ${t.bg})`,
        }} />
      )}

      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, ${t.heroOverlayFrom} 0%, ${t.heroOverlayTo} 100%)`,
      }} />

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '0 24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        {restaurant.logo_url ? (
          <img
            src={restaurant.logo_url}
            alt=""
            style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover', marginBottom: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.35)' }}
          />
        ) : (
          <div style={{
            width: 56, height: 56, borderRadius: 16, marginBottom: 14,
            background: t.accentSoft, color: t.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${t.border}`,
          }}>
            <PlateIcon />
          </div>
        )}
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.4px', lineHeight: 1.25 }}>
          {restaurant.name}
        </h1>
        {restaurant.tagline && (
          <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.5, maxWidth: 360 }}>
            {restaurant.tagline}
          </p>
        )}
      </div>

      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {images.map((_, i) => (
            <div key={i} style={{
              width: i === index ? 16 : 5, height: 5, borderRadius: 3,
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
// FLOATING PILL NAV — replaces the old edge-to-edge sticky bar.
// Sits inset from the viewport edges with a blurred glass look.
// ─────────────────────────────────────────────────────────────
function FloatingNav({
  view, onChange, hasAbout, hasContact, t,
}: {
  view: 'menu' | 'about' | 'contact'
  onChange: (v: 'menu' | 'about' | 'contact') => void
  hasAbout: boolean; hasContact: boolean
  t: typeof themes.light
}) {
  const items: { key: 'menu' | 'about' | 'contact'; label: string }[] = [
    { key: 'menu', label: 'Menu' },
    ...(hasAbout ? [{ key: 'about' as const, label: 'About' }] : []),
    ...(hasContact ? [{ key: 'contact' as const, label: 'Contact' }] : []),
  ]

  if (items.length < 2) return null

  return (
    <div style={{ position: 'sticky', top: 14, zIndex: 100, display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{
        display: 'inline-flex', gap: 2, padding: 4,
        background: t.navBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 999, border: `1px solid ${t.border}`,
        boxShadow: t.shadow,
      }}>
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            style={{
              padding: '9px 20px', border: 'none', borderRadius: 999,
              background: view === item.key ? t.accent : 'transparent',
              color: view === item.key ? t.accentText : t.navMuted,
              fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
              fontFamily: t.font, transition: `all 0.25s ${EASE}`,
            }}
          >{item.label}</button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CATEGORY PILLS — horizontal scroll filter row
// ─────────────────────────────────────────────────────────────
function CategoryPills({
  categories, active, onSelect, t,
}: {
  categories: Category[]; active: string; onSelect: (id: string) => void; t: typeof themes.light
}) {
  if (categories.length < 2) return null
  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 20px 4px',
      scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
    }}>
      {categories.map(cat => {
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
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
  )
}

// ─────────────────────────────────────────────────────────────
// ITEM DETAIL POPUP — bottom sheet on mobile, centered card on
// wider viewports (handled with a max-width + auto margins, no
// separate breakpoint logic needed since the sheet just centers
// itself once there's room).
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
          marginBottom: 0,
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
            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 600, color: t.text, lineHeight: 1.35, flex: 1 }}>{item.name}</h2>
            <span style={{ fontWeight: 600, fontSize: 16, color: t.priceText, background: t.priceBg, padding: '7px 14px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {currency} {item.price}
            </span>
          </div>
          {item.description && (
            <p style={{ margin: '14px 0 0', fontSize: 14.5, color: t.subtext, lineHeight: 1.65 }}>{item.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SWIPE LAYOUT — horizontal snapping carousel per category
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
      <h2 style={{ margin: '0 0 12px', padding: '0 20px', fontSize: 13, fontWeight: 600, letterSpacing: '0.3px', color: t.text }}>{category.name}</h2>
      <div style={{ padding: '0 20px' }}>
        <div ref={scrollRef} onScroll={handleScroll} style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none' as any, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' as any }}>
          {items.map((item) => (
            <div
              key={item.id} onClick={() => onItemClick(item)}
              style={{
                width: 'calc(100% - 32px)', minWidth: 'calc(100% - 32px)', flexShrink: 0, scrollSnapAlign: 'center',
                background: t.surface, borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                border: `1px solid ${t.border}`, boxShadow: t.shadow,
                transition: `transform 0.25s ${EASE}`,
              }}
            >
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: 190, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlateIcon /></div>
              )}
              <div style={{ padding: '16px 18px 20px' }}>
                <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 15.5, color: t.text, lineHeight: 1.3 }}>{item.name}</p>
                {item.description && <p style={{ margin: '0 0 12px', fontSize: 13, color: t.subtext, lineHeight: 1.5 }}>{item.description}</p>}
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

export default function MenuClient({ restaurant, categories }: {
  restaurant: Restaurant
  categories: Category[]
}) {
  const t = themes[restaurant.theme || 'light']
  const currency = restaurant.currency || 'PKR'
  const layout = restaurant.layout || 'classic'

  // Replaces the old scroll-spy across one long page: the whole
  // app is one of three discrete views, switched with local state.
  // No route change, no scroll position to track between sections.
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

  function scrollToCategory(id: string) {
    setActiveCategory(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function changeView(next: 'menu' | 'about' | 'contact') {
    setView(next)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }

  // ── ABOUT PANEL ────────────────────────────────────────────
  const AboutPanel = () => (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 20px 56px' }}>
      <PanelHeader title="About us" onBack={() => changeView('menu')} t={t} />

      {restaurant.about && (
        <div style={{ background: t.surface, borderRadius: 20, padding: 22, marginBottom: 18, border: `1px solid ${t.border}` }}>
          <p style={{ margin: 0, fontSize: 14.5, color: t.subtext, lineHeight: 1.75 }}>{restaurant.about}</p>
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

  // ── CONTACT PANEL ──────────────────────────────────────────
  const ContactPanel = () => (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 20px 56px' }}>
      <PanelHeader title="Contact and find us" onBack={() => changeView('menu')} t={t} />

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

  function PanelHeader({ title, onBack, t }: { title: string; onBack: () => void; t: typeof themes.light }) {
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

  // ── MENU VIEW ──────────────────────────────────────────────
  const MenuView = () => (
    <div>
      <CategoryPills categories={availableCategories} active={activeCategory} onSelect={scrollToCategory} t={t} />

      <div style={{ maxWidth: layout === 'cards' ? 640 : 600, margin: '0 auto', padding: layout === 'swipe' ? '0 0 48px' : '8px 20px 48px' }}>

        {layout === 'classic' && availableCategories.map(category => {
          const items = category.menu_items.filter(i => i.is_available)
          return (
            <div key={category.id} id={category.id} ref={el => { sectionRefs.current[category.id] = el }} style={{ paddingTop: 32 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, letterSpacing: '0.3px', color: t.text }}>{category.name}</h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map(item => (
                  <div
                    key={item.id} onClick={() => setSelectedItem(item)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px 4px', cursor: 'pointer',
                      transition: `background 0.2s ${EASE}`, borderRadius: 14,
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: 16 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: t.text }}>{item.name}</p>
                      {item.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: t.subtext, lineHeight: 1.5 }}>{item.description}</p>}
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
              <h2 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, letterSpacing: '0.3px', color: t.text }}>{category.name}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(item => (
                  <div
                    key={item.id} onClick={() => setSelectedItem(item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: t.surface, borderRadius: 18, padding: '12px 14px', cursor: 'pointer',
                      border: `1px solid ${t.border}`, transition: `transform 0.2s ${EASE}, box-shadow 0.2s ${EASE}`,
                    }}
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: 68, height: 68, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 68, height: 68, borderRadius: 14, background: t.accentSoft, color: t.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlateIcon /></div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: t.text }}>{item.name}</p>
                      {item.description && <p style={{ margin: '3px 0 8px', fontSize: 12.5, color: t.subtext, lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{item.description}</p>}
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
              <h2 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, letterSpacing: '0.3px', color: t.text }}>{category.name}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {items.map(item => (
                  <div
                    key={item.id} onClick={() => setSelectedItem(item)}
                    style={{
                      background: t.surface, borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer',
                      border: `1px solid ${t.border}`, boxShadow: t.shadow,
                      transition: `transform 0.25s ${EASE}`,
                    }}
                  >
                    <div style={{ overflow: 'hidden' }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 128, objectFit: 'cover', display: 'block', transition: `transform 0.4s ${EASE}` }} />
                      ) : (
                        <div style={{ width: '100%', height: 128, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlateIcon /></div>
                      )}
                    </div>
                    <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: t.text, lineHeight: 1.3 }}>{item.name}</p>
                      {item.description && <p style={{ margin: 0, fontSize: 12, color: t.subtext, lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{item.description}</p>}
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
      {selectedItem && <ItemPopup item={selectedItem} t={t} currency={currency} onClose={() => setSelectedItem(null)} />}

      <HeroCarousel restaurant={restaurant} t={t} />
      <FloatingNav view={view} onChange={changeView} hasAbout={hasAbout} hasContact={hasContact} t={t} />

      {view === 'menu' && <MenuView />}
      {view === 'about' && <AboutPanel />}
      {view === 'contact' && <ContactPanel />}

      <p style={{ textAlign: 'center', color: t.subtext, fontSize: 11, padding: '8px 0 36px', opacity: 0.45 }}>
        Powered by Menuberg
      </p>
    </div>
  )
}