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
}

const themes: Record<string, {
  bg: string; surface: string; text: string; subtext: string
  border: string; accent: string; accentText: string
  tabBg: string; tabActiveText: string; tabText: string
  priceBg: string; priceText: string
  headerBg: string; headerText: string; headerSub: string
  navBg: string; navText: string; navActive: string
  font: string; categoryFont: string
  shadow: string; softShadow: string; cardShadow: string; ring: string; mutedSurface: string
}> = {
  light: {
    bg: '#f6f7fb', surface: '#ffffff', text: '#0e1116', subtext: '#6b7280',
    border: '#e9edf3', accent: '#38BDF8', accentText: '#ffffff',
    tabBg: '#ffffff', tabActiveText: '#0e1116', tabText: '#4b5563',
    priceBg: '#E9F6FF', priceText: '#0D1B2A',
    headerBg: '#0D1B2A', headerText: '#ffffff', headerSub: '#94a3b8',
    navBg: 'rgba(255,255,255,0.6)', navText: '#0e1116', navActive: '#38BDF8',
    font: '"Inter", -apple-system, sans-serif',
    categoryFont: '"Inter", sans-serif',
    shadow: '0 10px 30px rgba(13,27,42,0.08)',
    softShadow: '0 6px 18px rgba(13,27,42,0.06)',
    cardShadow: '0 12px 28px rgba(13,27,42,0.08)',
    ring: '0 0 0 8px rgba(56,189,248,0.12)',
    mutedSurface: '#f2f4f8'
  },
  dark: {
    bg: '#0b0c0f', surface: '#14161b', text: '#e8eaee', subtext: '#98a2b3',
    border: '#23262d', accent: '#38BDF8', accentText: '#00101a',
    tabBg: '#0f1115', tabActiveText: '#e8eaee', tabText: '#98a2b3',
    priceBg: '#0e2333', priceText: '#7dd3fc',
    headerBg: '#05070a', headerText: '#e8eaee', headerSub: '#9aa3b2',
    navBg: 'rgba(17,19,24,0.5)', navText: '#e8eaee', navActive: '#38BDF8',
    font: '"Inter", -apple-system, sans-serif',
    categoryFont: '"Inter", sans-serif',
    shadow: '0 10px 30px rgba(0,0,0,0.35)',
    softShadow: '0 6px 18px rgba(0,0,0,0.35)',
    cardShadow: '0 18px 40px rgba(0,0,0,0.45)',
    ring: '0 0 0 8px rgba(56,189,248,0.18)',
    mutedSurface: '#0e1014'
  },
  gold: {
    bg: '#0c0900', surface: '#151006', text: '#f2e7c7', subtext: '#c8b686',
    border: '#2a1e00', accent: '#d4a017', accentText: '#0b0700',
    tabBg: '#120e05', tabActiveText: '#f2e7c7', tabText: '#b79b66',
    priceBg: '#241a07', priceText: '#f1c24a',
    headerBg: '#080600', headerText: '#f1c24a', headerSub: '#c8b686',
    navBg: 'rgba(21,16,6,0.5)', navText: '#f2e7c7', navActive: '#d4a017',
    font: '"Georgia", serif',
    categoryFont: '"Georgia", serif',
    shadow: '0 10px 30px rgba(8,6,0,0.55)',
    softShadow: '0 6px 18px rgba(8,6,0,0.45)',
    cardShadow: '0 20px 44px rgba(8,6,0,0.6)',
    ring: '0 0 0 8px rgba(212,160,23,0.18)',
    mutedSurface: '#0a0701'
  },
  vibrant: {
    bg: '#0f172a', surface: '#131c2f', text: '#f1f5f9', subtext: '#94a3b8',
    border: '#22304a', accent: '#38BDF8', accentText: '#00101a',
    tabBg: '#0f172a', tabActiveText: '#e2e8f0', tabText: '#94a3b8',
    priceBg: '#0a2736', priceText: '#7dd3fc',
    headerBg: '#0b1224', headerText: '#ffffff', headerSub: '#94a3b8',
    navBg: 'rgba(19,28,47,0.5)', navText: '#f1f5f9', navActive: '#38BDF8',
    font: '"Inter", -apple-system, sans-serif',
    categoryFont: '"Inter", sans-serif',
    shadow: '0 10px 30px rgba(7,12,24,0.5)',
    softShadow: '0 6px 18px rgba(7,12,24,0.45)',
    cardShadow: '0 20px 44px rgba(7,12,24,0.6)',
    ring: '0 0 0 8px rgba(56,189,248,0.18)',
    mutedSurface: '#0b1326'
  },
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function socialBtn(bg: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 44, height: 44, borderRadius: 12,
    background: bg, color: '#fff', textDecoration: 'none', flexShrink: 0,
    boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s cubic-bezier(0.4,0,0.2,1)',
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

// Shared micro-interaction style helpers
const motion = {
  quick: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  snap: 'scroll 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
}

// ── ITEM DETAIL POPUP (Bottom Sheet / Desktop Popover) ─────────
function ItemPopup({ item, t, currency, onClose }: {
  item: MenuItem; t: any; currency: string; onClose: () => void
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
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeIn 0.18s ease-out',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes popIn { from { transform:translateY(8px) scale(0.98); opacity:0 } to { transform:translateY(0) scale(1); opacity:1 } }
        @media (min-width: 720px) {
          .sheetCard { border-radius: 20px !important; max-height: 80vh !important; margin-bottom: 6vh !important; }
        }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        className="sheetCard"
        style={{
          width: '100%', maxWidth: 720,
          background: t.surface,
          borderRadius: '18px 18px 0 0',
          overflow: 'hidden',
          boxShadow: t.cardShadow,
          maxHeight: '88vh',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              style={{
                width: '100%', height: 260, objectFit: 'cover', display: 'block',
                transition: motion.quick
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: 200, background: t.mutedSurface,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64
            }}>🍽️</div>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(0,0,0,0.5)', border: 'none',
              color: '#fff', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)',
              transition: motion.quick
            }}
          >✕</button>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: -12,
            display: 'flex', justifyContent: 'center'
          }}>
            <div style={{
              width: 48, height: 5, borderRadius: 999,
              background: 'rgba(255,255,255,0.7)'
            }} />
          </div>
        </div>
        <div style={{ padding: '20px 22px 26px', overflowY: 'auto' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16
          }}>
            <h2 style={{
              margin: 0, fontSize: 22, fontWeight: 800, color: t.text,
              lineHeight: 1.5, letterSpacing: '-0.2px', flex: 1
            }}>{item.name}</h2>
            <span style={{
              fontWeight: 800, fontSize: 16, color: t.priceText, background: t.priceBg,
              padding: '8px 14px', borderRadius: 12, whiteSpace: 'nowrap', flexShrink: 0,
              boxShadow: t.softShadow
            }}>
              {currency} {item.price}
            </span>
          </div>
          {item.description && (
            <p style={{
              margin: '12px 0 0', fontSize: 15, color: t.subtext,
              lineHeight: 1.6
            }}>{item.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── SWIPE CATEGORY (Natural mobile snapping) ───────────────────
function SwipeCategory({ category, items, t, currency, sectionRefs, onItemClick }: {
  category: Category; items: MenuItem[]; t: any; currency: string
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  onItemClick: (item: MenuItem) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hovered, setHovered] = useState(false)

  function scrollTo(index: number) {
    if (index < 0 || index >= items.length) return
    const container = scrollRef.current
    if (!container) return
    const card = container.children[index] as HTMLElement
    if (card) {
      container.scrollTo({ left: card.offsetLeft - 24, behavior: 'smooth' })
      setActiveIndex(index)
    }
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

  if (!items[activeIndex]) return null

  return (
    <div
      id={category.id}
      ref={el => { sectionRefs.current[category.id] = el }}
      style={{ paddingTop: 30 }}
    >
      <div style={{ padding: '0 18px', marginBottom: 10 }}>
        <h2 style={{
          margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '2px',
          textTransform: 'uppercase', color: t.accent, lineHeight: 1.5
        }}>{category.name}</h2>
      </div>

      <div
        style={{ position: 'relative', padding: '0 18px' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'flex', gap: 12, overflowX: 'auto',
            scrollbarWidth: 'none' as any,
            WebkitOverflowScrolling: 'touch' as any,
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            paddingBottom: 4
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick(item)}
              style={{
                width: 'calc(100% - 48px)', minWidth: 'calc(100% - 48px)', flexShrink: 0,
                scrollSnapAlign: 'center',
                background: `linear-gradient(180deg, ${t.surface} 0%, ${t.mutedSurface} 120%)`,
                borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                boxShadow: (t.cardShadow),
                transition: motion.quick
              }}
            >
              {item.image_url ? (
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{
                      width: '100%', height: 200, objectFit: 'cover', display: 'block',
                      transform: 'scale(1)', transition: 'transform 0.35s cubic-bezier(0.2,0.8,0.2,1)'
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%', height: 200, background: t.mutedSurface,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48
                }}>🍽️</div>
              )}
              <div style={{ padding: '14px 16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                  <p style={{
                    margin: 0, fontWeight: 700, fontSize: 16, color: t.text,
                    lineHeight: 1.5
                  }}>{item.name}</p>
                  <span style={{
                    fontWeight: 800, fontSize: 14, color: t.priceText, background: t.priceBg,
                    padding: '6px 12px', borderRadius: 10
                  }}>{currency} {item.price}</span>
                </div>
                {item.description && (
                  <p style={{
                    margin: '8px 0 0', fontSize: 13, color: t.subtext, lineHeight: 1.6
                  }}>{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {activeIndex > 0 && hovered && (
          <div
            onClick={() => scrollTo(activeIndex - 1)}
            style={{
              position: 'absolute', left: 6, top: 0, bottom: 0, width: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(to right, rgba(0,0,0,0.18), transparent)',
              cursor: 'pointer', color: '#fff', fontSize: 28, fontWeight: 300,
              borderRadius: 16, zIndex: 2, transition: motion.quick
            }}
          >‹</div>
        )}
        {activeIndex < items.length - 1 && hovered && (
          <div
            onClick={() => scrollTo(activeIndex + 1)}
            style={{
              position: 'absolute', right: 6, top: 0, bottom: 0, width: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(to left, rgba(0,0,0,0.18), transparent)',
              cursor: 'pointer', color: '#fff', fontSize: 28, fontWeight: 300,
              borderRadius: 16, zIndex: 2, transition: motion.quick
            }}
          >›</div>
        )}
      </div>

      {items.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, marginBottom: 6 }}>
          {items.map((_, i) => (
            <div
              key={i}
              onClick={() => scrollTo(i)}
              style={{
                width: activeIndex === i ? 20 : 8, height: 6, borderRadius: 999,
                background: activeIndex === i ? t.accent : t.border,
                cursor: 'pointer', transition: 'width 0.25s ease, background 0.25s ease',
                boxShadow: activeIndex === i ? t.softShadow : 'none'
              }}
            />
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
  const [activeSection, setActiveSection] = useState<'menu' | 'about' | 'contact'>('menu')
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const menuSectionRef = useRef<HTMLDivElement>(null)
  const aboutSectionRef = useRef<HTMLDivElement>(null)
  const contactSectionRef = useRef<HTMLDivElement>(null)

  const availableCategories = categories.filter(c => c.menu_items?.some(i => i.is_available))

  const hasAbout = !!(restaurant.about || restaurant.opening_hours)
  const hasContact = !!(restaurant.phone || restaurant.whatsapp || restaurant.email || restaurant.address || restaurant.instagram || restaurant.facebook)

  // Track active section on scroll
  useEffect(() => {
    function onScroll() {
      const sections = [
        { id: 'menu', ref: menuSectionRef },
        { id: 'about', ref: aboutSectionRef },
        { id: 'contact', ref: contactSectionRef },
      ]
      const scrollY = window.scrollY + 100
      let current: 'menu' | 'about' | 'contact' = 'menu'
      for (const section of sections) {
        if (!section.ref.current) continue
        if (section.ref.current.offsetTop <= scrollY) {
          current = section.id as 'menu' | 'about' | 'contact'
        }
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Category tabs scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id)
            const activeTab = tabsRef.current?.querySelector(`[data-id="${entry.target.id}"]`)
            activeTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    availableCategories.forEach(c => {
      const el = sectionRefs.current[c.id]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [categories])

  function scrollToSection(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  function scrollToCategory(id: string) {
    setActiveCategory(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── STICKY NAV (Floating Glass Capsule) ──────────────────────
  const StickyNav = () => (
    <div style={{
      position: 'sticky', top: 12, zIndex: 100,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none'
    }}>
      <div style={{
        maxWidth: 680, width: '92%',
        background: t.navBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 16,
        boxShadow: t.softShadow,
        border: `1px solid ${t.border}`,
        padding: '8px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pointerEvents: 'auto',
        transition: motion.quick
      }}>
        <span style={{
          fontWeight: 800, fontSize: 15, color: t.navText, letterSpacing: '-0.2px'
        }}>{restaurant.name}</span>

        <div style={{
          display: 'flex', gap: 6, background: t.tabBg,
          borderRadius: 12, padding: 4
        }}>
          {(['menu', 'about', 'contact'] as const).filter(s =>
            s === 'menu' || (s === 'about' && hasAbout) || (s === 'contact' && hasContact)
          ).map(section => {
            const active = activeSection === section
            return (
              <button
                key={section}
                onClick={() => scrollToSection(section === 'menu' ? menuSectionRef : section === 'about' ? aboutSectionRef : contactSectionRef)}
                style={{
                  padding: '8px 12px', border: 'none', borderRadius: 10,
                  background: active ? t.accent : 'transparent',
                  color: active ? t.accentText : t.navText,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: t.font, textTransform: 'capitalize',
                  transition: motion.quick,
                  boxShadow: active ? '0 6px 20px rgba(56,189,248,0.35)' : 'none'
                }}
              >{section}</button>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ── HERO (Gradient + subtle accent divider) ──────────────────
  const Hero = () => (
    <div style={{
      background: `linear-gradient(145deg, ${t.headerBg} 0%, ${t.bg} 100%)`,
      padding: '70px 20px 40px', textAlign: 'center',
    }}>
      <h1 style={{
        margin: 0, fontSize: 34, fontWeight: 900, color: t.headerText,
        letterSpacing: '-0.6px', lineHeight: 1.4
      }}>
        {restaurant.name}
      </h1>
      {restaurant.tagline && (
        <p style={{
          margin: '10px auto 0', color: t.headerSub, fontSize: 15,
          lineHeight: 1.6, maxWidth: 420
        }}>
          {restaurant.tagline}
        </p>
      )}
      <div style={{
        width: 64, height: 4, background: t.accent, borderRadius: 999,
        margin: '22px auto 0', boxShadow: '0 8px 24px rgba(56,189,248,0.35)'
      }} />
    </div>
  )

  // ── CATEGORY TABS (Pill group) ───────────────────────────────
  const CategoryTabs = () => (
    availableCategories.length > 1 ? (
      <div
        ref={tabsRef}
        style={{
          position: 'sticky', top: 68, zIndex: 10,
          background: 'transparent',
          padding: '8px 0 10px',
          display: 'flex', justifyContent: 'center'
        }}
      >
        <div style={{
          maxWidth: 680, width: '92%',
          background: t.tabBg,
          borderRadius: 14,
          boxShadow: t.softShadow,
          border: `1px solid ${t.border}`,
          overflowX: 'auto',
          scrollbarWidth: 'none' as any
        }}>
          <div style={{
            display: 'flex', padding: 6, gap: 6, minWidth: 'max-content'
          }}>
            {availableCategories.map(cat => {
              const active = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  data-id={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  style={{
                    padding: '10px 14px', border: 'none',
                    background: active ? t.accent : 'transparent',
                    color: active ? t.accentText : t.tabText,
                    cursor: 'pointer', fontSize: 13, fontFamily: t.font,
                    fontWeight: active ? 800 : 600,
                    borderRadius: 999,
                    transition: motion.quick,
                    boxShadow: active ? '0 8px 24px rgba(56,189,248,0.35)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >{cat.name}</button>
              )
            })}
          </div>
        </div>
      </div>
    ) : null
  )

  // Section wrapper helpers for softer separation
  const SectionWrap: React.FC<{ children: any; topPad?: number }> = ({ children, topPad = 22 }) => (
    <div style={{
      background: `linear-gradient(180deg, ${t.bg} 0%, ${t.mutedSurface} 180%)`,
      padding: `${topPad}px 0`
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px' }}>
        {children}
      </div>
    </div>
  )

  // ── ABOUT SECTION ────────────────────────────────────────────
  const AboutSection = () => (
    <SectionWrap topPad={30}>
      <div id="section-about" ref={aboutSectionRef}>
        <h2 style={{
          margin: '0 0 18px', fontSize: 22, fontWeight: 800, color: t.text,
          lineHeight: 1.5
        }}>About Us</h2>

        {restaurant.about && (
          <div style={{
            background: t.surface, borderRadius: 18, padding: '20px 18px',
            boxShadow: t.softShadow
          }}>
            <p style={{ margin: 0, fontSize: 15, color: t.subtext, lineHeight: 1.7 }}>{restaurant.about}</p>
          </div>
        )}

        {restaurant.opening_hours && (
          <div style={{
            background: t.surface, borderRadius: 18, padding: '18px',
            marginTop: 16, boxShadow: t.softShadow
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ color: t.accent }}><ClockIcon /></span>
              <h3 style={{
                margin: 0, fontSize: 14, fontWeight: 800, color: t.text,
                textTransform: 'uppercase', letterSpacing: '1px'
              }}>Opening Hours</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DAYS.map(day => {
                const hours = restaurant.opening_hours?.[day]
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
                const isToday = day === today
                return (
                  <div key={day} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 12,
                    background: isToday ? `${t.accent}22` : 'transparent',
                    boxShadow: isToday ? t.softShadow : 'none',
                    transition: motion.quick
                  }}>
                    <span style={{
                      fontSize: 14, fontWeight: isToday ? 800 : 600,
                      color: isToday ? t.accent : t.text
                    }}>{day}</span>
                    <span style={{
                      fontSize: 14,
                      color: hours?.closed ? t.subtext : (isToday ? t.accent : t.text),
                      fontWeight: isToday ? 700 : 500
                    }}>
                      {!hours || hours.closed ? 'Closed' : `${hours.open} – ${hours.close}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </SectionWrap>
  )

  // ── CONTACT SECTION ──────────────────────────────────────────
  const ContactSection = () => (
    <SectionWrap topPad={30}>
      <div id="section-contact" ref={contactSectionRef}>
        <h2 style={{
          margin: '0 0 18px', fontSize: 22, fontWeight: 800, color: t.text,
          lineHeight: 1.5
        }}>Contact & Find Us</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {restaurant.address && (
            <div style={{
              background: t.surface, borderRadius: 18, padding: '18px',
              boxShadow: t.softShadow
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ color: t.accent, flexShrink: 0, marginTop: 2 }}><MapPinIcon /></span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 10px', fontSize: 14, color: t.text, lineHeight: 1.6 }}>{restaurant.address}</p>
                  {restaurant.google_maps_url && (
                    <a
                      href={restaurant.google_maps_url}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontWeight: 800, color: t.accent, textDecoration: 'none',
                        background: `${t.accent}18`, padding: '8px 14px', borderRadius: 12,
                        transition: motion.quick, boxShadow: t.softShadow
                      }}
                    >
                      Open in Maps →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {(restaurant.phone || restaurant.whatsapp || restaurant.email) && (
            <div style={{
              background: t.surface, borderRadius: 18, padding: '18px',
              display: 'flex', flexDirection: 'column', gap: 12,
              boxShadow: t.softShadow
            }}>
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone}`}
                  style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', transition: motion.quick }}
                >
                  <span style={{ color: t.accent }}><PhoneIcon /></span>
                  <span style={{ fontSize: 14, color: t.text }}>{restaurant.phone}</span>
                </a>
              )}
              {restaurant.whatsapp && (
                <a
                  href={`[wa.me](https://wa.me/${restaurant.whatsapp})`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', transition: motion.quick }}
                >
                  <span style={{ color: '#25D366' }}><WhatsAppIcon /></span>
                  <span style={{ fontSize: 14, color: t.text }}>WhatsApp</span>
                </a>
              )}
              {restaurant.email && (
                <a
                  href={`mailto:${restaurant.email}`}
                  style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', transition: motion.quick }}
                >
                  <span style={{ color: t.accent }}><EmailIcon /></span>
                  <span style={{ fontSize: 14, color: t.text }}>{restaurant.email}</span>
                </a>
              )}
            </div>
          )}

          {(restaurant.instagram || restaurant.facebook) && (
            <div style={{
              background: t.surface, borderRadius: 18, padding: '18px',
              boxShadow: t.softShadow
            }}>
              <p style={{
                margin: '0 0 12px', fontSize: 12, fontWeight: 800, letterSpacing: '1px',
                textTransform: 'uppercase', color: t.subtext
              }}>Follow Us</p>
              <div style={{ display: 'flex', gap: 12 }}>
                {restaurant.instagram && (
                  <a href={`[instagram.com](https://instagram.com/${restaurant.instagram})`} target="_blank" rel="noopener noreferrer"
                     style={socialBtn('#E1306C')}
                     onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
                     onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
                  ><InstagramIcon /></a>
                )}
                {restaurant.facebook && (
                  <a href={`[facebook.com](https://facebook.com/${restaurant.facebook})`} target="_blank" rel="noopener noreferrer"
                     style={socialBtn('#1877F2')}
                     onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
                     onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
                  ><FacebookIcon /></a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionWrap>
  )

  // ── FOOTER ───────────────────────────────────────────────────
  const Footer = () => (
    <div style={{
      background: `linear-gradient(180deg, ${t.mutedSurface} 0%, ${t.bg} 120%)`
    }}>
      <p style={{
        textAlign: 'center', color: t.subtext, fontSize: 11,
        padding: '28px 0 44px', opacity: 0.65
      }}>
        Powered by <strong>Menuberg</strong>
      </p>
    </div>
  )

  // Shared Card composable for list and cards layouts
  const ItemCard: React.FC<{
    item: MenuItem
    compact?: boolean
    onClick: () => void
  }> = ({ item, compact, onClick }) => (
    <div
      onClick={onClick}
      style={{
        background: `linear-gradient(180deg, ${t.surface} 0%, ${t.mutedSurface} 140%)`,
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        gap: compact ? 12 : 0,
        cursor: 'pointer',
        boxShadow: t.cardShadow,
        transition: motion.quick
      }}
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          style={{
            width: compact ? 76 : '100%',
            height: compact ? 76 : 140,
            objectFit: 'cover',
            borderRadius: compact ? 14 : 0,
            margin: compact ? 10 : 0,
            transition: 'transform 0.35s cubic-bezier(0.2,0.8,0.2,1)'
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
        />
      ) : (
        <div style={{
          width: compact ? 76 : '100%',
          height: compact ? 76 : 140,
          background: t.mutedSurface,
          borderRadius: compact ? 14 : 0,
          margin: compact ? 10 : 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: compact ? 28 : 36
        }}>🍽️</div>
      )}
      <div style={{ padding: compact ? '10px 12px 10px 0' : '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: compact ? 15 : 14, color: t.text, lineHeight: 1.5 }}>
            {item.name}
          </p>
          <span style={{
            fontWeight: 800, fontSize: compact ? 13 : 12, color: t.priceText, background: t.priceBg,
            padding: compact ? '5px 10px' : '4px 9px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0
          }}>
            {currency} {item.price}
          </span>
        </div>
        {item.description && (
          <p style={{
            margin: 0, fontSize: 12, color: t.subtext, lineHeight: 1.6,
            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
            WebkitLineClamp: compact ? 2 : 2, WebkitBoxOrient: 'vertical' as any
          }}>{item.description}</p>
        )}
      </div>
    </div>
  )

  // ── MENU ITEMS RENDERER ──────────────────────────────────────
  const renderMenuItems = () => (
    <div id="section-menu" ref={menuSectionRef}>
      <CategoryTabs />
      {/* Soft background sectioning for menu */}
      <SectionWrap topPad={16}>
        {layout === 'classic' && availableCategories.map(category => {
          const items = category.menu_items.filter(i => i.is_available)
          return (
            <div
              key={category.id}
              id={category.id}
              ref={el => { sectionRefs.current[category.id] = el }}
              style={{ paddingTop: 18, marginBottom: 20 }}
            >
              <div style={{ margin: '0 0 10px' }}>
                <h2 style={{
                  margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '2px',
                  textTransform: 'uppercase', color: t.accent, lineHeight: 1.5
                }}>{category.name}</h2>
              </div>

              <div style={{
                background: 'transparent',
                display: 'flex', flexDirection: 'column', gap: 10
              }}>
                {items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      background: t.surface,
                      borderRadius: 16,
                      padding: '12px 14px',
                      boxShadow: t.softShadow,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer',
                      transition: motion.quick
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: 12, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: t.text, lineHeight: 1.5 }}>{item.name}</p>
                      {item.description && (
                        <p style={{
                          margin: '4px 0 0', fontSize: 12.5, color: t.subtext, lineHeight: 1.6,
                          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any
                        }}>{item.description}</p>
                      )}
                    </div>
                    <span style={{
                      fontWeight: 800, fontSize: 13.5, color: t.priceText, background: t.priceBg,
                      padding: '6px 10px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0
                    }}>{currency} {item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {layout === 'list' && availableCategories.map(category => {
          const items = category.menu_items.filter(i => i.is_available)
          return (
            <div
              key={category.id}
              id={category.id}
              ref={el => { sectionRefs.current[category.id] = el }}
              style={{ paddingTop: 18, marginBottom: 20 }}
            >
              <div style={{ margin: '0 0 10px' }}>
                <h2 style={{
                  margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '2px',
                  textTransform: 'uppercase', color: t.accent, lineHeight: 1.5
                }}>{category.name}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map(item => (
                  <ItemCard key={item.id} item={item} compact onClick={() => setSelectedItem(item)} />
                ))}
              </div>
            </div>
          )
        })}

        {layout === 'cards' && availableCategories.map(category => {
          const items = category.menu_items.filter(i => i.is_available)
          return (
            <div
              key={category.id}
              id={category.id}
              ref={el => { sectionRefs.current[category.id] = el }}
              style={{ paddingTop: 18, marginBottom: 20 }}
            >
              <div style={{ margin: '0 0 12px' }}>
                <h2 style={{
                  margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '2px',
                  textTransform: 'uppercase', color: t.accent, lineHeight: 1.5
                }}>{category.name}</h2>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12
              }}>
                {items.map(item => (
                  <ItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                ))}
              </div>
            </div>
          )
        })}

        {layout === 'swipe' && (
          <div style={{ padding: '0 0' }}>
            {availableCategories.map(category => {
              const items = category.menu_items.filter(i => i.is_available)
              return (
                <SwipeCategory
                  key={category.id}
                  category={category}
                  items={items}
                  t={t}
                  currency={currency}
                  sectionRefs={sectionRefs}
                  onItemClick={setSelectedItem}
                />
              )
            })}
          </div>
        )}
      </SectionWrap>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: t.bg, fontFamily: t.font,
      transition: motion.quick
    }}>
      {selectedItem && <ItemPopup item={selectedItem} t={t} currency={currency} onClose={() => setSelectedItem(null)} />}
      <StickyNav />
      <Hero />
      {renderMenuItems()}
      {hasAbout && <AboutSection />}
      {hasContact && <ContactSection />}
      <Footer />
    </div>
  )
}
