'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Pricing {
  id: string
  label: string
  monthly_price: number
}

function NumberField({ label, value, onChange }: {
  label: string; value: number | string; onChange: (v: string) => void
}) {
  return (
    <div>
      <label style={{ display: 'block', color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>{label}</label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', background: '#111827', color: '#fff', border: '1px solid #374151', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
      />
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#111827', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: 0 }}>{title}</h2>
      {children}
    </div>
  )
}

export default function PricingClient({ initialPricing }: { initialPricing: Pricing | null }) {
  const supabase = createClient()
  const [pricing, setPricing] = useState<Pricing | null>(initialPricing)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function updateMonthlyPrice(value: string) {
    setPricing(prev => prev ? { ...prev, monthly_price: Number(value) } : prev)
  }

  async function save() {
    if (!pricing) return

    setSaving(true)

    const { error } = await supabase
      .from('pricing_tiers')
      .update({
        monthly_price: Number(pricing.monthly_price),
      })
      .eq('id', 'standard')

    if (error) {
      console.error('Failed to save pricing:', error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>Pricing</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0' }}>
            Changes apply immediately to checkout — no deploy needed. Paddle never needs to be touched.
          </p>
        </div>
        <button onClick={save} disabled={saving}
          style={{ background: saving ? '#1A3A5C' : saved ? '#15803d' : '#38BDF8', color: saving ? '#7DD3FC' : saved ? '#fff' : '#0D1B2A', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {pricing && (
        <Card title={`${pricing.label} (${pricing.id})`}>
          <NumberField
            label="Monthly price (USD)"
            value={pricing.monthly_price}
            onChange={updateMonthlyPrice}
          />
        </Card>
      )}


    </div>
  )
}