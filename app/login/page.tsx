'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: 24 }}>Welcome back</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }}
        />
        {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '12px', borderRadius: 8, background: '#000', color: '#fff', border: 'none', fontSize: 15, cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>Don't have an account? <Link href="/signup">Sign up</Link></p>
    </div>
  )
}