import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import MenuClient from './MenuClient'
export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, tagline, about, logo_url')
    .eq('slug', slug)
    .maybeSingle()

  if (!restaurant) {
    return { title: 'Menu Not Found — Menuberg' }
  }

  const description = restaurant.tagline
    || (restaurant.about ? restaurant.about.slice(0, 155) : `View the menu, hours, and location for ${restaurant.name}.`)

  return {
    title: `${restaurant.name} — Menu`,
    description,
    openGraph: {
      title: `${restaurant.name} — Menu`,
      description,
      images: restaurant.logo_url ? [restaurant.logo_url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${restaurant.name} — Menu`,
      description,
    },
  }
}

const TRIAL_DAYS = 7

function daysRemaining(trialStartedAt: string | null): number {
  if (!trialStartedAt) return 0
  const startedMs = new Date(trialStartedAt).getTime()
  const elapsedMs = Date.now() - startedMs
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsedDays))
}

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Figure out if this request arrived on the bare/www domain
  // (menuberg.com/slug — old format) or was already rewritten here
  // from a real subdomain (slug.menuberg.com) by proxy.ts.
  const h = await headers()
  const host = (h.get('host') || '').split(':')[0]
  const isBareOrWww = host === 'menuberg.com' || host === 'www.menuberg.com'

  if (isBareOrWww) {
    redirect(`https://${slug}.menuberg.com`)
  }

  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!restaurant) notFound()

  const stillPaidThroughPeriod =
    restaurant.subscription_status === 'cancelled' &&
    restaurant.next_billed_at &&
    new Date(restaurant.next_billed_at).getTime() > Date.now()

  const unlocked =
    restaurant.subscription_status === 'active' ||
    restaurant.subscription_status === 'past_due' ||
    restaurant.bypass_payment === true ||
    stillPaidThroughPeriod ||
    daysRemaining(restaurant.trial_started_at) > 0

  if (!unlocked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0D1B2A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 440,
            background: '#112240',
            borderRadius: 16,
            padding: '40px 32px',
            border: '1px solid rgba(56,189,248,0.15)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              background: 'rgba(56,189,248,0.1)',
              borderRadius: 12,
              marginBottom: 16,
              border: '1px solid rgba(56,189,248,0.2)',
            }}
          >
            <span style={{ fontSize: 24 }}>🍽️</span>
          </div>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: 20, fontWeight: 700 }}>
            {restaurant.name}
          </h1>
          <p style={{ color: '#7DD3FC', fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>
            This menu is temporarily unavailable.
          </p>
          <p style={{ color: '#5B8AAE', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
            If you&apos;re the owner of this restaurant, log in to your dashboard to reactivate it.
          </p>
        </div>
      </div>
    )
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*, menu_items(*)')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order')

  // Log page view silently — only for unlocked/live menus
  await supabase.from('page_views').insert({ restaurant_id: restaurant.id })

  // Build JSON-LD structured data so Google can show rich results
  // (hours, price range, menu) for this restaurant in search.
  function buildOpeningHoursSpec(openingHours: Record<string, { open: string; close: string; closed: boolean }> | null) {
    if (!openingHours) return undefined
    const dayMap: Record<string, string> = {
      Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday',
      Thursday: 'Thursday', Friday: 'Friday', Saturday: 'Saturday', Sunday: 'Sunday',
    }
    return Object.entries(openingHours)
      .filter(([, hours]) => !hours.closed)
      .map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${dayMap[day]}`,
        opens: hours.open,
        closes: hours.close,
      }))
  }

  const menuSchema = (categories || []).length > 0 ? {
    '@type': 'Menu',
    hasMenuSection: (categories || []).map((cat: any) => ({
      '@type': 'MenuSection',
      name: cat.name,
      hasMenuItem: (cat.menu_items || [])
        .filter((item: any) => item.is_available)
        .map((item: any) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description || undefined,
          offers: {
            '@type': 'Offer',
            price: item.price,
            priceCurrency: restaurant.currency || 'USD',
          },
        })),
    })),
  } : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.tagline || restaurant.about || undefined,
    image: restaurant.logo_url || (restaurant.hero_slides?.[0]?.image_url ?? undefined),
    telephone: restaurant.phone || undefined,
    address: restaurant.address ? {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
      addressLocality: restaurant.city || undefined,
      addressRegion: restaurant.state || undefined,
      addressCountry: restaurant.country || undefined,
    } : undefined,
    url: `https://${restaurant.slug}.menuberg.com`,
    openingHoursSpecification: buildOpeningHoursSpec(restaurant.opening_hours),
    hasMenu: menuSchema,
    sameAs: [
      restaurant.instagram ? `https://instagram.com/${restaurant.instagram}` : undefined,
      restaurant.facebook ? `https://facebook.com/${restaurant.facebook}` : undefined,
    ].filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MenuClient
        restaurant={restaurant}
        categories={categories || []}
      />
    </>
  )
}