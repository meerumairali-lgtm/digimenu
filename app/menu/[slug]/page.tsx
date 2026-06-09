import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!restaurant) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('*, menu_items(*)')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order')

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Hero Header */}
      <div style={{ background: '#111', color: '#fff', padding: '48px 24px 40px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px' }}>{restaurant.name}</h1>
        {restaurant.tagline && (
          <p style={{ margin: '10px 0 0', color: '#aaa', fontSize: 16 }}>{restaurant.tagline}</p>
        )}

        {/* Social Links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {restaurant.whatsapp && (
            <a href={`https://wa.me/${restaurant.whatsapp}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, background: '#25D366', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          )}
          {restaurant.instagram && (
            <a href={`https://instagram.com/${restaurant.instagram}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, background: '#E1306C', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              Instagram
            </a>
          )}
          {restaurant.facebook && (
            <a href={`https://facebook.com/${restaurant.facebook}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, background: '#1877F2', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
          )}
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, background: '#333', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              Call
            </a>
          )}
        </div>
      </div>

      {/* Menu Content */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        {(!categories || categories.length === 0) && (
          <p style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Menu coming soon...</p>
        )}

        {categories?.map(category => (
          <div key={category.id} style={{ marginBottom: 40 }}>
            <h2 style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase', color: '#888', margin: '0 0 16px',
              paddingBottom: 8, borderBottom: '1px solid #e5e5e5'
            }}>
              {category.name}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {category.menu_items?.map((item: any) => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', padding: '14px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#111' }}>{item.name}</p>
                    {item.description && (
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888', lineHeight: 1.4 }}>{item.description}</p>
                    )}
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: 15, color: '#111',
                    whiteSpace: 'nowrap', background: '#f0f0f0',
                    padding: '4px 10px', borderRadius: 6
                  }}>
                    Rs {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact Footer */}
        {(restaurant.address || restaurant.email) && (
          <div style={{ marginTop: 48, padding: 24, background: '#fff', borderRadius: 16, border: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#888' }}>Find Us</h3>
            {restaurant.address && (
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#444', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📍</span> {restaurant.address}
              </p>
            )}
            {restaurant.email && (
              <p style={{ margin: 0, fontSize: 14, color: '#444', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>✉️</span> {restaurant.email}
              </p>
            )}
          </div>
        )}

        {/* Powered by */}
        <p style={{ textAlign: 'center', color: '#ccc', fontSize: 12, marginTop: 40 }}>
          Powered by <strong style={{ color: '#aaa' }}>DigiMenu</strong>
        </p>
      </div>
    </div>
  )
}