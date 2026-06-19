const CDN_URL = (base: string) =>
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.min.json`
const FALLBACK_URL = (base: string) =>
  `https://latest.currency-api.pages.dev/v1/currencies/${base}.min.json`

// Free, no API key, 200+ currencies, updates daily. Cached for 6 hours
// so we're not re-fetching on every page load.
export async function getUsdExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(CDN_URL('usd'), { next: { revalidate: 21600 } })
    if (res.ok) {
      const data = await res.json()
      if (data?.usd) return data.usd
    }
  } catch {
    // fall through to backup CDN
  }
  try {
    const res = await fetch(FALLBACK_URL('usd'), { next: { revalidate: 21600 } })
    if (res.ok) {
      const data = await res.json()
      if (data?.usd) return data.usd
    }
  } catch {
    // both sources failed — caller should handle null gracefully
  }
  return null
}