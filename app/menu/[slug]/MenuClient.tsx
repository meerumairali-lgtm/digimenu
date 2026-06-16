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
}

const themes: Record<string, {
  bg: string; surface: string; text: string; subtext: string
  border: string; accent: string; accentText: string
  tabBg: string; tabActiveText: string; tabText: string
  priceBg: string; priceText: string
  headerBg: string; headerText: string; headerSub: string
  font: string; categoryFont: string
}> = {
  light: {
    bg: '#f5f5f5', surface: '#ffffff', text: '#111111', subtext: '#777777',
    border: '#eeeeee', accent: '#38BDF8', accentText: '#ffffff',
    tabBg: '#ffffff', tabActiveText: '#38BDF8', tabText: '#555555',
    priceBg: '#E0F2FE', priceText: '#0D1B2A',
    headerBg: '#ffffff', headerText: '#111111', headerSub: '#777777',
    font: '"Inter", -apple-system, sans-serif',
    categoryFont: '"Inter", sans-serif',
  },
  dark: {
    bg: '#0a0a0a', surface: '#161616', text: '#f0f0f0', subtext: '#888888',
    border: '#2a2a2a', accent: '#38BDF8', accentText: '#ffffff',
    tabBg: '#161616', tabActiveText: '#38BDF8', tabText: '#888888',
    priceBg: '#112240', priceText: '#38BDF8',
    headerBg: '#000000', headerText: '#ffffff', headerSub: '#888888',
    font: '"Inter", -apple-system, sans-serif',
    categoryFont: '"Inter", sans-serif',
  },
  gold: {
    bg: '#0c0900', surface: '#180f00', text: '#f0e0b0', subtext: '#a08050',
    border: '#2a1e00', accent: '#d4a017', accentText: '#000000',
    tabBg: '#180f00', tabActiveText: '#d4a017', tabText: '#a08050',
    priceBg: '#2a1e00', priceText: '#d4a017',
    headerBg: '#080600', headerText: '#d4a017', headerSub: '#a08050',
    font: '"Georgia", serif',
    categoryFont: '"Georgia", serif',
  },
  vibrant: {
    bg: '#0f172a', surface: '#1e293b', text: '#f1f5f9', subtext: '#94a3b8',
    border: '#2d3f55', accent: '#38BDF8', accentText: '#ffffff',
    tabBg: '#1e293b', tabActiveText: '#38BDF8', tabText: '#94a3b8',
    priceBg: '#38BDF8', priceText: '#0D1B2A',
    headerBg: '#0f172a', headerText: '#ffffff', headerSub: '#94a3b8',
    font: '"Inter", sans-serif',
    categoryFont: '"Inter", sans-serif',
  },
}

function socialBtn(bg: string): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 42, height: 42, borderRadius: '50%',
    background: bg, color: '#fff', textDecoration: 'none', flexShrink: 0,
  }
}

function WhatsAppIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
}

function InstagramIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
}

function FacebookIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
}

function PhoneIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
}

function SwipeCategory({ category, items, t, currency, sectionRefs }: {
  category: Category
  items: MenuItem[]
  t: any
  currency: string
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
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

  const item = items[activeIndex]
  if (!item) return null

  return (
    <div
      id={category.id}
      ref={el => { sectionRefs.current[category.id] = el }}
      style={{ paddingTop: 28 }}
    >
      <div style={{ padding: '0 16px', marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.accent }}>
          {category.name}
        </h2>
      </div>
      <div style={{ height: 1, background: t.border, marginBottom: 12, marginLeft: 16, marginRight: 16 }} />

      <div
        style={{ position: 'relative', padding: '0 16px' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'flex', gap: 12, overflowX: 'auto',
            scrollbarWidth: 'none' as any,
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch' as any,
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                width: 'calc(100% - 48px)', minWidth: 'calc(100% - 48px)',
                flexShrink: 0, scrollSnapAlign: 'center',
                background: t.surface, borderRadius: 16, overflow: 'hidden',
              }}
            >
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: 200, background: t.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🍽️</div>
              )}
              <div style={{ padding: '14px 16px 18px' }}>
                <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 16, color: t.text, lineHeight: 1.3 }}>{item.name}</p>
                {item.description && (
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: t.subtext, lineHeight: 1.5 }}>{item.description}</p>
                )}
                <span style={{ fontWeight: 700, fontSize: 15, color: t.priceText, background: t.priceBg, padding: '6px 14px', borderRadius: 8 }}>
                  {currency} {item.price}
                </span>
              </div>
            </div>
          ))}
        </div>

        {activeIndex > 0 && hovered && (
          <div
            onClick={() => scrollTo(activeIndex - 1)}
            style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(to right, rgba(255,255,255,0.18), transparent)',
              cursor: 'pointer', color: '#fff', fontSize: 28, fontWeight: 300,
              borderRadius: '16px 0 0 16px', zIndex: 2,
            }}
          >‹</div>
        )}

        {activeIndex < items.length - 1 && hovered && (
          <div
            onClick={() => scrollTo(activeIndex + 1)}
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(to left, rgba(255,255,255,0.18), transparent)',
              cursor: 'pointer', color: '#fff', fontSize: 28, fontWeight: 300,
              borderRadius: '0 16px 16px 0', zIndex: 2,
            }}
          >›</div>
        )}
      </div>

      {items.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10, marginBottom: 8 }}>
          {items.map((_, i) => (
            <div
              key={i}
              onClick={() => scrollTo(i)}
              style={{
                width: activeIndex === i ? 20 : 6, height: 6, borderRadius: 3,
                background: activeIndex === i ? t.accent : t.border,
                cursor: 'pointer', transition: 'all 0.25s',
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
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '')
  const tabsRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const availableCategories = categories.filter(c =>
    c.menu_items?.some(i => i.is_available)
  )

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

  function scrollToCategory(id: string) {
    setActiveCategory(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const Header = () => (
    <div style={{ background: t.headerBg, padding: '36px 20px 28px', textAlign: 'center', borderBottom: `1px solid ${t.border}` }}>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: t.headerText, letterSpacing: '-0.3px' }}>
        {restaurant.name}
      </h1>
      {restaurant.tagline && (
        <p style={{ margin: '8px 0 0', color: t.headerSub, fontSize: 14 }}>{restaurant.tagline}</p>
      )}
      {(restaurant.whatsapp || restaurant.instagram || restaurant.facebook || restaurant.phone) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
          {restaurant.whatsapp && (
            <a href={`https://wa.me/${restaurant.whatsapp}`} target="_blank" rel="noopener noreferrer" style={socialBtn('#25D366')}><WhatsAppIcon /></a>
          )}
          {restaurant.instagram && (
            <a href={`https://instagram.com/${restaurant.instagram}`} target="_blank" rel="noopener noreferrer" style={socialBtn('#E1306C')}><InstagramIcon /></a>
          )}
          {restaurant.facebook && (
            <a href={`https://facebook.com/${restaurant.facebook}`} target="_blank" rel="noopener noreferrer" style={socialBtn('#1877F2')}><FacebookIcon /></a>
          )}
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`} style={socialBtn(t.accent)}><PhoneIcon /></a>
          )}
        </div>
      )}
    </div>
  )

  const CategoryTabs = () => (
    availableCategories.length > 1 ? (
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: t.tabBg, borderBottom: `1px solid ${t.border}`,
        overflowX: 'auto', display: 'flex', scrollbarWidth: 'none',
      }} ref={tabsRef}>
        <div style={{ display: 'flex', padding: '0 16px', gap: 4, minWidth: 'max-content' }}>
          {availableCategories.map(cat => (
            <button
              key={cat.id}
              data-id={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              style={{
                padding: '12px 16px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13, fontFamily: t.font,
                fontWeight: activeCategory === cat.id ? 600 : 400,
                color: activeCategory === cat.id ? t.accent : t.tabText,
                borderBottom: activeCategory === cat.id ? `2px solid ${t.accent}` : '2px solid transparent',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    ) : null
  )

  const Footer = () => (
    <>
      {(restaurant.address || restaurant.email) && (
        <div style={{ marginTop: 40, padding: '20px 16px', background: t.surface, borderRadius: 16, border: `1px solid ${t.border}` }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.accent }}>Find Us</h3>
          {restaurant.address && <p style={{ margin: '0 0 8px', fontSize: 14, color: t.text, display: 'flex', gap: 8 }}>📍 {restaurant.address}</p>}
          {restaurant.email && <p style={{ margin: 0, fontSize: 14, color: t.text, display: 'flex', gap: 8 }}>✉️ {restaurant.email}</p>}
        </div>
      )}
      <p style={{ textAlign: 'center', color: t.subtext, fontSize: 11, marginTop: 32, opacity: 0.5 }}>
        Powered by <strong>Menuberg</strong>
      </p>
    </>
  )

  // ── CLASSIC LAYOUT ──────────────────────────────────────────
  if (layout === 'classic') {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.font }}>
        <Header />
        <CategoryTabs />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '8px 16px 48px' }}>
          {availableCategories.map(category => {
            const items = category.menu_items.filter(i => i.is_available)
            return (
              <div key={category.id} id={category.id} ref={el => { sectionRefs.current[category.id] = el }} style={{ paddingTop: 28 }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.accent }}>
                  {category.name}
                </h2>
                <div style={{ height: 1, background: t.border, marginBottom: 8 }} />
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${t.border}` }}>
                    <div style={{ flex: 1, paddingRight: 16 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: t.text }}>{item.name}</p>
                      {item.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: t.subtext, lineHeight: 1.4 }}>{item.description}</p>}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: t.priceText, background: t.priceBg, padding: '5px 12px', borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {currency} {item.price}
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
          <Footer />
        </div>
      </div>
    )
  }

  // ── LIST LAYOUT ─────────────────────────────────────────────
  if (layout === 'list') {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.font }}>
        <Header />
        <CategoryTabs />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '8px 16px 48px' }}>
          {availableCategories.map(category => {
            const items = category.menu_items.filter(i => i.is_available)
            return (
              <div key={category.id} id={category.id} ref={el => { sectionRefs.current[category.id] = el }} style={{ paddingTop: 28 }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.accent }}>
                  {category.name}
                </h2>
                <div style={{ height: 1, background: t.border, marginBottom: 8 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: t.surface, borderRadius: 12, padding: '10px 12px' }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 64, height: 64, borderRadius: 10, background: t.border, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🍽️</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: t.text }}>{item.name}</p>
                        {item.description && (
                          <p style={{ margin: '3px 0 0', fontSize: 12, color: t.subtext, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{item.description}</p>
                        )}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: t.priceText, background: t.priceBg, padding: '5px 10px', borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {currency} {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          <Footer />
        </div>
      </div>
    )
  }

  // ── CARDS LAYOUT ────────────────────────────────────────────
  if (layout === 'cards') {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.font }}>
        <Header />
        <CategoryTabs />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '8px 16px 48px' }}>
          {availableCategories.map(category => {
            const items = category.menu_items.filter(i => i.is_available)
            return (
              <div key={category.id} id={category.id} ref={el => { sectionRefs.current[category.id] = el }} style={{ paddingTop: 28 }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.accent }}>
                  {category.name}
                </h2>
                <div style={{ height: 1, background: t.border, marginBottom: 12 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {items.map(item => (
                    <div key={item.id} style={{ background: t.surface, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} style={{ width: '100%', height: 130, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: 130, background: t.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🍽️</div>
                      )}
                      <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: t.text, lineHeight: 1.3 }}>{item.name}</p>
                        {item.description && (
                          <p style={{ margin: 0, fontSize: 12, color: t.subtext, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{item.description}</p>
                        )}
                        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: t.priceText, background: t.priceBg, padding: '4px 10px', borderRadius: 6 }}>
                            {currency} {item.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          <Footer />
        </div>
      </div>
    )
  }

  // ── SWIPE LAYOUT ────────────────────────────────────────────
  if (layout === 'swipe') {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.font }}>
        <Header />
        <CategoryTabs />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '8px 0 48px' }}>
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
              />
            )
          })}
          <div style={{ padding: '0 16px' }}>
            <Footer />
          </div>
        </div>
      </div>
    )
  }

  return null
}