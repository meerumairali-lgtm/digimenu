'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AffiliateSetup() {
  const [form, setForm] = useState({
    email: '', phone: '', address: '', city: '',
    age: '', bank_name: '', bank_account_number: '',
    bank_account_title: '', cnic: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function f(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/affiliates/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to save profile')
      setLoading(false)
      return
    }

    router.push('/affiliate/dashboard')
  }

  const inputStyle = {
    padding: '10px 14px', borderRadius: 8,
    border: '1px solid rgba(56,189,248,0.3)',
    fontSize: 14, width: '100%',
    background: '#0D1B2A', color: '#fff',
    boxSizing: 'border-box' as const, outline: 'none',
  }

  const labelStyle = {
    fontSize: 13, fontWeight: 600 as const,
    color: '#7DD3FC', display: 'block' as const, marginBottom: 6,
  }

  const required = <span style={{ color: '#ef4444' }}> *</span>

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#112240', borderRadius: 16, padding: '40px 32px', border: '1px solid rgba(56,189,248,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 700 }}>Complete your profile</h1>
          <p style={{ color: '#7DD3FC', fontSize: 14, marginTop: 8 }}>This information is required before you can access your dashboard. It's used for payment processing only.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ background: 'rgba(56,189,248,0.05)', borderRadius: 10, padding: 16, border: '1px solid rgba(56,189,248,0.1)' }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 1 }}>Personal info</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Email address{required}</label>
                <input type="email" required value={form.email} onChange={e => f('email', e.target.value)} placeholder="you@example.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone number{required}</label>
                <input type="text" required value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="03001234567" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Age{required}</label>
                  <input type="number" required min={18} max={65} value={form.age} onChange={e => f('age', e.target.value)} placeholder="22" style={inputStyle} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={labelStyle}>CNIC number{required}</label>
                  <input type="text" required value={form.cnic} onChange={e => f('cnic', e.target.value)} placeholder="12345-1234567-1" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>City{required}</label>
                <input type="text" required value={form.city} onChange={e => f('city', e.target.value)} placeholder="Karachi" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Full address{required}</label>
                <input type="text" required value={form.address} onChange={e => f('address', e.target.value)} placeholder="House #, Street, Area" style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(56,189,248,0.05)', borderRadius: 10, padding: 16, border: '1px solid rgba(56,189,248,0.1)' }}>
            <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 1 }}>Bank details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Bank name{required}</label>
                <input type="text" required value={form.bank_name} onChange={e => f('bank_name', e.target.value)} placeholder="HBL / Meezan / Easypaisa etc." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Account title{required}</label>
                <input type="text" required value={form.bank_account_title} onChange={e => f('bank_account_title', e.target.value)} placeholder="As it appears on your account" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Account / IBAN number{required}</label>
                <input type="text" required value={form.bank_account_number} onChange={e => f('bank_account_number', e.target.value)} placeholder="PK00XXXX0000000000000000" style={inputStyle} />
              </div>
            </div>
          </div>

          {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px', borderRadius: 8, background: '#38BDF8', color: '#0D1B2A', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving...' : 'Save & continue →'}
          </button>
        </form>
      </div>
    </div>
  )
}