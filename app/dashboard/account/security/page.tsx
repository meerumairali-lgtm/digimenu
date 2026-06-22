'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SecurityPage() {
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')
      setLoading(false)
    }
    init()
  }, [])

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!currentPassword) { setError('Please enter your current password'); return }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return }

    setSaving(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    })

    if (signInError) {
      setError('Current password is incorrect')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
    } else {
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSaving(false)
    }
  }

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #BAE6FD',
    fontSize: 15,
    width: '100%',
    outline: 'none',
    background: '#fff',
    color: '#0D1B2A',
    boxSizing: 'border-box' as const,
  }

  const disabledInputStyle = {
    ...inputStyle,
    background: '#f1f5f9',
    color: '#64748b',
    cursor: 'not-allowed' as const,
  }

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600 as const,
    display: 'block' as const,
    marginBottom: 6,
    color: '#1A3A5C',
  }

  const sectionStyle = {
    background: '#f0f9ff', borderRadius: 12, padding: 20,
    border: '1px solid #e0f2fe'
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' as const, color: '#0D1B2A' }}>Loading...</div>
  }

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, color: '#0D1B2A' }}>Security</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#0D1B2A' }}>Account Email</h3>
          <input type="email" value={email} disabled readOnly style={disabledInputStyle} />
        </div>

        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#0D1B2A' }}>Change Password</h3>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                style={inputStyle}
                autoComplete="current-password"
              />
            </div>

            <div>
              <label style={labelStyle}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={inputStyle}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={inputStyle}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: 14, margin: 0 }}>{error}</p>
            )}
            {success && (
              <p style={{ color: '#16a34a', fontSize: 14, margin: 0 }}>Password updated successfully.</p>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px',
                borderRadius: 8,
                background: '#38BDF8',
                color: '#0D1B2A',
                border: 'none',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}