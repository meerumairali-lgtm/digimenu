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
    glassBg: 'rgba(255, 255, 255, 0.85)',
    shadow: '0 20px 40px -15px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(0,0,0,0.02)',
    cardBg: '#ffffff'
  },
  dark: {
    bg: '#090D16', surface: '#111827', text: '#F8FAFC', subtext: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.05)', accent: '#38BDF8', accentText: '#090D16',
    tabBg: '#1F2937', priceBg: 'rgba(56, 189, 248, 0.12)', priceText: '#38BDF8',
    glassBg: 'rgba(17, 24, 39, 0.85)',
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
  
  // App View Controller Status
  const [currentTab, setCurrentTab] = useState<'menu' | 'about' | 'contact'>('menu')
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  
  const tabsRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const availableCategories = categories.filter(c => c.menu_items?.some(i => i.is_available))

  useEffect(() => {
    if (currentTab !== 'menu') return
    
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
  }, [categories, currentTab])

  function scrollToCategory(id: string) {
    setActiveCategory(id)
    const el = categoryRefs.current[id]
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 140
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ background: t.bg, minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '0 0 80px' }}>
      <div style={{ width: '100%', maxWidth: 500, background: t.surface, minHeight: '100vh', position: 'relative', boxShadow: '0 0 80px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Hero Banner Structure */}
        <div style={{ width: '100%', height: 160, background: `linear-gradient(135deg, ${t.accent} 0%, ${t.bg} 100%)`, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'radial-gradient(circle at 20% 30%, #fff 0%, transparent 60%)' }} />
        </div>

        {/* Restaurant Profile Hub Block */}
        <div style={{ padding: '0 20px', marginTop: -50, position: 'relative', zIndex: 10, marginBottom: 12, flexShrink: 0 }}>
          <div style={{ background: t.cardBg, borderRadius: 24, padding: 20, boxShadow: t.shadow, border: `1px solid ${t.border}`, textAlign: 'center' }}>
            <span style={{ display: 'inline-block', width: 60, height: 60, borderRadius: 18, background: t.accent, color: t.accentText, fontSize: 26, fontWeight: 800, lineHeight: '60px', marginBottom: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
              {restaurant.name.charAt(0)}
            </span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: t.text, letterSpacing: '-0.5px' }}>{restaurant.name}</h1>
            {restaurant.tagline && <p style={{ margin: '4px 0 0', fontSize: 13, color: t.subtext, lineHeight: 1.4 }}>{restaurant.tagline}</p>}
          </div>
        </div>

        {/* Dynamic View Panel Render Node */}
        <div style={{ flex: 1 }}>
          
          {/* VIEW ONE: DISH MENU CONTAINER */}
          {currentTab === 'menu' && (
            <>
              {/* Sticky Food Sub-categories strip */}
              <div ref={tabsRef} style={{ position: 'sticky', top: 0, zIndex: 100, background: t.glassBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${t.border}`, padding: '12px 0', overflowX: 'auto', display: 'flex', scrollbarWidth: 'none' }}>
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
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Product Grid Items */}
              <div style={{ padding: '12px 20px 40px' }}>
                {availableCategories.map(category => (
                  <div key={category.id} id={category.id} ref={el => { categoryRefs.current[category.id] = el }} style={{ paddingTop: 20 }}>
                    <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: t.subtext }}>
                      {category.name}
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {category.menu_items.filter(i => i.is_available).map(item => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          style={{
                            display: 'flex', gap: 14, background: t.cardBg, borderRadius: 18, padding: 12,
                            cursor: 'pointer', boxShadow: t.shadow, border: `1px solid ${t.border}`,
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ width: 76, height: 76, borderRadius: 12, overflow: 'hidden', background: t.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: 28 }}>🍔</span>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text }}>{item.name}</h3>
                            {item.description && (
                              <p style={{ margin: 0, fontSize: 13, color: t.subtext, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {item.description}
                              </p>
                            )}
                            <span style={{ fontSize: 14, fontWeight: 800, color: t.priceText, marginTop: 4 }}>
                              {currency} {item.price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* VIEW TWO: ABOUT CARD BLOCK */}
          {currentTab === 'about' && (
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: t.cardBg, borderRadius: 20, padding: 20, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 800, color: t.text }}>Our Story</h3>
                <p style={{ margin: 0, fontSize: 14, color: t.subtext, lineHeight: 1.6 }}>
                  {restaurant.about || "Welcome to our digital kitchen experience. We pride ourselves on sourcing the freshest ingredients to deliver authentic flavors made crafted daily with precision."}
                </p>
              </div>

              {restaurant.opening_hours && (
                <div style={{ background: t.cardBg, borderRadius: 20, padding: 20, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: t.text }}>Opening Hours</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(restaurant.opening_hours).map(([day, slot]) => (
                      <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, borderBottom: `1px solid ${t.border}`, paddingBottom: 6 }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600, color: t.text }}>{day}</span>
                        <span style={{ color: slot.closed ? t.priceText : t.subtext, fontWeight: slot.closed ? 700 : 400 }}>
                          {slot.closed ? 'Closed' : `${slot.open} - ${slot.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW THREE: SECURE CONTACT NODE */}
          {currentTab === 'contact' && (
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: t.text }}>Get in Touch</h3>
              
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.cardBg, padding: 16, borderRadius: 16, textDecoration: 'none', border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                  <span style={{ fontSize: 20 }}>📞</span>
                  <div>
                    <div style={{ fontSize: 12, color: t.subtext }}>Call Us Direct</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{restaurant.phone}</div>
                  </div>
                </a>
              )}

              {restaurant.whatsapp && (
                <a href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.cardBg, padding: 16, borderRadius: 16, textDecoration: 'none', border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                  <span style={{ fontSize: 20 }}>💬</span>
                  <div>
                    <div style={{ fontSize: 12, color: t.subtext }}>WhatsApp Chat</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Connect on WhatsApp</div>
                  </div>
                </a>
              )}

              {restaurant.instagram && (
                <a href={`https://instagram.com/${restaurant.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.cardBg, padding: 16, borderRadius: 16, textDecoration: 'none', border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                  <span style={{ fontSize: 20 }}>📸</span>
                  <div>
                    <div style={{ fontSize: 12, color: t.subtext }}>Instagram Portfolio</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{restaurant.instagram}</div>
                  </div>
                </a>
              )}

              {restaurant.address && (
                <div style={{ background: t.cardBg, padding: 16, borderRadius: 16, border: `1px solid ${t.border}`, boxShadow: t.shadow, marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: t.subtext, marginBottom: 4 }}>Our Location</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, lineHeight: 1.5, marginBottom: 12 }}>{restaurant.address}</div>
                  {restaurant.google_maps_url && (
                    <a href={restaurant.google_maps_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: t.accent, color: t.accentText, padding: '8px 16px', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      📍 Open in Google Maps
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Global Bottom Branding Line */}
        <p style={{ textAlign: 'center', color: t.subtext, fontSize: 11, padding: '24px 0 100px', margin: 0, borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
          Powered by <span style={{ color: t.text, fontWeight: 700 }}>Menuberg</span>
        </p>

        {/* FIXED FOOTER NAV BAR SYSTEM */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 500, background: t.glassBg, backdropFilter: 'blur(24px)', borderTop: `1px solid ${t.border}`, display: 'flex', height: 68, zIndex: 1000, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {(['menu', 'about', 'contact'] as const).map(tab => {
            const isActive = currentTab === tab
            return (
              <button
                key={tab}
                onClick={() => {
                  setCurrentTab(tab)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                style={{
                  flex: 1, border: 'none', background: 'transparent', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  color: isActive ? t.accent : t.subtext, transition: 'color 0.2s ease'
                }}
              >
                <span style={{ fontSize: 20 }}>
                  {tab === 'menu' && '📖'}
                  {tab === 'about' && '✨'}
                  {tab === 'contact' && '📱'}
                </span>
                <span style={{ fontSize: 11, fontWeight: isActive ? 800 : 600, textTransform: 'capitalize' }}>
                  {tab}
                </span>
              </button>
            )
          })}
        </div>

        {/* Item Detail Slider Drawer popup */}
        {selectedItem && (
          <div onClick={() => setSelectedItem(null)} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 500, background: t.surface, borderRadius: '28px 28px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh', boxShadow: '0 -20px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ position: 'relative', height: 240, background: t.bg }}>
                {selectedItem.image_url ? (
                  <img src={selectedItem.image_url} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🍔</div>
                )}
                <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>✕</button>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10 }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: t.text }}>{selectedItem.name}</h2>
                  <span style={{ fontSize: 16, fontWeight: 800, color: t.priceText, background: t.priceBg, padding: '4px 10px', borderRadius: 10 }}>{currency} {selectedItem.price}</span>
                </div>
                {selectedItem.description && <p style={{ margin: 0, fontSize: 14, color: t.subtext, lineHeight: 1.5 }}>{selectedItem.description}</p>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}