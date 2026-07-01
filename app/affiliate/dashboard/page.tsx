import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AffiliateDashboardClient from './AffiliateDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AffiliateDashboardPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('affiliate_session')

  if (!session) redirect('/affiliate/login')

  let affiliateId: string
  try {
    affiliateId = JSON.parse(session.value).id
  } catch {
    redirect('/affiliate/login')
  }

  const admin = createAdminClient()

  const { data: affiliate } = await admin
    .from('affiliates')
    .select('*')
    .eq('id', affiliateId)
    .single()

  if (!affiliate) redirect('/affiliate/login')
  if (!affiliate.profile_completed) redirect('/affiliate/setup')

  // Fetch their referred restaurants
  const { data: restaurants } = await admin
    .from('restaurants')
    .select('id, name, slug, subscription_status, created_at, pricing_tier')
    .eq('referred_by', affiliateId)
    .order('created_at', { ascending: false })

  // Fetch monthly stats
  const { data: monthlyStats } = await admin
    .from('affiliate_monthly_stats')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('month', { ascending: false })

  // Fetch payment history
  const { data: payments } = await admin
    .from('affiliate_payments')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('paid_at', { ascending: false })

  return (
    <AffiliateDashboardClient
      affiliate={affiliate}
      restaurants={restaurants || []}
      monthlyStats={monthlyStats || []}
      payments={payments || []}
    />
  )
}