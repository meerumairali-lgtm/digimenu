'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [tagline, setTagline] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)
    setSlug(generateSlug(e.target.value))
  }

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError('')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { router.push('/login'); return }

  const { error } = await supabase.from('restaurants').insert({
    user_id: user.id,
    name,
    slug,
    tagline,
    phone,
    address,
  })

  if (error) {
    setError(error.message)
    setLoading(false)
  } else {
    router.refresh()
    router.push('/dashboard')
  }
}

  const inputStyle = {
    padding: '10px 14px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 15, width: '100%'
  }

  return (
    <div style={{ maxWidth: 500, margin: '60px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: 8 }}>Set up your restaurant</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>This takes 30 seconds. You can change everything later.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Restaurant name *</label>
          <input type="text" value={name} onChange={handleNameChange} required style={inputStyle} placeholder="Spicy Box" />
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Your menu URL</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#888', fontSize: 14 }}>digimenu.app/menu/</span>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required style={{ ...inputStyle, width: 'auto', flex: 1 }} placeholder="spicy-box" />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tagline</label>
          <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} style={inputStyle} placeholder="Taste the Spice!" />
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Phone</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="+92-300-1234567" />
        </div>

        <div>
          <label style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 6 }}>Address</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} placeholder="123 Food Street, Karachi" />
        </div>

        {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}

        <button type="submit" disabled={loading} style={{
          padding: '12px', borderRadius: 8, background: '#000',
          color: '#fff', border: 'none', fontSize: 15, cursor: 'pointer', marginTop: 8
        }}>
          {loading ? 'Creating...' : 'Create my restaurant →'}
        </button>
      </form>
    </div>
  )
}