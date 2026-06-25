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
  tabBg: string; priceBg: string; priceText: string
  shadow: string; cardBg: string; glassBg: string
}> = {
  light: {
    bg: '#F1F5F9', surface: '#ffffff', text: '#0F172A', subtext: '#475569',
    border: 'rgba(15, 23, 42, 0.06)', accent: '#F43F5E', accentText: '#ffffff',
    tabBg: '#F8FAFC', priceBg: '#FFE4E6', priceText: '#E11D48',
    glassBg: 'rgba(255, 255, 255, 0.8)',
    shadow: '0 20px 40px -15px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(0,0,0,0.02)',
    cardBg: '#ffffff'
  },
  dark: {
    bg: '#090D16', surface: '#111827', text: '#F8FAFC', subtext: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.05)', accent: '#38BDF8', accentText: '#090D16',
    tabBg: '#1F2937', priceBg: 'rgba(56, 189, 248, 0.12)', priceText: '#38BDF8',
    glassBg: 'rgba(17, 24, 39, 0.8)',
    shadow: '0 30px 60px -15px rgba(0, 0, 0, 0.4)',
    cardBg: '#1F2937'
  },
  gold: {
    bg: '#0A0806', surface: '#15120E', text: '#F4EAD4', subtext: '#A39074',
    border: 'rgba(212, 175, 55, 0.08)', accent: '#D4AF37', accentText: '#0A0806',
    tabBg: '#1A1611', priceBg: 'rgba(212, 175, 55, 0.12)', priceText: '#D4AF37',
    glassBg: 'rgba(21, 18, 14, 0.85)',
    shadow: '0 30px 50px -10px rgba(0, 0, 0, 0.5)',
    cardBg: '#1A1611'
  },
  vibrant: {
    bg: '#EEF2FF', surface: '#ffffff', text: '#1E1B4B', subtext: '#4F46E5',
    border: 'rgba(79, 70, 229, 0.08)', accent: '#6366F1', accentText: '#ffffff',
    tabBg: '#F5F3FF', priceBg: '#E0E7FF', priceText: '#4338CA',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    shadow: '0 20px 40px rgba(79, 70, 229, 0.08)',
    cardBg: '#ffffff'
  },
}

export default function MenuClientPreview({ restaurant, categories }: { restaurant: Restaurant, categories: Category[] }) {
  const t = themes[restaurant.theme || 'light']
  const currency = restaurant.currency || 'PKR'
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  
  const tabsRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const availableCategories = categories.filter(c => c.menu_items?.some(i => i.is_available))

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
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
    )
    availableCategories.forEach(c => {
      const el = categoryRefs.current[c.id]
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [categories])

  function scrollToCategory(id: string) {
    setActiveCategory(id)
    const el = categoryRefs.current[id]
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 140
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '0 0 40px' }}>
      {/* App Shell Container - centers everything on desktop beautifully like an app view */}
      <div style={{ width: '100%', maxWidth: 500, background: t.surface, minHeight: '100vh', position: 'relative', boxShadow: '0 0 80px rgba(0,0,0,0.05)' }}>
        
        {/* Dynamic Premium Header Graphic Area */}
        <div style={{ width: '100%', height: 180, background: `linear-gradient(135deg, ${t.accent} 0%, ${t.bg} 100%)`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'radial-gradient(circle at 20% 30%, #fff 0%, transparent 60%)' }} />
        </div>

        {/* Floating Profile Info Wrapper Block */}
        <div style={{ padding: '0 20px', marginTop: -60, position: 'relative', zIndex: 10, marginBottom: 24 }}>
          <div style={{ background: t.cardBg, borderRadius: 24, padding: 24, boxShadow: t.shadow, border: `1px solid ${t.border}`, textAlign: 'center' }}>
            <span style={{ display: 'inline-block', width: 64, height: 64, borderRadius: 20, background: t.accent, color: t.accentText, fontSize: 28, fontWeight: 800, lineHeight: '64px', marginBottom: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              {restaurant.name.charAt(0)}
            </span>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: t.text, letterSpacing: '-0.5px' }}>{restaurant.name}</h1>
            {restaurant.tagline && <p style={{ margin: '6px 0 0', fontSize: 14, color: t.subtext, lineHeight: 1.5 }}>{restaurant.tagline}</p>}
          </div>
        </div>

        {/* Categories Tab Navigation Strip */}
        <div ref={tabsRef} style={{ position: 'sticky', top: 0, zIndex: 100, background: t.glassBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${t.border}`, padding: '14px 0', overflowX: 'auto', display: 'flex', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', padding: '0 20px', gap: 8, minWidth: 'max-content' }}>
            {availableCategories.map(cat => {
              const isSelected = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  data-id={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  style={{
                    padding: '8px 16px', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    background: isSelected ? t.text : t.tabBg,
                    color: isSelected ? t.surface : t.subtext,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Menu List Area */}
        <div style={{ padding: '12px 20px 40px' }}>
          {availableCategories.map(category => (
            <div key={category.id} id={category.id} ref={el => { categoryRefs.current[category.id] = el }} style={{ paddingTop: 28 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: t.subtext }}>
                {category.name}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {category.menu_items.filter(i => i.is_available).map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      display: 'flex', gap: 16, background: t.cardBg, borderRadius: 20, padding: 12,
                      cursor: 'pointer', boxShadow: t.shadow, border: `1px solid ${t.border}`,
                      alignItems: 'center', position: 'relative'
                    }}
                  >
                    {/* Compact Modern Square Thumbnail Container */}
                    <div style={{ width: 84, height: 84, borderRadius: 14, overflow: 'hidden', background: t.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 32 }}>🍕</span>
                      )}
                    </div>

                    {/* Meta Details Text Block */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text, lineHeight: 1.3 }}>{item.name}</h3>
                      </div>
                      {item.description && (
                        <p style={{ margin: 0, fontSize: 13, color: t.subtext, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {item.description}
                        </p>
                      )}
                      <div style={{ marginTop: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: t.priceText }}>
                          {currency} {item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Brand Node */}
        <p style={{ textAlign: 'center', color: t.subtext, fontSize: 12, padding: '24px 0', margin: 0, borderTop: `1px solid ${t.border}` }}>
          Powered by <span style={{ color: t.text, fontWeight: 700 }}>Menuberg</span>
        </p>

        {/* Native Style Drawer Slide Popup Modal */}
        {selectedItem && (
          <div
            onClick={() => setSelectedItem(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 500, background: t.surface, borderRadius: '32px 32px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}
            >
              <div style={{ position: 'relative', height: 260, background: t.bg }}>
                {selectedItem.image_url ? (
                  <img src={selectedItem.image_url} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🍔</div>
                )}
                <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}>✕</button>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.text }}>{selectedItem.name}</h2>
                  <span style={{ fontSize: 18, fontWeight: 800, color: t.priceText, background: t.priceBg, padding: '4px 12px', borderRadius: 12, whiteSpace: 'nowrap' }}>{currency} {selectedItem.price}</span>
                </div>
                {selectedItem.description && <p style={{ margin: 0, fontSize: 14, color: t.subtext, lineHeight: 1.6 }}>{selectedItem.description}</p>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}