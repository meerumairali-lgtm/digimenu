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
}

const themes: Record<string, {
  bg: string; surface: string; surfaceRaised: string; text: string; subtext: string
  border: string; accent: string; accentSoft: string; accentText: string
  navBg: string; navText: string; navMuted: string
  priceBg: string; priceText: string
  heroOverlayFrom: string; heroOverlayTo: string
  shadow: string; shadowHover: string
  font: string
}> = {
  light: {
    bg: '#F9F6F0', surface: '#FFFFFF', surfaceRaised: '#FFFFFF', text: '#1E1B18', subtext: '#6E6A66',
    border: 'rgba(30,27,24,0.06)', accent: '#E06B43', accentSoft: 'rgba(224,107,67,0.08)', accentText: '#FFFFFF',
    navBg: 'rgba(255,255,255,0.85)', navText: '#1E1B18', navMuted: '#948F8A',
    priceBg: 'rgba(224,107,67,0.08)', priceText: '#C8532B',
    heroOverlayFrom: 'rgba(30,27,24,0.1)', heroOverlayTo: 'rgba(18,16,14,0.75)',
    shadow: '0 4px 20px -4px rgba(30,27,24,0.04), 0 12px 40px -8px rgba(30,27,24,0.08)',
    shadowHover: '0 8px 30px -4px rgba(224,107,67,0.12), 0 20px 50px -12px rgba(30,27,24,0.16)',
    font: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  dark: {
    bg: '#0F0E13', surface: '#17161D', surfaceRaised: '#201F27', text: '#F5F4F7', subtext: '#9894A0',
    border: 'rgba(255,255,255,0.06)', accent: '#F0A93C', accentSoft: 'rgba(240,169,60,0.1)', accentText: '#0F0E13',
    navBg: 'rgba(15,14,19,0.82)', navText: '#F5F4F7', navMuted: '#6C6877',
    priceBg: 'rgba(240,169,60,0.12)', priceText: '#F0A93C',
    heroOverlayFrom: 'rgba(0,0,0,0.2)', heroOverlayTo: 'rgba(10,9,14,0.9)',
    shadow: '0 4px 24px -6px rgba(0,0,0,0.5), 0 16px 48px -12px rgba(0,0,0,0.7)',
    shadowHover: '0 8px 32px -4px rgba(240,169,60,0.15), 0 24px 60px -10px rgba(0,0,0,0.8)',
    font: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  gold: {
    bg: '#0B0906', surface: '#14100A', surfaceRaised: '#1C170F', text: '#F4E8D1', subtext: '#AA9C84',
    border: 'rgba(218,165,32,0.12)', accent: '#E1A926', accentSoft: 'rgba(225,169,38,0.1)', accentText: '#0B0906',
    navBg: 'rgba(11,9,6,0.85)', navText: '#F4E8D1', navMuted: '#7A6E59',
    priceBg: 'rgba(225,169,38,0.12)', priceText: '#E1A926',
    heroOverlayFrom: 'rgba(0,0,0,0.3)', heroOverlayTo: 'rgba(11,9,6,0.95)',
    shadow: '0 4px 24px -4px rgba(0,0,0,0.6)',
    shadowHover: '0 8px 36px -2px rgba(225,169,38,0.15), 0 20px 50px -8px rgba(0,0,0,0.8)',
    font: '"Playfair Display", "Georgia", serif',
  },
  vibrant: {
    bg: '#070F1E', surface: '#0F1A30', surfaceRaised: '#172440', text: '#F8FAFC', subtext: '#94A3B8',
    border: 'rgba(56,189,248,0.08)', accent: '#38BDF8', accentSoft: 'rgba(56,189,248,0.1)', accentText: '#070F1E',
    navBg: 'rgba(7,15,30,0.85)', navText: '#F8FAFC', navMuted: '#475569',
    priceBg: 'rgba(56,189,248,0.12)', priceText: '#38BDF8',
    heroOverlayFrom: 'rgba(0,0,0,0.2)', heroOverlayTo: 'rgba(7,15,30,0.92)',
    shadow: '0 4px 24px -6px rgba(0,0,0,0.4), 0 16px 40px -12px rgba(0,0,0,0.6)',
    shadowHover: '0 4px 30px -2px rgba(56,189,248,0.25), 0 20px 50px -10px rgba(0,0,0,0.7)',
    font: '"Plus Jakarta Sans", -apple-system, sans-serif',
  },
}

const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'
const TOPBAR_HEIGHT = 68

function nameFontSize(name: string): number {
  const len = name.length
  if (len <= 16) return 17
  if (len <= 24) return 15
  return 13
}

// Icons remain static structured assets
function CloseIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg> }
function PlateIcon() { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg> }
function MenuIconSvg() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg> }
function InfoIconSvg() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg> }
function ContactIconSvg() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l9 6 9-6M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg> }

function DescriptionText({ text, style }: { text: string; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p style={{ margin: 0, marginBottom: 6 }}>{children}</p>,
          ul: ({ children }) => <ul style={{ margin: '6px 0', paddingLeft: 16 }}>{children}</ul>,
          li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
          strong: ({ children }) => <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{children}</strong>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

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
      className="modern-topbar"
      style={{
        position: 'sticky', top: 0, zIndex: 200, height: TOPBAR_HEIGHT,
        background: t.navBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', transition: `background 0.3s ${EASE}`,
      }}
    >
      <button
        onClick={() => onChange('menu')}
        className="interactive-action"
        style={{
          display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
        }}
      >
        {restaurant.logo_url ? (
          <img src={restaurant.logo_url} alt="" style={{ width: 36, height: 36, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: t.accentSoft, color: t.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>
          </div>
        )}
        <span style={{
          fontWeight: 700, fontSize: nameFontSize(restaurant.name), color: t.navText, letterSpacing: '-0.3px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: t.font
        }}>{restaurant.name}</span>
      </button>

      {items.length > 1 && (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {items.map(item => {
            const isSelected = view === item.key
            return (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                className={`nav-pill-btn ${isSelected ? 'active' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', border: 'none', borderRadius: 99,
                  background: isSelected ? t.accent : 'transparent',
                  color: isSelected ? t.accentText : t.navMuted,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: t.font, transition: `all 0.25s ${EASE}`,
                }}
              >
                {item.icon}
                <span className="nav-label-text">{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function HeroCarousel({ restaurant, t }: { restaurant: Restaurant; t: typeof themes.light }) {
  const slides = (restaurant.hero_slides || []).filter(s => s.image_url)
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)

  useEffect(() => {
    if (slides.length < 2) return
    const id = setInterval(() => setIndex(i => (i + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [slides.length])

  function goTo(next: number) {
    setIndex((next + slides.length) % slides.length)
  }

  if (slides.length === 0) {
    return (
      <div style={{
        height: 240, background: `radial-gradient(circle at 50% 50%, ${t.accentSoft}, transparent 70%), ${t.surfaceRaised}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent,
      }}><PlateIcon /></div>
    )
  }

  const current = slides[index]

  return (
    <div
      style={{ position: 'relative', height: 320, overflow: 'hidden', background: t.surface, touchAction: 'pan-y' }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; touchDeltaX.current = 0 }}
      onTouchMove={e => { if (touchStartX.current !== null) touchDeltaX.current = e.touches[0].clientX - touchStartX.current }}
      onTouchEnd={() => { if (Math.abs(touchDeltaX.current) > 40) goTo(touchDeltaX.current < 0 ? index + 1 : index - 1); touchStartX.current = null }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.image_url + i}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${slide.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: i === index ? 1 : 0, transform: i === index ? 'scale(1)' : 'scale(1.04)',
            transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
          }}
        />
      ))}

      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${t.heroOverlayFrom} 0%, ${t.heroOverlayTo} 100%)` }} />

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 24px 32px', textAlign: 'left', zIndex: 3 }}>
        {current?.title && (
          <h1 style={{
            margin: '0 0 8px', color: '#FFFFFF', fontSize: 26, fontWeight: 800, lineHeight: 1.2,
            maxWidth: 400, letterSpacing: '-0.5px', textShadow: '0 4px 16px rgba(0,0,0,0.3)', fontFamily: t.font
          }}>{current.title}</h1>
        )}
        {current?.caption && (
          <p style={{
            margin: 0, color: 'rgba(255,255,255,0.80)', fontSize: 14, fontWeight: 400, lineHeight: 1.5,
            maxWidth: 360, textShadow: '0 2px 8px rgba(0,0,0,0.3)', fontFamily: t.font
          }}>{current.caption}</p>
        )}
      </div>

      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 32, right: 24, display: 'flex', gap: 6, zIndex: 4 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => goTo(i)} style={{
              width: i === index ? 24 : 6, height: 6, borderRadius: 3, cursor: 'pointer',
              background: i === index ? '#fff' : 'rgba(255,255,255,0.35)',
              transition: `all 0.3s ${EASE}`,
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

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
      paddingTop: 12, paddingBottom: 12, backdropFilter: 'blur(10px)'
    }}>
      <div
        ref={trackRef}
        style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '0 24px',
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
              className={`category-pill-btn ${isActive ? 'active' : ''}`}
              style={{
                flexShrink: 0, padding: '10px 20px', borderRadius: 99,
                border: `1px solid ${isActive ? 'transparent' : t.border}`,
                background: isActive ? t.accent : t.surface,
                color: isActive ? t.accentText : t.subtext,
                fontSize: 14, fontWeight: 600, fontFamily: t.font,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: `all 0.25s ${EASE}`,
              }}
            >
              {cat.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

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
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'modernFadeIn 0.25s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 500,
          background: t.surfaceRaised, borderRadius: '32px 32px 0 0',
          overflow: 'hidden', animation: `modernSlideUp 0.4s ${EASE}`,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: t.shadowHover, border: `1px solid ${t.border}`
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: 180, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlateIcon />
            </div>
          )}
          <button
            onClick={onClose}
            className="popup-close-btn"
            aria-label="Close"
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', border: 'none',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)', transition: `all 0.2s ${EASE}`
            }}
          ><CloseIcon /></button>
        </div>
        <div style={{ padding: '28px 28px 40px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: t.text, lineHeight: 1.3, letterSpacing: '-0.4px', fontFamily: t.font }}>{item.name}</h2>
            <span style={{ fontWeight: 700, fontSize: 16, color: t.priceText, background: t.priceBg, padding: '8px 16px', borderRadius: 12, whiteSpace: 'nowrap', flexShrink: 0, fontFamily: t.font }}>
              {currency} {item.price}
            </span>
          </div>
          {item.description && (
            <DescriptionText text={item.description} style={{ margin: '20px 0 0', fontSize: 15, color: t.subtext, lineHeight: 1.6, fontFamily: t.font }} />
          )}
        </div>
      </div>
    </div>
  )
}

function SwipeCategory({ category, items, t, currency, onItemClick }: {
  category: Category; items: MenuItem[]; t: typeof themes.light; currency: string
  onItemClick: (item: MenuItem) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function handleScroll() {
    const container = scrollRef.current
    if (!container) return
    const card = container.children[0] as HTMLElement
    if (!card) return
    const cardWidth = card.offsetWidth + 16
    const index = Math.round(container.scrollLeft / cardWidth)
    setActiveIndex(Math.min(Math.max(index, 0), items.length - 1))
  }

  if (!items[0]) return null

  return (
    <div style={{ paddingTop: 40 }}>
      <h2 style={{ margin: '0 0 16px', padding: '0 24px', fontSize: 14, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: t.subtext, fontFamily: t.font }}>{category.name}</h2>
      <div style={{ padding: '0 24px' }}>
        <div ref={scrollRef} onScroll={handleScroll} style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {items.map((item) => (
            <div
              key={item.id} onClick={() => onItemClick(item)}
              className="modern-interactive-card"
              style={{
                width: 'calc(100% - 40px)', minWidth: 'calc(100% - 40px)', flexShrink: 0, scrollSnapAlign: 'center',
                background: t.surface, borderRadius: 24, overflow: 'hidden', cursor: 'pointer',
                border: `1px solid ${t.border}`, boxShadow: t.shadow, transition: `all 0.3s ${EASE}`
              }}
            >
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: 160, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlateIcon /></div>
              )}
              <div style={{ padding: '20px 22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: t.text, lineHeight: 1.3, fontFamily: t.font }}>{item.name}</p>
                  <span style={{ fontWeight: 700, fontSize: 14, color: t.priceText, background: t.priceBg, padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap', fontFamily: t.font }}>{currency} {item.price}</span>
                </div>
                {item.description && <p style={{ margin: 0, fontSize: 13.5, color: t.subtext, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: t.font }}>{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MenuClient({ restaurant, categories }: { restaurant: Restaurant; categories: Category[] }) {
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
  }, [availableCategories, activeCategory])

  useEffect(() => {
    if (view !== 'menu') return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveCategory(entry.target.id)
        })
      },
      { rootMargin: `-${TOPBAR_HEIGHT + 80}px 0px -50% 0px`, threshold: 0 }
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
      const y = el.getBoundingClientRect().top + window.scrollY - TOPBAR_HEIGHT - 40
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ background: t.bg, minHeight: '100vh', color: t.text, fontFamily: t.font, transition: 'background 0.3s ease' }}>
      
      {/* 1,000/hr Global CSS Injector Engine Strategy */}
      <style>{`
        @keyframes modernFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modernSlideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .interactive-action { transition: transform 0.2s ${EASE}, opacity 0.2s ${EASE}; }
        .interactive-action:hover { opacity: 0.85; transform: scale(1.01); }
        .interactive-action:active { transform: scale(0.98); }

        .nav-pill-btn { position: relative; overflow: hidden; }
        .nav-pill-btn:not(.active):hover { background: ${t.border} !important; color: ${t.text} !important; }
        .nav-pill-btn:active { transform: scale(0.96); }

        @media (max-width: 640px) {
          .nav-label-text { display: none; }
          .nav-pill-btn { padding: 10px !important; }
        }

        .category-pill-btn:not(.active):hover { border-color: ${t.accent} !important; color: ${t.text} !important; }
        .category-pill-btn:active { transform: scale(0.95); }

        .modern-interactive-card { transition: transform 0.3s ${EASE}, box-shadow 0.3s ${EASE}, border-color 0.3s ${EASE} !important; }
        .modern-interactive-card:hover { transform: translateY(-6px); box-shadow: ${t.shadowHover} !important; border-color: rgba(224,107,67,0.2) !important; }
        .modern-interactive-card:active { transform: translateY(-2px) scale(0.99); }

        .popup-close-btn:hover { background: rgba(0,0,0,0.7) !important; transform: scale(1.08); }
        .popup-close-btn:active { transform: scale(0.92); }

        /* Classic Layout Grid Modernized */
        .modern-menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
          gap: 24px;
          padding: 0 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
      `}</style>

      <TopBar restaurant={restaurant} view={view} onChange={setView} hasAbout={hasAbout} hasContact={hasContact} t={t} />

      {view === 'menu' && (
        <>
          <HeroCarousel restaurant={restaurant} t={t} />
          <CategoryPills categories={availableCategories} active={activeCategory} onSelect={scrollToCategory} t={t} />
          
          <div style={{ paddingBottom: 80, paddingTop: 16 }}>
            {availableCategories.map(category => {
              const items = category.menu_items.filter(i => i.is_available)
              
              if (layout === 'swipe') {
                return (
                  <div key={category.id} id={category.id} ref={el => { sectionRefs.current[category.id] = el }}>
                    <SwipeCategory category={category} items={items} t={t} currency={currency} onItemClick={setSelectedItem} />
                  </div>
                )
              }

              return (
                <div key={category.id} id={category.id} ref={el => { sectionRefs.current[category.id] = el }} style={{ paddingTop: 48 }}>
                  <h2 style={{ maxWidth: 1200, margin: '0 auto 20px', padding: '0 24px', fontSize: 15, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: t.subtext }}>
                    {category.name}
                  </h2>
                  
                  <div className="modern-menu-grid">
                    {items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="modern-interactive-card"
                        style={{
                          background: t.surface, borderRadius: 20, border: `1px solid ${t.border}`,
                          boxShadow: t.shadow, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column'
                        }}
                      >
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                        )}
                        <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: t.text, lineHeight: 1.3 }}>{item.name}</h3>
                              <span style={{ fontSize: 14, fontWeight: 700, color: t.priceText, background: t.priceBg, padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap' }}>
                                {currency} {item.price}
                              </span>
                            </div>
                            {item.description && (
                              <p style={{ margin: 0, fontSize: 13.5, color: t.subtext, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Fallback View Placeholders polished with modern metrics */}
      {view !== 'menu' && (
        <div style={{ padding: '60px 24px', maxWidth: 600, margin: '0 auto', animation: 'modernSlideUp 0.4s ease' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{view === 'about' ? 'About Us' : 'Contact'}</h2>
          <p style={{ color: t.subtext, lineHeight: 1.6 }}>
            {view === 'about' ? restaurant.about || "Welcome to our establishment." : `Reach out to us at ${restaurant.phone || restaurant.email || 'our coordinates'}.`}
          </p>
        </div>
      )}

      {selectedItem && (
        <ItemPopup item={selectedItem} t={t} currency={currency} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}