'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div style={{ maxWidth: 400, margin: '100px auto', padding: '0 20px' }}>
        <h1 style={{ marginBottom: 12 }}>Check your email</h1>
        <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6 }}>
          We sent a password reset link to <strong>{email}</strong>. Check your inbox and click the link to reset your password.
        </p>
        <p style={{ marginTop: 24, fontSize: 14 }}>
          <Link href="/login" style={{ color: '#000' }}>← Back to login</Link>
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: 8 }}>Forgot password</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
        Enter your email and we'll send you a reset link.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }}
        />
        {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '12px', borderRadius: 8, background: '#000', color: '#fff', border: 'none', fontSize: 15, cursor: 'pointer' }}
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>
        <Link href="/login" style={{ color: '#666' }}>← Back to login</Link>
      </p>
    </div>
  )
}