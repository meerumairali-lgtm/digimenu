import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnnouncementBanner from './AnnouncementBanner'
import DashboardNav from './DashboardNav'

export const dynamic = 'force-dynamic'

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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let menuUrl = '/dashboard'

  if (user) {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('slug, subscription_status, bypass_payment')
      .eq('user_id', user.id)
      .maybeSingle()

    if (restaurant) {
      const unlocked = restaurant.subscription_status === 'active' || restaurant.bypass_payment === true
      if (!unlocked) redirect('/checkout')
      if (restaurant.slug) menuUrl = `/${restaurant.slug}`
    } else {
      // No restaurant yet — must have an active (or paid) pending signup
      // to even reach Setup.
      const { data: pending } = await supabase
        .from('pending_signups')
        .select('subscription_status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!pending || pending.subscription_status !== 'active') {
        redirect('/checkout')
      }
    }
  }

  const visible = user ? await getVisibleAnnouncements(user.id) : []

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav menuUrl={menuUrl} />
      {visible.length > 0 && <AnnouncementBanner announcements={visible} />}
      {children}
    </div>
  )
}