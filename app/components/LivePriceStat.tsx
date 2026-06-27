'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrencyForCountry, convertUsd, formatCurrency } from '@/lib/currencyDisplay'

interface TierData {
  id: string
  monthly_price: number
}

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
      const { data: tiers } = await supabase
        .from('pricing_tiers')
        .select('id, monthly_price')

      if (cancelled || !tiers) return

      const tiersTyped = tiers as TierData[]
      const tierA = tiersTyped.find((t) => t.id === 'tier_a')
      const tierB = tiersTyped.find((t) => t.id === 'tier_b')

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
      if (!selected) return

      const converted = convertUsd(selected.monthly_price, currency, rates)
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