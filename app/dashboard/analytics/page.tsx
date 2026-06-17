import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsClient from './AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!restaurant) redirect('/dashboard/setup')

  // All time views
  const { count: allTime } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id)

  // Today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count: today } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id)
    .gte('visited_at', todayStart.toISOString())

  // This week
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const { count: thisWeek } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id)
    .gte('visited_at', weekStart.toISOString())

  // This month
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const { count: thisMonth } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant.id)
    .gte('visited_at', monthStart.toISOString())

  // Last 30 days raw data for charts
  const last30Start = new Date()
  last30Start.setDate(last30Start.getDate() - 29)
  last30Start.setHours(0, 0, 0, 0)
  const { data: rawViews } = await supabase
    .from('page_views')
    .select('visited_at')
    .eq('restaurant_id', restaurant.id)
    .gte('visited_at', last30Start.toISOString())
    .order('visited_at', { ascending: true })

  return (
    <AnalyticsClient
      restaurantName={restaurant.name}
      stats={{ today: today ?? 0, thisWeek: thisWeek ?? 0, thisMonth: thisMonth ?? 0, allTime: allTime ?? 0 }}
      rawViews={rawViews ?? []}
    />
  )
}