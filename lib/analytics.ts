declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** Fires a GA event via the gtag already loaded in app/layout.tsx. No-op if gtag isn't present. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}
