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
  font: string; categoryFont: string; shadow: string; cardBg: string
}> = {
  light: {
    bg: '#F8FAFC', surface: '#ffffff', text: '#0F172A', subtext: '#64748B',
    border: '#E2E8F0', accent: '#0EA5E9', accentText: '#ffffff',
    tabBg: '#F1F5F9', tabActiveText: '#ffffff', tabText: '#64748B',
    priceBg: '#E0F2FE', priceText: '#0369A1',
    headerBg: '#0F172A', headerText: '#ffffff', headerSub: '#94A3B8',
    navBg: 'rgba(255,255,255,0.8)', navText: '#0F172A', navActive: '#0EA5E9',
    font: '"Plus Jakarta Sans", "Inter", sans-serif',
    categoryFont: '"Plus Jakarta Sans", sans-serif',
    shadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
    cardBg: '#ffffff'
  },
  dark: {
    bg: '#0B0F19', surface: '#151F32', text: '#F8FAFC', subtext: '#94A3B8',
    border: '#1E293B', accent: '#38BDF8', accentText: '#0B0F19',
    tabBg: '#1E293B', tabActiveText: '#ffffff', tabText: '#94A3B8',
    priceBg: 'rgba(56, 189, 248, 0.15)', priceText: '#38BDF8',
    headerBg: '#020617', headerText: '#FFFFFF', headerSub: '#64748B',
    navBg: 'rgba(21, 31, 50, 0.8)', navText: '#F8FAFC', navActive: '#38BDF8',
    font: '"Plus Jakarta Sans", "Inter", sans-serif',
    categoryFont: '"Plus Jakarta Sans", sans-serif',
    shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    cardBg: '#151F32'
  },
  gold: {
    bg: '#0F0D0A', surface: '#1C1814', text: '#F5E6C4', subtext: '#A69276',
    border: '#2D261E', accent: '#D4AF37', accentText: '#0F0D0A',
    tabBg: '#2D261E', tabActiveText: '#0F0D0A', tabText: '#A69276',
    priceBg: 'rgba(212, 175, 55, 0.15)', priceText: '#D4AF37',
    headerBg: '#050403', headerText: '#D4AF37', headerSub: '#A69276',
    navBg: 'rgba(28, 24, 20, 0.85)', navText: '#F5E6C4', navActive: '#D4AF37',
    font: '"Playfair Display", "Georgia", serif',
    categoryFont: '"Playfair Display", serif',
    shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    cardBg: '#1C1814'
  },
  vibrant: {
    bg: '#4F46E5', surface: '#ffffff', text: '#1E1B4B', subtext: '#4338CA',
    border: '#E0E7FF', accent: '#F43F5E', accentText: '#ffffff',
    tabBg: '#EEF2FF', tabActiveText: '#ffffff', tabText: '#4338CA',
    priceBg: '#FFE4E6', priceText: '#E11D48',
    headerBg: '#312E81', headerText: '#ffffff', headerSub: '#C7D2FE',
    navBg: 'rgba(255, 255, 255, 0.85)', navText: '#1E1B4B', navActive: '#F43F5E',
    font: '"Plus Jakarta Sans", sans-serif',
    categoryFont: '"Plus Jakarta Sans", sans-serif',
    shadow: '0 20px 25px -5px rgba(79, 70, 229, 0.1)',
    cardBg: '#ffffff'
  },
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function socialBtn(bg: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 48, height: 48, borderRadius: '16px',
    background: bg, color: '#fff', textDecoration: 'none', flexShrink: 0,
    transition: 'transform 0.2s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }
}

function WhatsAppIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg> }
function InstagramIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg> }
function FacebookIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> }
function PhoneIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> }
function MapPinIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }
function EmailIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> }
function ClockIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }

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
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'menuFadeIn 0.2s ease-out',
      }}
    >
      <style>{`
        @keyframes menuFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes sheetUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 540,
          background: t.surface, borderRadius: '32px 32px 0 0',
          overflow: 'hidden', animation: 'sheetUp 0.35s cubic-bezier(0.32,0.72,0,1)',
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -20px 40px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: 200, background: t.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🍔</div>
          )}
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 40, height: 5, borderRadius: 2.5, background: 'rgba(255,255,255,0.3)' }} />
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(15,23,42,0.6)', border: 'none',
              color: '#fff', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)', transition: 'transform 0.2s',
            }}
          >✕</button>
        </div>
        <div style={{ padding: '28px 24px 40px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: t.text, lineHeight: 1.2 }}>{item.name}</h2>
            <span style={{ fontWeight: 800, fontSize: 18, color: t.priceText, background: t.priceBg, padding: '8px 16px', borderRadius: '16px', whiteSpace: 'nowrap' }}>
              {currency} {item.price}
            </span>
          </div>
          {item.description && (
            <p style={{ margin: 0, fontSize: 15, color: t.subtext, lineHeight: 1.7, fontWeight: 400 }}>{item.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SwipeCategory({ category, items, t, currency, sectionRefs, onItemClick }: {
  category: Category; items: MenuItem[]; t: any; currency: string
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  onItemClick: (item: MenuItem) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function handleScroll() {
    const container = scrollRef.current
    if (!container) return
    const card = container.children[0] as HTMLElement
    if (!card) return
    const index = Math.round(container.scrollLeft / (card.offsetWidth + 16))
    setActiveIndex(Math.min(Math.max(index, 0), items.length - 1))
  }

  return (
    <div id={category.id} ref={el => { sectionRefs.current[category.id] = el }} style={{ paddingTop: 36 }}>
      <div style={{ padding: '0 4px', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: t.text, fontFamily: t.categoryFont, letterSpacing: '-0.3px' }}>{category.name}</h2>
      </div>
      <div style={{ position: 'relative' }}>
        <div ref={scrollRef} onScroll={handleScroll} style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none' as any, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' as any, paddingBottom: 8 }}>
          {items.map((item) => (
            <div key={item.id} onClick={() => onItemClick(item)} style={{ width: '82%', minWidth: '82%', flexShrink: 0, scrollSnapAlign: 'start', background: t.cardBg, borderRadius: 24, overflow: 'hidden', cursor: 'pointer', boxShadow: t.shadow, transition: 'transform 0.2s', border: `1px solid ${t.border}` }}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: 160, background: t.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>🍔</div>
              )}
              <div style={{ padding: 18 }}>
                <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 16, color: t.text, lineHeight: 1.3 }}>{item.name}</p>
                {item.description && <p style={{ margin: '0 0 14px', fontSize: 13, color: t.subtext, lineHeight: 1.5, height: 38, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.description}</p>}
                <span style={{ fontWeight: 800, fontSize: 14, color: t.priceText, background: t.priceBg, padding: '6px 12px', borderRadius: 10 }}>{currency} {item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
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
  const tabsRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const menuSectionRef = useRef<HTMLDivElement>(null)
  const aboutSectionRef = useRef<HTMLDivElement>(null)
  const contactSectionRef = useRef<HTMLDivElement>(null)

  const availableCategories = categories.filter(c => c.menu_items?.some(i => i.is_available))
  const hasAbout = !!(restaurant.about || restaurant.opening_hours)
  const hasContact = !!(restaurant.phone || restaurant.whatsapp || restaurant.email || restaurant.address || restaurant.instagram || restaurant.facebook)

  useEffect(() => {
    function onScroll() {
      const sections = [
        { id: 'menu', ref: menuSectionRef },
        { id: 'about', ref: aboutSectionRef },
        { id: 'contact', ref: contactSectionRef },
      ]
      const scrollY = window.scrollY + 120
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
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (layout === 'swipe') return
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
      { rootMargin: '-25% 0px -55% 0px', threshold: 0 }
    )
    availableCategories.forEach(c => {
      const el = sectionRefs.current[c.id]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [categories, layout])

  function scrollToSection(ref: React.RefObject<HTMLDivElement | null>) {
    const offset = 90
    if (ref.current) {
      const top = ref.current.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  function scrollToCategory(id: string) {
    setActiveCategory(id)
    const offset = 140
    const el = sectionRefs.current[id]
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const StickyNav = () => (
    <div style={{
      position: 'sticky', top: 12, zIndex: 100,
      margin: '0 16px', maxWidth: 608,
    }}>
      <div style={{
        background: t.navBg, backdropFilter: 'blur(20px)',
        border: `1px solid ${t.border}`, borderRadius: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 60, boxShadow: t.shadow
      }}>
        <span style={{ fontWeight: 800, fontSize: 16, color: t.navText, letterSpacing: '-0.5px', fontFamily: t.categoryFont }}>{restaurant.name}</span>
        <div style={{ display: 'flex', background: t.tabBg, padding: 4, borderRadius: 16, gap: 2 }}>
          {(['menu', 'about', 'contact'] as const).filter(s =>
            s === 'menu' || (s === 'about' && hasAbout) || (s === 'contact' && hasContact)
          ).map(section => (
            <button
              key={section}
              onClick={() => scrollToSection(section === 'menu' ? menuSectionRef : section === 'about' ? aboutSectionRef : contactSectionRef)}
              style={{
                padding: '6px 14px', border: 'none', borderRadius: 12,
                background: activeSection === section ? t.accent : 'transparent',
                color: activeSection === section ? t.accentText : t.subtext,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: t.font, transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', textTransform: 'capitalize',
              }}
            >{section}</button>
          ))}
        </div>
      </div>
    </div>
  )

  const Hero = () => (
    <div style={{ padding: '40px 24px 32px', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: t.text, letterSpacing: '-1px', lineHeight: 1.1, fontFamily: t.categoryFont }}>
        {restaurant.name}
      </h1>
      {restaurant.tagline && (
        <p style={{ margin: '12px 0 0', color: t.subtext, fontSize: 15, lineHeight: 1.6, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto', fontWeight: 400 }}>
          {restaurant.tagline}
        </p>
      )}
    </div>
  )

  const CategoryTabs = () => (
    availableCategories.length > 1 ? (
      <div style={{
        position: 'sticky', top: 84, zIndex: 90,
        background: `linear-gradient(to bottom, ${t.bg} 80%, transparent)`,
        padding: '12px 0 24px', overflowX: 'auto', display: 'flex', scrollbarWidth: 'none',
      }} ref={tabsRef}>
        <div style={{ display: 'flex', padding: '0 16px', gap: 8, minWidth: 'max-content' }}>
          {availableCategories.map(cat => (
            <button
              key={cat.id}
              data-id={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              style={{
                padding: '10px 18px', borderRadius: 14,
                cursor: 'pointer', fontSize: 14, fontFamily: t.font,
                fontWeight: 700, background: activeCategory === cat.id ? t.accent : t.cardBg,
                color: activeCategory === cat.id ? t.accentText : t.text,
                boxShadow: activeCategory === cat.id ? '0 8px 16px -4px rgba(0,0,0,0.1)' : t.shadow,
                border: `1px solid ${activeCategory === cat.id ? 'transparent' : t.border}`,
                transition: 'all 0.2s ease', whiteSpace: 'nowrap',
              }}
            >{cat.name}</button>
          ))}
        </div>
      </div>
    ) : null
  )

  const renderMenuItems = () => (
    <div id="section-menu" ref={menuSectionRef} style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
      <CategoryTabs />
      <div>
        {layout === 'classic' && availableCategories.map(category => {
          const items = category.menu_items.filter(i => i.is_available)
          return (
            <div key={category.id} id={category.id} ref={el => { sectionRefs.current[category.id] = el }} style={{ paddingTop: 24 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: t.text, fontFamily: t.categoryFont, letterSpacing: '-0.3px' }}>{category.name}</h2>
              <div style={{ background: t.cardBg, borderRadius: 24, padding: '8px 20px', boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
                {items.map((item, index) => (
                  <div key={item.id} onClick={() => setSelectedItem(item)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: index === items.length - 1 ? 'none' : `1px solid ${t.border}`, cursor: 'pointer' }}>
                    <div style={{ flex: 1, paddingRight: 16 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: t.text }}>{item.name}</p>
                      {item.description && <p style={{ margin: '6px 0 0', fontSize: 13, color: t.subtext, lineHeight: 1.5 }}>{item.description}</p>}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 14, color: t.priceText, background: t.priceBg, padding: '6px 12px', borderRadius: 10, whiteSpace: 'nowrap' }}>{currency} {item.price}</span>
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
              <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: t.text, fontFamily: t.categoryFont }}>{category.name}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map(item => (
                  <div key={item.id} onClick={() => setSelectedItem(item)} style={{ display: 'flex', alignItems: 'center', gap: 16, background: t.cardBg, borderRadius: 20, padding: 12, cursor: 'pointer', boxShadow: t.shadow, border: `1px solid ${t.border}`, transition: 'transform 0.2s' }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: 80, height: 80, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 80, height: 80, borderRadius: 14, background: t.border, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🍔</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: t.text }}>{item.name}</p>
                      {item.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: t.subtext, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.description}</p>}
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 14, color: t.priceText, background: t.priceBg, padding: '6px 12px', borderRadius: 10, whiteSpace: 'nowrap', marginRight: 4 }}>{currency} {item.price}</span>
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
              <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: t.text, fontFamily: t.categoryFont }}>{category.name}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {items.map(item => (
                  <div key={item.id} onClick={() => setSelectedItem(item)} style={{ background: t.cardBg, borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', boxShadow: t.shadow, border: `1px solid ${t.border}`, transition: 'transform 0.2s' }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: 130, background: t.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🍔</div>
                    )}
                    <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: t.text, lineHeight: 1.3 }}>{item.name}</p>
                        {item.description && <p style={{ margin: '6px 0 0', fontSize: 12, color: t.subtext, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.description}</p>}
                      </div>
                      <span style={{ alignSelf: 'flex-start', fontWeight: 800, fontSize: 13, color: t.priceText, background: t.priceBg, padding: '6px 12px', borderRadius: 10 }}>{currency} {item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {layout === 'swipe' && availableCategories.map(category => (
          <SwipeCategory
            key={category.id}
            category={category}
            items={category.menu_items.filter(i => i.is_available)}
            t={t}
            currency={currency}
            sectionRefs={sectionRefs}
            onItemClick={setSelectedItem}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ background: t.bg, color: t.text, fontFamily: t.font, minHeight: '100vh', paddingBottom: 60, transition: 'background-color 0.3s ease' }}>
      <div style={{ height: 16 }} />
      <StickyNav />
      <Hero />
      {renderMenuItems()}

      {hasAbout && (
        <div id="section-about" ref={aboutSectionRef} style={{ padding: '64px 16px 24px', maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, color: t.text, fontFamily: t.categoryFont }}>About Our Kitchen</h2>
          {restaurant.about && (
            <div style={{ background: t.cardBg, borderRadius: 24, padding: 24, marginBottom: 20, boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
              <p style={{ margin: 0, fontSize: 15, color: t.subtext, lineHeight: 1.7 }}>{restaurant.about}</p>
            </div>
          )}
          {restaurant.opening_hours && (
            <div style={{ background: t.cardBg, borderRadius: 24, padding: 24, boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ color: t.accent, display: 'flex' }}><ClockIcon /></span>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timings</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {DAYS.map(day => {
                  const hours = restaurant.opening_hours?.[day]
                  const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'long' })
                  return (
                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 12, background: isToday ? t.tabBg : 'transparent' }}>
                      <span style={{ fontSize: 14, fontWeight: isToday ? 700 : 500, color: isToday ? t.text : t.subtext }}>{day}</span>
                      <span style={{ fontSize: 14, color: hours?.closed ? t.subtext : t.text, fontWeight: isToday ? 700 : 500 }}>
                        {!hours || hours.closed ? 'Closed' : `${hours.open} – ${hours.close}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {hasContact && (
        <div id="section-contact" ref={contactSectionRef} style={{ padding: '40px 16px 32px', maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, color: t.text, fontFamily: t.categoryFont }}>Find Us Here</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {restaurant.address && (
              <div style={{ background: t.cardBg, borderRadius: 24, padding: 24, boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ color: t.accent, flexShrink: 0, marginTop: 2, display: 'flex' }}><MapPinIcon /></span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 16px', fontSize: 15, color: t.text, lineHeight: 1.5 }}>{restaurant.address}</p>
                    {restaurant.google_maps_url && (
                      <a href={restaurant.google_maps_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: t.accentText, background: t.accent, padding: '10px 20px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
                        Navigate with Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
            {(restaurant.phone || restaurant.whatsapp || restaurant.email) && (
              <div style={{ background: t.cardBg, borderRadius: 24, padding: 20, boxShadow: t.shadow, border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {restaurant.phone && (
                  <a href={`tel:${restaurant.phone}`} style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', padding: '10px', borderRadius: 12, transition: 'background 0.2s' }}>
                    <span style={{ color: t.accent, display: 'flex' }}><PhoneIcon /></span>
                    <span style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>{restaurant.phone}</span>
                  </a>
                )}
                {restaurant.whatsapp && (
                  <a href={`https://wa.me/${restaurant.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', padding: '10px', borderRadius: 12 }}>
                    <span style={{ color: '#25D366', display: 'flex' }}><WhatsAppIcon /></span>
                    <span style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>Order via WhatsApp</span>
                  </a>
                )}
                {restaurant.email && (
                  <a href={`mailto:${restaurant.email}`} style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', padding: '10px', borderRadius: 12 }}>
                    <span style={{ color: t.accent, display: 'flex' }}><EmailIcon /></span>
                    <span style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>{restaurant.email}</span>
                  </a>
                )}
              </div>
            )}
            {(restaurant.instagram || restaurant.facebook) && (
              <div style={{ background: t.cardBg, borderRadius: 24, padding: 24, boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
                <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: t.subtext }}>Join Our Community</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  {restaurant.instagram && (
                    <a href={`https://instagram.com/${restaurant.instagram}`} target="_blank" rel="noopener noreferrer" style={socialBtn('linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)')}><InstagramIcon /></a>
                  )}
                  {restaurant.facebook && (
                    <a href={`https://facebook.com/${restaurant.facebook}`} target="_blank" rel="noopener noreferrer" style={socialBtn('#1877F2')}><FacebookIcon /></a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', color: t.subtext, fontSize: 12, padding: '40px 0 10px', fontWeight: 500, letterSpacing: '0.3px' }}>
        Powered by <span style={{ color: t.text, fontWeight: 700 }}>Menuberg</span>
      </p>

      {selectedItem && (
        <ItemPopup
          item={selectedItem}
          t={t}
          currency={currency}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}