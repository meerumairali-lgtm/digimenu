import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AffiliateDashboardClient from './AffiliateDashboardClient'

export const dynamic = 'force-dynamic'

const RANK_RECURRING_PCT: Record<string, number> = {
  none: 0,
  silver: 0.125,
  gold: 0.15,
  platinum: 0.18,
  diamond: 0.23,
}

const RANK_THRESHOLDS = [
  { rank: 'diamond', min: 20, label: 'Diamond' },
  { rank: 'platinum', min: 11, label: 'Platinum' },
  { rank: 'gold', min: 6, label: 'Gold' },
  { rank: 'silver', min: 2, label: 'Silver' },
]

function getProjectedRank(count: number): string {
  if (count >= 20) return 'platinum' // needs 2 consecutive for diamond
  if (count >= 11) return 'platinum'
  if (count >= 6) return 'gold'
  if (count >= 2) return 'silver'
  return 'none'
}

function getNextRankInfo(count: number): { label: string; needed: number } {
  if (count < 2) return { label: 'Silver', needed: 2 - count }
  if (count < 6) return { label: 'Gold', needed: 6 - count }
  if (count < 11) return { label: 'Platinum', needed: 11 - count }
  if (count < 20) return { label: 'Diamond', needed: 20 - count }
  return { label: 'Diamond', needed: 0 }
}

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

  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth() + 1
  const prevMonth = thisMonth === 1 ? 12 : thisMonth - 1
  const prevYear = thisMonth === 1 ? thisYear - 1 : thisYear

  // Previous month date range for payout card
  const prevMonthStart = new Date(prevYear, prevMonth - 1, 1)
  const prevMonthEnd = new Date(thisYear, thisMonth - 1, 0) // last day of prev month
  const nextPayoutDate = new Date(thisYear, thisMonth - 1, 15) // 15th of current month

  // All referred restaurants
  const { data: restaurants } = await admin
    .from('restaurants')
    .select('id, name, slug, subscription_status, created_at, pricing_tier')
    .eq('referred_by', affiliateId)
    .order('created_at', { ascending: false })

  // Previous month locked stats (from scheduled function)
  const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`
  const { data: prevMonthStats } = await admin
    .from('affiliate_monthly_stats')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .eq('month', prevMonthKey)
    .maybeSingle()

  // Check if previous month has been paid
  const { data: prevMonthPayment } = await admin
    .from('affiliate_payments')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .gte('period_start', prevMonthStart.toISOString().slice(0, 10))
    .lte('period_start', prevMonthStart.toISOString().slice(0, 10))
    .maybeSingle()

  // Payment history
  const { data: paymentHistory } = await admin
    .from('affiliate_payments')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('paid_at', { ascending: false })

  // Current month live stats
  const thisMonthRestaurants = (restaurants || []).filter(r => {
    const d = new Date(r.created_at)
    return d.getFullYear() === thisYear && d.getMonth() + 1 === thisMonth
  })

  const thisMonthCount = thisMonthRestaurants.length
  const projectedRank = getProjectedRank(thisMonthCount)
  const nextRankInfo = getNextRankInfo(thisMonthCount)
  const projectedPct = RANK_RECURRING_PCT[projectedRank] || 0

  // Estimated earning = all portfolio restaurants × last payment amount × projected rank %
  // Setup fee estimated = new restaurants this month × average setup fee
  const restaurantIds = (restaurants || []).map(r => r.id)

  // Get last payment per restaurant for recurring estimate
  const { data: lastPayments } = restaurantIds.length > 0
    ? await admin
        .from('payments')
        .select('restaurant_id, amount, type, status, created_at')
        .in('restaurant_id', restaurantIds)
        .eq('status', 'completed')
        .eq('type', 'subscription')
        .order('created_at', { ascending: false })
    : { data: [] }

  // Get last subscription payment per restaurant (for estimate)
  const lastPaymentPerRestaurant: Record<string, number> = {}
  ;(lastPayments || []).forEach(p => {
    if (!lastPaymentPerRestaurant[p.restaurant_id]) {
      lastPaymentPerRestaurant[p.restaurant_id] = p.amount
    }
  })

  // Estimated recurring = all portfolio restaurants that have ever paid × projected %
  const estimatedRecurring = (restaurants || []).reduce((sum, r) => {
    const lastAmt = lastPaymentPerRestaurant[r.id] || 0
    return sum + (lastAmt * projectedPct)
  }, 0)

  // Estimated setup = new restaurants this month × 28.5% of their setup fee
  const { data: thisMonthSetupPayments } = thisMonthRestaurants.length > 0
    ? await admin
        .from('payments')
        .select('restaurant_id, amount')
        .in('restaurant_id', thisMonthRestaurants.map(r => r.id))
        .eq('type', 'setup')
        .eq('status', 'completed')
    : { data: [] }

  const estimatedSetup = (thisMonthSetupPayments || []).reduce((sum, p) => {
    return sum + (p.amount * 0.285)
  }, 0)

  const estimatedTotal = estimatedRecurring + estimatedSetup

  // Totals
  const totalEarned = (await admin
    .from('affiliate_monthly_stats')
    .select('total_earned')
    .eq('affiliate_id', affiliateId)
  ).data?.reduce((sum, r) => sum + (r.total_earned || 0), 0) || 0

  const totalPaid = (paymentHistory || []).reduce((sum, p) => sum + p.amount_paid, 0)

  // Performance label for previous month
  // Compare prev month rank vs the month before that
  const twoMonthsAgoMonth = prevMonth === 1 ? 12 : prevMonth - 1
  const twoMonthsAgoYear = prevMonth === 1 ? prevYear - 1 : prevYear
  const twoMonthsAgoKey = `${twoMonthsAgoYear}-${String(twoMonthsAgoMonth).padStart(2, '0')}-01`

  const { data: twoMonthsAgoStats } = await admin
    .from('affiliate_monthly_stats')
    .select('rank_at_month')
    .eq('affiliate_id', affiliateId)
    .eq('month', twoMonthsAgoKey)
    .maybeSingle()

  function getPerformanceLabel(currentRank: string, prevRank: string): string {
    const order = ['none', 'silver', 'gold', 'platinum', 'diamond']
    const curr = order.indexOf(currentRank)
    const prev = order.indexOf(prevRank || 'none')
    if (curr > prev) return 'Promoted'
    if (curr < prev) return 'Demoted'
    return 'Sustained'
  }

  const performanceLabel = prevMonthStats
    ? getPerformanceLabel(prevMonthStats.rank_at_month, twoMonthsAgoStats?.rank_at_month || 'none')
    : null

  return (
    <AffiliateDashboardClient
      affiliate={affiliate}
      restaurants={restaurants || []}
      payments={paymentHistory || []}
      prevMonthStats={prevMonthStats || null}
      prevMonthPayment={prevMonthPayment || null}
      prevMonthStart={prevMonthStart.toISOString().slice(0, 10)}
      prevMonthEnd={prevMonthEnd.toISOString().slice(0, 10)}
      nextPayoutDate={nextPayoutDate.toISOString().slice(0, 10)}
      thisMonthCount={thisMonthCount}
      projectedRank={projectedRank}
      nextRankInfo={nextRankInfo}
      estimatedTotal={estimatedTotal}
      performanceLabel={performanceLabel}
      totalEarned={totalEarned}
      totalPaid={totalPaid}
    />
  )
}