'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const THEMES = [
  { id: 'light', label: 'Light', bg: '#ffffff', accent: '#f97316' },
  { id: 'dark', label: 'Dark', bg: '#111111', accent: '#f97316' },
  { id: 'gold', label: 'Gold', bg: '#1a1200', accent: '#d4a017' },
  { id: 'vibrant', label: 'Vibrant', bg: '#0f172a', accent: '#f97316' },
]

const CURRENCIES = [
  { code: 'PKR', label: 'PKR — Pakistani Rupee' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'SAR', label: 'SAR — Saudi Riyal' },
  { code: 'INR', label: 'INR — Indian Rupee' },
]

const LAYOUTS = [
  { id: 'classic', label: 'Classic', desc: 'Clean list, no images', icon: '☰' },
  { id: 'list', label: 'List', desc: 'Rows with small thumbnail', icon: '▤' },
  { id: 'cards', label: 'Cards', desc: 'Grid with big images', icon: '⊞' },
  { id: 'swipe', label: 'Swipe', desc: 'Horizontal carousel', icon: '⟺' },
]

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '', slug: '', tagline: '', phone: '',
    address: '', email: '', whatsapp: '', instagram: '', facebook: '',
    theme: 'light', currency: 'PKR', layout: 'classic'
  })
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('restaurants').select('*').eq('user_id', user.id).single()
      if (data) setForm({
        name: data.name || '',
        slug: data.slug || '',
        tagline: data.tagline || '',
        phone: data.phone || '',
        address: data.address || '',
        email: data.email || '',
        whatsapp: data.whatsapp || '',
        instagram: data.instagram || '',
        facebook: data.facebook || '',
        theme: data.theme || 'light',
        currency: data.currency || 'PKR',
        layout: data.layout || 'classic',
      })
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('restaurants').update(form).eq('user_id', user.id)
    if (error) setError(error.message)
    else setSuccess('Saved successfully!')
    setSaving(false)
  }

  const inputStyle = {
    padding: '10px 14px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 14, width: '100%',
    boxSizing: 'border-box' as const
  }

  const labelStyle = {
    fontSize: 13, fontWeight: 600 as const,
    display: 'block' as const, marginBottom: 6, color: '#444'
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' as const }}>Loading...</div>

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0 }}>Restaurant Settings</h1>
        <button onClick={() => router.push('/dashboard')}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}>
          ← Back
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Basic Info */}
        <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Basic Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Restaurant Name</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={labelStyle}>Tagline</label>
              <input style={inputStyle} value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="Taste the Spice!" />
            </div>
            <div>
              <label style={labelStyle}>Menu URL slug</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>digimenu.app/menu/</span>
                <input style={{ ...inputStyle, flex: 1 }} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Contact</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+92-300-1234567" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="hello@restaurant.com" />
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Food Street, Karachi" />
            </div>
          </div>
        </div>

        {/* Social */}
        <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>Social Media</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>WhatsApp number</label>
              <input style={inputStyle} value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="923001234567" />
            </div>
            <div>
              <label style={labelStyle}>Instagram handle</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#888' }}>instagram.com/</span>
                <input style={{ ...inputStyle, flex: 1 }} value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="spicybox" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Facebook handle</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#888' }}>facebook.com/</span>
                <input style={{ ...inputStyle, flex: 1 }} value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} placeholder="spicybox" />
              </div>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Menu Theme</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>How your public menu page looks to customers</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {THEMES.map(t => (
              <div
                key={t.id}
                onClick={() => setForm({ ...form, theme: t.id })}
                style={{
                  cursor: 'pointer', borderRadius: 10, overflow: 'hidden',
                  border: form.theme === t.id ? '2px solid #f97316' : '2px solid transparent',
                  outline: form.theme === t.id ? '1px solid #f97316' : '1px solid #e5e5e5',
                }}
              >
                <div style={{ background: t.bg, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 24, height: 4, borderRadius: 2, background: t.accent, opacity: 0.8 }} />
                </div>
                <div style={{ padding: '6px 8px', background: '#fff', textAlign: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: form.theme === t.id ? 600 : 400, color: form.theme === t.id ? '#f97316' : '#555' }}>
                    {t.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Layout */}
        <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Menu Layout</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>How items are displayed to customers</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {LAYOUTS.map(l => (
              <div
                key={l.id}
                onClick={() => setForm({ ...form, layout: l.id })}
                style={{
                  cursor: 'pointer', borderRadius: 10, padding: '14px 16px',
                  border: form.layout === l.id ? '2px solid #f97316' : '2px solid #e5e5e5',
                  background: form.layout === l.id ? '#fff4ed' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{l.icon}</div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: form.layout === l.id ? '#f97316' : '#333' }}>{l.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{l.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Currency</h3>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#888' }}>Shown next to prices on your menu</p>
          <select
            value={form.currency}
            onChange={e => setForm({ ...form, currency: e.target.value })}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>

        {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: '#16a34a', fontSize: 14 }}>{success}</p>}

        <button type="submit" disabled={saving} style={{
          padding: '12px', borderRadius: 8, background: '#f97316',
          color: '#fff', border: 'none', fontSize: 15, cursor: 'pointer',
          fontWeight: 600, marginBottom: 40
        }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}