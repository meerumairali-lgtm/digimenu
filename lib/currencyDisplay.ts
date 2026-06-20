import { Country } from 'country-state-city'

/**
 * Converts a USD amount to the visitor's local currency for DISPLAY only.
 * The real source-of-truth price stays in USD in pricing_tiers; this never
 * affects what gets charged. Falls back to USD if country/rate is unknown.
 */
export function getCurrencyForCountry(countryCode: string | null): string {
  if (!countryCode) return 'USD'
  const country = Country.getCountryByCode(countryCode)
  return country?.currency || 'USD'
}

export function convertUsd(
  amountUsd: number,
  currencyCode: string,
  rates: Record<string, number> | null
): number {
  if (!rates || currencyCode === 'USD') return amountUsd
  const rate = rates[currencyCode.toLowerCase()]
  if (!rate) return amountUsd
  return amountUsd * rate
}

/**
 * Formats an amount as currency using the browser/Node's built-in
 * Intl.NumberFormat, which knows the correct symbol, decimal places,
 * and digit grouping for every ISO 4217 currency code — covering all
 * ~195 countries without us having to hand-maintain a symbol table.
 * Falls back gracefully to a plain "<amount> <CODE>" string if the
 * currency code is ever invalid/unrecognized.
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`
  }
}