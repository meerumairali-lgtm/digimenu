'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrencyForCountry, convertUsd, formatCurrency } from '@/lib/currencyDisplay'

interface TierData {
  id: string
  label: string
  setup_fee: number
  monthly_price: number
  intro_discount_active: boolean
  intro_monthly_price: number | null
  intro_duration_months: number
}

const STATIC_FEATURES = [
  'Your storefront live at — menuberg.com/yourname',
  'High-quality QR codes to print on tables and packaging',
  'Unlimited categories, items, and photos',
  'An affordable digital presence that works just like a website',
  'Complete pages featuring your Menu, About section, and Contact info',
  'Instant updates to change prices or hide sold-out items',
  'Fully mobile-responsive for all screen sizes',
]

export default function PricingBanner() {
  const [tier, setTier] = useState<TierData | null>(null)
  const [currency, setCurrency] = useState('USD')
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      let countryCode: string | null = null
      try {
        const res = await fetch('/api/dashboard/detect-country')
        if (res.ok) {
          const json = await res.json()
          countryCode = json?.country_code || json?.countryCode || null
        }
      } catch {
        // fails silently, falls back to tier_a / USD below
      }

      const detectedCurrency = getCurrencyForCountry(countryCode)

      try {
        const rateRes = await fetch('/api/exchange-rate')
        if (rateRes.ok) {
          const rateJson = await rateRes.json()
          if (!cancelled && rateJson?.rates) setRates(rateJson.rates)
        }
      } catch {
        // falls back to USD via convertUsd's null-rates guard
      }

      if (!cancelled) setCurrency(detectedCurrency)

      const supabase = createClient()
      const { data: tiers } = await supabase
        .from('pricing_tiers')
        .select(
          'id, label, setup_fee, monthly_price, intro_discount_active, intro_monthly_price, intro_duration_months'
        )

      if (cancelled || !tiers) return

      const tiersTyped = tiers as TierData[]
      const tierB = tiersTyped.find((t: TierData) => t.id === 'tier_b')
      const tierA = tiersTyped.find((t: TierData) => t.id === 'tier_a')

      // Determine tier by checking country against tier_b's country list
      const { data: tierBFull } = await supabase
        .from('pricing_tiers')
        .select('countries')
        .eq('id', 'tier_b')
        .single()

      const isTierB =
        countryCode &&
        tierBFull?.countries &&
        Array.isArray(tierBFull.countries) &&
        tierBFull.countries.includes(countryCode)

      const selected = isTierB ? tierB : tierA
      if (selected) setTier(selected as TierData)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const showIntro = tier?.intro_discount_active && tier?.intro_monthly_price != null
  const displayPriceUsd = showIntro ? tier!.intro_monthly_price! : tier?.monthly_price
  const crossedPriceUsd = showIntro ? tier?.monthly_price : null
  const introMonths = tier?.intro_duration_months ?? 3

  const displayPrice =
    displayPriceUsd != null ? convertUsd(displayPriceUsd, currency, rates) : null
  const crossedPrice =
    crossedPriceUsd != null ? convertUsd(crossedPriceUsd, currency, rates) : null
  const setupFee =
    tier?.setup_fee != null ? convertUsd(tier.setup_fee, currency, rates) : null

  const discountPercent =
    showIntro && tier && tier.monthly_price
      ? Math.round((1 - tier.intro_monthly_price! / tier.monthly_price) * 100)
      : null

  return (
    <section
      id="pricing"
      style={{ padding: '6rem 2rem', textAlign: 'center', background: '#fff' }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase' as const,
          color: '#38BDF8',
          marginBottom: '0.8rem',
        }}
      >
        Pricing
      </div>
      <h2
        style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 800,
          color: '#111',
          marginBottom: '0.5rem',
          letterSpacing: '-1px',
        }}
      >
        Less than a burger a month
      </h2>
      <p style={{ fontSize: '16px', color: '#888', marginBottom: '3rem' }}>
        Honest, simple pricing. Cancel anytime.
      </p>

      <div
        style={{
          maxWidth: '440px',
          margin: '0 auto',
          background: '#fff',
          border: '2px solid #38BDF8',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          textAlign: 'left',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(56,189,248,0.1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#38BDF8',
            color: '#0D1B2A',
            fontSize: '11px',
            fontWeight: 700,
            padding: '5px 20px',
            borderRadius: '20px',
            whiteSpace: 'nowrap' as const,
            letterSpacing: '0.5px',
          }}
        >
          Your professional digital storefront
        </div>

        {/* Subscription Section */}
        <div
          style={{
            marginBottom: '1.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#aaa',
              textTransform: 'uppercase' as const,
              letterSpacing: '1px',
              marginBottom: '0.8rem',
            }}
          >
            Subscription
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              {loading ? (
                <div
                  style={{
                    width: '120px',
                    height: '48px',
                    background: '#f0f0f0',
                    borderRadius: '8px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              ) : (
                <>
                  {crossedPrice != null && (
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#aaa',
                        textDecoration: 'line-through',
                        fontWeight: 500,
                        marginBottom: '2px',
                        marginLeft: '2px',
                      }}
                    >
                      {formatCurrency(crossedPrice, currency)}
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      color: '#111',
                      fontWeight: 800,
                      letterSpacing: '-2px',
                      lineHeight: 1,
                    }}
                  >
                    <span style={{ fontSize: '48px' }}>
                      {displayPrice != null ? formatCurrency(displayPrice, currency) : '—'}
                    </span>
                    <span
                      style={{
                        fontSize: '15px',
                        color: '#aaa',
                        fontWeight: 400,
                        letterSpacing: 0,
                        alignSelf: 'flex-end',
                        marginBottom: '6px',
                        marginLeft: '4px',
                      }}
                    >
                      /month
                    </span>
                  </div>
                </>
              )}
            </div>

            {showIntro && discountPercent != null && discountPercent > 0 && (
              <div
                style={{
                  background: '#0D1B2A',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(13,27,42,0.15)',
                }}
              >
                <div
                  style={{
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase' as const,
                    marginBottom: '1px',
                  }}
                >
                  Limited Time Offer
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#F59E0B',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                  }}
                >
                  {discountPercent}% OFF
                </div>
              </div>
            )}
          </div>

          {showIntro ? (
            <p
              style={{
                fontSize: '13px',
                color: '#888',
                margin: '12px 0 0',
              }}
            >
              Your first <strong style={{ color: '#0D1B2A' }}>{introMonths} months</strong>{' '}
              at this price, then {crossedPrice != null ? formatCurrency(crossedPrice, currency) : '—'}/month after. Keep your menu
              live, modern, and always online.
            </p>
          ) : (
            <p style={{ fontSize: '13px', color: '#888', margin: '12px 0 0' }}>
              Less than the price of a burger. Keep your menu live, modern, and always online.
            </p>
          )}
        </div>

        {/* One-Time Setup */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              fontSize: '11px',
              color: '#aaa',
              textTransform: 'uppercase' as const,
              letterSpacing: '1px',
              marginBottom: '0.5rem',
            }}
          >
            One-Time Setup Fee
          </div>

          {loading ? (
            <div
              style={{
                width: '90px',
                height: '36px',
                background: '#f0f0f0',
                borderRadius: '8px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                color: '#444',
                fontWeight: 800,
                letterSpacing: '-1px',
                lineHeight: 1,
              }}
            >
              <span style={{ fontSize: '36px' }}>
                {setupFee != null ? formatCurrency(setupFee, currency) : '—'}
              </span>
            </div>
          )}

          <p style={{ fontSize: '13px', color: '#888', margin: '10px 0 0' }}>
            <strong>We set it up for you.</strong> Send us your menu and we'll configure
            your page so it's ready to launch flawlessly.
          </p>
        </div>

        {/* Value Props */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 2rem',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '12px',
          }}
        >
          {STATIC_FEATURES.map((f) => (
            <li
              key={f}
              style={{
                fontSize: '14px',
                color: '#333',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                lineHeight: '1.4',
              }}
            >
              <span style={{ color: '#38BDF8', fontWeight: 700, flexShrink: 0, fontSize: '16px' }}>
                ✓
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/signup"
          style={{
            display: 'block',
            padding: '15px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 700,
            background: '#38BDF8',
            color: '#0D1B2A',
            textDecoration: 'none',
            textAlign: 'center' as const,
          }}
        >
          Launch your storefront
        </Link>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '13px', color: '#bbb' }}>
        Cancel anytime · No contract or setup hassle ·{' '}
        <Link href="/pricing" style={{ color: '#7DD3FC', textDecoration: 'underline' }}>
          See full pricing details
        </Link>
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  )
}