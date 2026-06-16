import { createClient } from '@/lib/supabase/server'
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

  // Get restaurant slug for "View menu" link in nav
  let menuUrl = '/dashboard'
  if (user) {
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('slug')
      .eq('user_id', user.id)
      .single()
    if (restaurant?.slug) menuUrl = `/menu/${restaurant.slug}`
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