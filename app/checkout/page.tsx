'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Country } from 'country-state-city'

interface Tier { id: string; label: string; setup_fee: number; monthly_price: number }
interface Coupon {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  applies_to: 'setup' | 'monthly' | 'both'
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true)
  const [tier, setTier] = useState<Tier | null>(null)
  const [localCurrency, setLocalCurrency] = useState<string | null>(null)
  const [rates, setRates] = useState<Record<string, number> | null>(null)

  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponChecking, setCouponChecking] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Already have a paid/bypassed restaurant -> nothing to do here
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('subscription_status, bypass_payment')
        .eq('user_id', user.id)
        .maybeSingle()

      if (restaurant && (restaurant.subscription_status === 'active' || restaurant.bypass_payment)) {
        router.push('/dashboard')
        return
      }

      const { data: pending } = await supabase
        .from('pending_signups')
        .select('pricing_tier, subscription_status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (pending?.subscription_status === 'active') {
        router.push('/dashboard/setup')
        return
      }

      const tierId = pending?.pricing_tier || 'tier_a'
      const { data: tierRow } = await supabase
        .from('pricing_tiers')
        .select('id, label, setup_fee, monthly_price')
        .eq('id', tierId)
        .single()

      if (tierRow) setTier(tierRow)

      // Currency estimate (display only — real local-currency billing
      // happens inside Paddle's own checkout once that's wired up)
      try {
        const geo = await fetch('/api/dashboard/detect-country').then(r => r.json())
        if (geo.country_code) {
          const country = Country.getCountryByCode(geo.country_code)
          if (country?.currency) setLocalCurrency(country.currency)
        }
        const rateRes = await fetch('/api/exchange-rate').then(r => r.json())
        if (rateRes.rates) setRates(rateRes.rates)
      } catch (e) {
        console.error('Currency estimate failed:', e)
      }

      setLoading(false)
    }
    init()
  }, [])

  function formatLocal(usdAmount: number): string | null {
    if (!localCurrency || !rates) return null
    const rate = rates[localCurrency.toLowerCase()]
    if (!rate) return null
    const converted = usdAmount * rate
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: localCurrency }).format(converted)
    } catch {
      return `${converted.toFixed(2)} ${localCurrency}`
    }
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCouponChecking(true)
    setCouponError('')
    setCoupon(null)

    const { data, error } = await supabase
      .from('coupons')
      .select('code, discount_type, discount_value, applies_to, is_active, expires_at, max_redemptions, times_redeemed')
      .ilike('code', couponInput.trim())
      .maybeSingle()

    setCouponChecking(false)

    if (error || !data) { setCouponError('Coupon not found'); return }
    if (!data.is_active) { setCouponError('This coupon is no longer active'); return }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setCouponError('This coupon has expired'); return }
    if (data.max_redemptions && data.times_redeemed >= data.max_redemptions) { setCouponError('This coupon has reached its usage limit'); return }

    setCoupon(data)
  }

  function discounted(amount: number, type: 'setup' | 'monthly'): number {
    if (!coupon) return amount
    if (coupon.applies_to !== 'both' && coupon.applies_to !== type) return amount
    if (coupon.discount_type === 'percent') return Math.max(0, amount - (amount * coupon.discount_value) / 100)
    return Math.max(0, amount - coupon.discount_value)
  }

  function handleContinueToPayment() {
    // TODO: once Paddle products/prices are created, this calls a server
    // route that creates a Paddle transaction (re-validating the coupon
    // server-side) and opens Paddle.js checkout.
    alert('Payment isn\'t wired up yet — Paddle products need to be created first. This button will open the real checkout once that\'s done.')
  }

  if (loading || !tier) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#7DD3FC', fontSize: 14 }}>Loading...</p>
      </div>
    )
  }

  const setupPrice = discounted(tier.setup_fee, 'setup')
  const monthlyPrice = discounted(tier.monthly_price, 'monthly')

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#112240', borderRadius: 16, padding: '40px 32px', border: '1px solid rgba(56,189,248,0.15)' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 700 }}>Complete your setup</h1>
          <p style={{ color: '#7DD3FC', fontSize: 14, marginTop: 8 }}>One step left before your menu goes live.</p>
        </div>

        {/* Setup fee */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
          <span style={{ color: '#7DD3FC', fontSize: 14 }}>One-time setup</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
              ${setupPrice.toFixed(2)}
              {coupon && setupPrice !== tier.setup_fee && (
                <span style={{ color: '#64748b', fontSize: 13, fontWeight: 400, textDecoration: 'line-through', marginLeft: 8 }}>${tier.setup_fee.toFixed(2)}</span>
              )}
            </div>
            {formatLocal(setupPrice) && <div style={{ color: '#64748b', fontSize: 12 }}>≈ {formatLocal(setupPrice)}</div>}
          </div>
        </div>

        {/* Monthly */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
          <span style={{ color: '#7DD3FC', fontSize: 14 }}>Then monthly</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
              ${monthlyPrice.toFixed(2)}<span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>/mo</span>
              {coupon && monthlyPrice !== tier.monthly_price && (
                <span style={{ color: '#64748b', fontSize: 13, fontWeight: 400, textDecoration: 'line-through', marginLeft: 8 }}>${tier.monthly_price.toFixed(2)}</span>
              )}
            </div>
            {formatLocal(monthlyPrice) && <div style={{ color: '#64748b', fontSize: 12 }}>≈ {formatLocal(monthlyPrice)}/mo</div>}
          </div>
        </div>

        {/* Coupon */}
        <div style={{ marginTop: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#1A3A5C', display: 'block', marginBottom: 6 }}>Coupon code</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={couponInput}
              onChange={e => setCouponInput(e.target.value)}
              placeholder="Optional"
              disabled={!!coupon}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #BAE6FD', fontSize: 14, background: '#f0f9ff', color: '#0D1B2A', outline: 'none' }}
            />
            {coupon ? (
              <button onClick={() => { setCoupon(null); setCouponInput(''); setCouponError('') }}
                style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', fontSize: 13, cursor: 'pointer' }}>
                Remove
              </button>
            ) : (
              <button onClick={applyCoupon} disabled={couponChecking}
                style={{ padding: '10px 16px', borderRadius: 8, background: '#38BDF8', border: 'none', color: '#0D1B2A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {couponChecking ? '...' : 'Apply'}
              </button>
            )}
          </div>
          {couponError && <p style={{ color: '#f87171', fontSize: 13, marginTop: 6 }}>{couponError}</p>}
          {coupon && <p style={{ color: '#38BDF8', fontSize: 13, marginTop: 6 }}>✓ "{coupon.code}" applied</p>}
        </div>

        <button
          onClick={handleContinueToPayment}
          style={{ width: '100%', padding: '14px', borderRadius: 8, background: '#38BDF8', color: '#0D1B2A', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 24 }}
        >
          Continue to payment →
        </button>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 16 }}>
          Secure checkout powered by Paddle
        </p>
      </div>
    </div>
  )
}