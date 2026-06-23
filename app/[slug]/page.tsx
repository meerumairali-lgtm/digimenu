import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MenuClient from './MenuClient'

export const dynamic = 'force-dynamic'

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

  return (
    <MenuClient
      restaurant={restaurant}
      categories={categories || []}
    />
  )
}