'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Country } from 'country-state-city'

declare global {
  interface Window {
    Paddle: any
  }
}

interface Coupon {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  applies_to: 'setup' | 'monthly' | 'both'
}

const TRIAL_LENGTH_DAYS = 7

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true)
  const [localCurrency, setLocalCurrency] = useState<string | null>(null)
  const [rates, setRates] = useState<Record<string, number> | null>(null)

  // null while we don't know yet, true = trial still running, false = trial expired/never started
  const [trialActive, setTrialActive] = useState<boolean | null>(null)

  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponChecking, setCouponChecking] = useState(false)

  const [paddleReady, setPaddleReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  // Load Paddle.js once, on mount
  useEffect(() => {
    if (window.Paddle) {
      setPaddleReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js'
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Environment.set(
          process.env.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox'
        )
        window.Paddle.Setup({
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
          eventCallback: (event: { name: string }) => {
            if (event.name === 'checkout.completed') {
              setTimeout(() => {
                router.push('/dashboard')
              }, 4000)
            }
          },
        })
        setPaddleReady(true)
      }
    }
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Already have a paid/bypassed restaurant -> nothing to do here
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('subscription_status, bypass_payment, trial_started_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (restaurant && (restaurant.subscription_status === 'active' || restaurant.bypass_payment)) {
      router.push('/dashboard')
      return
    }

    const { data: pending } = await supabase
      .from('pending_signups')
      .select('subscription_status, trial_started_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (pending?.subscription_status === 'active') {
      router.push('/dashboard/setup')
      return
    }

    // Work out whether the 7-day trial is still running, using
    // whichever row actually has a trial_started_at value.
    const trialStartedAt = restaurant?.trial_started_at || pending?.trial_started_at || null
    if (trialStartedAt) {
      const startedMs = new Date(trialStartedAt).getTime()
      const elapsedMs = Date.now() - startedMs
      const trialLengthMs = TRIAL_LENGTH_DAYS * 24 * 60 * 60 * 1000
      setTrialActive(elapsedMs < trialLengthMs)
    } else {
      // No trial_started_at on either row yet -> treat as not active
      // (covers brand-new self-heal case below, before insert happens)
      setTrialActive(false)
    }

    if (!pending) {
      const { error: insertError } = await supabase
        .from('pending_signups')
        .insert({ user_id: user.id })

      if (insertError) {
        console.error('Self-heal pending_signups insert failed:', insertError)
      }

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
  }

  init() // Execute the async function safely inside the effect
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

  async function handleContinueToPayment() {
    if (!paddleReady || submitting) return
    setSubmitting(true)
    setPaymentError('')

    try {
      const res = await fetch('/api/checkout/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: coupon?.code || null }),
      })

      const data = await res.json()

      if (!res.ok || !data.transactionId) {
        setPaymentError(data.error || 'Could not start checkout. Please try again.')
        setSubmitting(false)
        return
      }

      window.Paddle.Checkout.open({
        transactionId: data.transactionId,
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
        },

      })

      setSubmitting(false)
    } catch (err) {
      console.error('Checkout error:', err)
      setPaymentError('Something went wrong starting checkout. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#7DD3FC', fontSize: 14 }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#112240', borderRadius: 16, padding: '40px 32px', border: '1px solid rgba(56,189,248,0.15)' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {trialActive ? (
            <>
              <h1 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 700 }}>Your restaurant is already live</h1>
              <p style={{ color: '#7DD3FC', fontSize: 14, marginTop: 8 }}>Subscribe now to keep it that way after your trial ends.</p>
            </>
          ) : (
            <>
              <h1 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 700 }}>Your trial has ended</h1>
              <p style={{ color: '#7DD3FC', fontSize: 14, marginTop: 8 }}>Subscribe to reactivate your restaurant.</p>
            </>
          )}
        </div>


        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0', borderBottom: '1px solid rgba(56,189,248,0.1)' }}>
          <span style={{ color: '#7DD3FC', fontSize: 14 }}>Monthly</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
              $4.99<span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>/mo</span>
            </div>
          </div>
        </div>

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

        {paymentError && (
          <p style={{ color: '#f87171', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{paymentError}</p>
        )}

        <button
          onClick={handleContinueToPayment}
          disabled={!paddleReady || submitting}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 8,
            background: !paddleReady || submitting ? '#1A3A5C' : '#38BDF8',
            color: !paddleReady || submitting ? '#7DD3FC' : '#0D1B2A',
            border: 'none',
            fontSize: 15,
            fontWeight: 700,
            cursor: !paddleReady || submitting ? 'default' : 'pointer',
            marginTop: 24,
          }}
        >
          {submitting ? 'Starting checkout...' : !paddleReady ? 'Loading...' : 'Continue to payment →'}
        </button>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 16 }}>
          Secure checkout powered by Paddle
        </p>
      </div>
    </div>
  )
}