import { createClient } from '@/lib/supabase/server'
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
      .select('slug, subscription_status, bypass_payment, trial_started_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (restaurant) {
      const unlocked = restaurant.subscription_status === 'active' || restaurant.bypass_payment === true

      if (!unlocked) {
        const remaining = daysRemaining(restaurant.trial_started_at)
        if (remaining <= 0) {
          redirect('/checkout')
        }
        trialDaysLeft = remaining
      }

      if (restaurant.slug) menuUrl = `/${restaurant.slug}`
    } else {
      const { data: pending } = await supabase
        .from('pending_signups')
        .select('subscription_status, bypass_payment, trial_started_at')
        .eq('user_id', user.id)
        .maybeSingle()

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