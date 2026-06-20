'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Tier {
  id: string
  label: string
  setup_fee: number
  monthly_price: number
  intro_discount_active: boolean
  intro_monthly_price: number | null
  intro_duration_months: number
  countries: string[]
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

export default function PricingClient({ initialTiers }: { initialTiers: Tier[] }) {
  const supabase = createClient()
  const [tiers, setTiers] = useState<Tier[]>(initialTiers)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function updateTier(id: string, field: keyof Tier, value: any) {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  async function save() {
    setSaving(true)
    for (const t of tiers) {
      await supabase
        .from('pricing_tiers')
        .update({
          setup_fee: Number(t.setup_fee),
          monthly_price: Number(t.monthly_price),
          intro_discount_active: t.intro_discount_active,
          intro_monthly_price: t.intro_monthly_price != null ? Number(t.intro_monthly_price) : null,
          intro_duration_months: Number(t.intro_duration_months),
        })
        .eq('id', t.id)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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

      {tiers.map(tier => (
        <Card key={tier.id} title={`${tier.label} (${tier.id})`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <NumberField
              label="One-time setup fee (USD)"
              value={tier.setup_fee}
              onChange={v => updateTier(tier.id, 'setup_fee', v)}
            />
            <NumberField
              label="Monthly price (USD)"
              value={tier.monthly_price}
              onChange={v => updateTier(tier.id, 'monthly_price', v)}
            />
          </div>

          <div style={{ borderTop: '1px solid #374151', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={tier.intro_discount_active}
                onChange={e => updateTier(tier.id, 'intro_discount_active', e.target.checked)}
              />
              Enable intro discount (charges a lower price for the first few months, then switches to the price above)
            </label>

            {tier.intro_discount_active && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <NumberField
                  label="Intro monthly price (USD)"
                  value={tier.intro_monthly_price ?? ''}
                  onChange={v => updateTier(tier.id, 'intro_monthly_price', v === '' ? null : v)}
                />
                <NumberField
                  label="Intro duration (months)"
                  value={tier.intro_duration_months}
                  onChange={v => updateTier(tier.id, 'intro_duration_months', v)}
                />
              </div>
            )}
          </div>

          <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
            Countries assigned to this tier: {tier.countries?.length ? tier.countries.join(', ') : 'none (default tier — applies to all countries not listed elsewhere)'}
          </p>
        </Card>
      ))}

      <div style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '12px', padding: '16px' }}>
        <p style={{ color: '#7DD3FC', fontSize: '12px', margin: 0, lineHeight: 1.6 }}>
          ⓘ Note: the intro 3-month switch-over to the regular price is not automatic yet on existing subscriptions —
          customers who already signed up keep paying their intro price until that feature is built. Changes here only
          affect new signups going forward.
        </p>
      </div>
    </div>
  )
}