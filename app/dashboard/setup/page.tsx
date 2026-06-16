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
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #BAE6FD',
    fontSize: 15,
    width: '100%',
    outline: 'none',
    background: '#f0f9ff',
    color: '#0D1B2A',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600 as const,
    display: 'block' as const,
    marginBottom: 6,
    color: '#1A3A5C',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#112240', borderRadius: 16, padding: '40px 32px', border: '1px solid rgba(56,189,248,0.15)' }}>

        {/* Logo / header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: 'rgba(56,189,248,0.1)', borderRadius: 12, marginBottom: 16, border: '1px solid rgba(56,189,248,0.2)' }}>
            <span style={{ fontSize: 24 }}>🍽️</span>
          </div>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: 22, fontWeight: 700 }}>
            Set up your restaurant
          </h1>
          <p style={{ color: '#7DD3FC', fontSize: 14, marginTop: 8 }}>
            Takes 30 seconds. You can change everything later.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Restaurant name *</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              required
              style={inputStyle}
              placeholder="Spicy Box"
            />
          </div>

          <div>
            <label style={labelStyle}>Your menu URL</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#7DD3FC', fontSize: 13, whiteSpace: 'nowrap' as const }}>menuberg.com/menu/</span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                required
                style={{ ...inputStyle, flex: 1, width: 'auto' }}
                placeholder="spicy-box"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              style={inputStyle}
              placeholder="Taste the Spice!"
            />
          </div>

          <div>
            <label style={labelStyle}>Phone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={inputStyle}
              placeholder="+92-300-1234567"
            />
          </div>

          <div>
            <label style={labelStyle}>Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={inputStyle}
              placeholder="123 Food Street, Karachi"
            />
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: 14, margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: 8,
              background: '#38BDF8',
              color: '#0D1B2A',
              border: 'none',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating...' : 'Create my restaurant →'}
          </button>
        </form>
      </div>
    </div>
  )
}