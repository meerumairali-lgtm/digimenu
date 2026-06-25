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

const themes: any = {
  dark: {
    bg: '#070A12',
    surface: 'rgba(255,255,255,0.06)',
    text: '#ffffff',
    subtext: 'rgba(255,255,255,0.6)',
    accent: '#38BDF8',
    priceBg: '#38BDF8',
    priceText: '#001018',
    border: 'rgba(255,255,255,0.08)',
    navBg: 'rgba(10,10,20,0.55)',
  }
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

// ── ICONS ─────────────────────────
const Icon = {
  phone: () => <span>📞</span>,
  map: () => <span>📍</span>,
  mail: () => <span>✉️</span>,
  wa: () => <span>🟢</span>,
  ig: () => <span>📷</span>,
}

// ── ITEM POPUP ─────────────────────
function ItemPopup({ item, t, currency, onClose }: any) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      zIndex:9999
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%', maxWidth:680,
        background:t.surface,
        borderRadius:'24px 24px 0 0',
        backdropFilter:'blur(20px)',
        animation:'up 0.25s ease',
        overflow:'hidden'
      }}>
        <style>{`
          @keyframes up { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
        `}</style>

        {item.image_url && (
          <img src={item.image_url} style={{width:'100%', height:240, objectFit:'cover'}} />
        )}

        <div style={{padding:18}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <h2 style={{color:'#fff', margin:0}}>{item.name}</h2>
            <span style={{
              background:t.accent,
              color:'#000',
              padding:'6px 12px',
              borderRadius:999,
              fontWeight:700
            }}>
              {currency} {item.price}
            </span>
          </div>

          <p style={{color:'rgba(255,255,255,0.6)', marginTop:10}}>
            {item.description}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── MAIN ───────────────────────────
export default function MenuClient({ restaurant, categories }: any) {
  const t = themes.dark
  const currency = restaurant.currency || 'PKR'

  const [selectedItem, setSelectedItem] = useState<MenuItem|null>(null)
  const [activeCat, setActiveCat] = useState(categories?.[0]?.id)

  const filtered = categories.map((c:any)=>({
    ...c,
    menu_items: c.menu_items.filter((i:any)=>i.is_available)
  }))

  return (
    <div style={{
      minHeight:'100vh',
      background:t.bg,
      fontFamily:'system-ui'
    }}>

      {selectedItem && (
        <ItemPopup item={selectedItem} t={t} currency={currency} onClose={()=>setSelectedItem(null)} />
      )}

      {/* HERO */}
      <div style={{
        padding:'70px 20px 40px',
        textAlign:'center',
        background:'radial-gradient(circle at top, #38BDF833, transparent 60%)'
      }}>
        <h1 style={{color:'#fff', fontSize:34, margin:0}}>
          {restaurant.name}
        </h1>
        <p style={{color:'rgba(255,255,255,0.6)'}}>
          {restaurant.tagline}
        </p>
      </div>

      {/* CATEGORY BAR */}
      <div style={{
        position:'sticky',
        top:0,
        zIndex:10,
        display:'flex',
        gap:8,
        padding:'10px',
        overflowX:'auto',
        background:t.navBg,
        backdropFilter:'blur(16px)'
      }}>
        {filtered.map((c:any)=>(
          <button
            key={c.id}
            onClick={()=>setActiveCat(c.id)}
            style={{
              padding:'8px 14px',
              borderRadius:999,
              border:'none',
              cursor:'pointer',
              whiteSpace:'nowrap',
              background:activeCat===c.id ? t.accent : 'transparent',
              color:activeCat===c.id ? '#000' : '#fff'
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* MENU */}
      <div style={{maxWidth:700, margin:'0 auto', padding:16}}>
        {filtered.filter((c:any)=>c.id===activeCat).map((c:any)=>(
          <div key={c.id}>
            <h3 style={{color:'#fff', margin:'20px 0 10px'}}>{c.name}</h3>

            <div style={{display:'grid', gap:12}}>
              {c.menu_items.map((item:any)=>(
                <div
                  key={item.id}
                  onClick={()=>setSelectedItem(item)}
                  style={{
                    background:t.surface,
                    border:'1px solid rgba(255,255,255,0.08)',
                    borderRadius:18,
                    padding:12,
                    display:'flex',
                    gap:12,
                    cursor:'pointer',
                    transition:'0.2s'
                  }}
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      style={{
                        width:80,
                        height:80,
                        borderRadius:12,
                        objectFit:'cover'
                      }}
                    />
                  )}

                  <div style={{flex:1}}>
                    <div style={{
                      display:'flex',
                      justifyContent:'space-between'
                    }}>
                      <b style={{color:'#fff'}}>{item.name}</b>
                      <span style={{
                        color:'#000',
                        background:t.accent,
                        padding:'4px 10px',
                        borderRadius:999,
                        fontSize:12,
                        fontWeight:700
                      }}>
                        {currency} {item.price}
                      </span>
                    </div>

                    <p style={{
                      margin:0,
                      fontSize:12,
                      color:'rgba(255,255,255,0.6)'
                    }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{
        textAlign:'center',
        padding:40,
        color:'rgba(255,255,255,0.3)',
        fontSize:12
      }}>
        Powered by Menuberg
      </div>
    </div>
  )
}