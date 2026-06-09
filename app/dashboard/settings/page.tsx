'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '', slug: '', tagline: '', phone: '',
    address: '', email: '', whatsapp: '', instagram: '', facebook: ''
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

        {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: 'green', fontSize: 14 }}>{success}</p>}

        <button type="submit" disabled={saving} style={{
          padding: '12px', borderRadius: 8, background: '#000',
          color: '#fff', border: 'none', fontSize: 15, cursor: 'pointer'
        }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}