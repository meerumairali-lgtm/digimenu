'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AffiliateLogin() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/affiliates/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Login failed')
      setLoading(false)
      return
    }

    const affiliate = data.affiliate
    if (!affiliate.profile_completed) {
      router.push('/affiliate/setup')
    } else {
      router.push('/affiliate/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#112240', borderRadius: 16, padding: '40px 32px', border: '1px solid rgba(56,189,248,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 700 }}>Affiliate Portal</h1>
          <p style={{ color: '#7DD3FC', fontSize: 14, marginTop: 8 }}>Sign in to your affiliate dashboard</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#7DD3FC', display: 'block', marginBottom: 6 }}>Username</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="your_username"
              style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.3)', fontSize: 14, width: '100%', background: '#0D1B2A', color: '#fff', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#7DD3FC', display: 'block', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.3)', fontSize: 14, width: '100%', background: '#0D1B2A', color: '#fff', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px', borderRadius: 8, background: '#38BDF8', color: '#0D1B2A', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#4A6FA5', fontSize: 12, marginTop: 24 }}>
          Powered by Menuberg
        </p>
      </div>
    </div>
  )
}