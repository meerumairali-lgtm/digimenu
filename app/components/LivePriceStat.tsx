'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrencyForCountry, convertUsd, formatCurrency } from '@/lib/currencyDisplay'
``

export default function LivePriceStat() {
  const [displayPrice, setDisplayPrice] = useState<string | null>(null)

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
      } catch {}

      const currency = getCurrencyForCountry(countryCode)

      let rates: Record<string, number> | null = null
      try {
        const rateRes = await fetch('/api/exchange-rate')
        if (rateRes.ok) {
          const rateJson = await rateRes.json()
          rates = rateJson?.rates || null
        }
      } catch {}

      const supabase = createClient()

const { data: pricing } = await supabase
  .from('pricing_tiers')
  .select('monthly_price')
  .eq('id', 'standard')
  .single()

if (cancelled || !pricing) return

const converted = convertUsd(pricing.monthly_price, currency, rates)
      if (converted == null) return

      if (!cancelled) setDisplayPrice(formatCurrency(converted, currency))
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return <>{displayPrice ?? '—'}</>
}