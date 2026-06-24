import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import AnnouncementBanner from './AnnouncementBanner'
import DashboardNav from './DashboardNav'

export const dynamic = 'force-dynamic'

const TRIAL_DAYS = 7

type Announcement = {
  id: string
  title: string
  message: string
}

async function getVisibleAnnouncements(userId: string): Promise<Announcement[]> {
  const supabase = await createClient()

  const [{ data: announcements }, { data: dismissed }] = await Promise.all([
    supabase
      .from('announcements')
      .select('id, title, message')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('dismissed_announcements')
      .select('announcement_id')
      .eq('user_id', userId),
  ])

  const dismissedIds = new Set((dismissed || []).map((d) => d.announcement_id))
  return (announcements || []).filter((a) => !dismissedIds.has(a.id))
}

function daysRemaining(trialStartedAt: string | null): number {
  if (!trialStartedAt) return 0
  const startedMs = new Date(trialStartedAt).getTime()
  const elapsedMs = Date.now() - startedMs
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsedDays))
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let menuUrl = '/dashboard'
  let trialDaysLeft: number | null = null

  if (user) {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('slug, subscription_status, bypass_payment, trial_started_at, next_billed_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (restaurant) {
      const stillPaidThroughPeriod =
        restaurant.subscription_status === 'cancelled' &&
        restaurant.next_billed_at &&
        new Date(restaurant.next_billed_at).getTime() > Date.now()

      const unlocked =
        restaurant.subscription_status === 'active' ||
        restaurant.subscription_status === 'past_due' ||
        restaurant.bypass_payment === true ||
        stillPaidThroughPeriod

      if (!unlocked) {
        const remaining = daysRemaining(restaurant.trial_started_at)
        if (remaining <= 0) {
          redirect('/checkout')
        }
        trialDaysLeft = remaining
      }

      if (restaurant.slug) menuUrl = `/${restaurant.slug}`
    } else {
      let { data: pending } = await supabase
        .from('pending_signups')
        .select('subscription_status, bypass_payment, trial_started_at')
        .eq('user_id', user.id)
        .maybeSingle()

      // SELF-HEAL: this row should normally be created at signup. But when
      // email confirmation is required, there's no active session yet at
      // signup time, so that insert silently fails (RLS blocks it). This is
      // the first moment we KNOW a real session exists for this user — so if
      // the row is missing or never got its trial_started_at, create/fix it
      // here, using the admin client to bypass RLS safely server-side.
      if (!pending || !pending.trial_started_at) {
        const admin = createAdminClient()

        let tier = 'tier_a'
        try {
          const { data: tiers } = await admin
            .from('pricing_tiers')
            .select('id, countries')

          const { headers } = await import('next/headers')
          const h = await headers()
          const countryCode = h.get('x-vercel-ip-country') || ''
          const tierB = tiers?.find((t: any) => t.id === 'tier_b')
          if (countryCode && tierB?.countries?.includes(countryCode)) {
            tier = 'tier_b'
          }
        } catch (e) {
          console.error('Tier detection failed in self-heal, defaulting to tier_a:', e)
        }

        const trialStartedAt = new Date().toISOString()

        await admin
          .from('pending_signups')
          .upsert({
            user_id: user.id,
            pricing_tier: tier,
            trial_started_at: trialStartedAt,
          }, { onConflict: 'user_id' })

        pending = {
          subscription_status: pending?.subscription_status ?? null,
          bypass_payment: pending?.bypass_payment ?? false,
          trial_started_at: trialStartedAt,
        }
      }

      const unlocked = pending?.subscription_status === 'active' || pending?.bypass_payment === true

      if (!unlocked) {
        const remaining = daysRemaining(pending?.trial_started_at || null)
        if (remaining <= 0) {
          redirect('/checkout')
        }
        trialDaysLeft = remaining
      }
    }
  }

  const visible = user ? await getVisibleAnnouncements(user.id) : []

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav menuUrl={menuUrl} trialDaysLeft={trialDaysLeft} />
      {visible.length > 0 && <AnnouncementBanner announcements={visible} />}
      {children}
    </div>
  )
}