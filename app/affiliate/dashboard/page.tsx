import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import AffiliateDashboardClient from './AffiliateDashboardClient'

export const dynamic = 'force-dynamic'

// Recurring % by rank
const RANK_RECURRING_PCT: Record<string, number> = {
  none: 0,
  silver: 0.125,
  gold: 0.15,
  platinum: 0.18,
  diamond: 0.23,
}


function getRankForCount(count: number): string {
  if (count >= 20) return 'diamond' // simplified — proper 2-month logic handled separately
  if (count >= 11) return 'platinum'
  if (count >= 6) return 'gold'
  if (count >= 2) return 'silver'
  return 'none'
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

  // Fetch all restaurants referred by this affiliate
  const { data: restaurants } = await admin
    .from('restaurants')
    .select('id, name, slug, subscription_status, created_at, pricing_tier')
    .eq('referred_by', affiliateId)
    .order('created_at', { ascending: false })

  const restaurantIds = (restaurants || []).map(r => r.id)

  // Fetch all payments for their referred restaurants
  const { data: allPayments } = restaurantIds.length > 0
    ? await admin
      .from('payments')
      .select('restaurant_id, amount, type, status, created_at')
      .in('restaurant_id', restaurantIds)
      .eq('status', 'completed')
    : { data: [] }

  console.log('DEBUG restaurantIds:', restaurantIds)
  console.log('DEBUG allPayments:', allPayments)

  // Fetch payment history (what's been paid OUT to this affiliate)
  const { data: paymentHistory } = await admin
    .from('affiliate_payments')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .order('paid_at', { ascending: false })

  // ── Calculate earnings ──
  // Group payments by month for breakdown
  type MonthlyCalc = {
    month: string // YYYY-MM
    restaurants_signed: number
    setup_fee_earned: number
    recurring_earned: number
    total_earned: number
    rank_at_month: string
  }

  const monthlyMap: Record<string, MonthlyCalc> = {}

  // Track which restaurants have had their setup fee counted
  const setupFeesCounted = new Set<string>()

    // For each restaurant, figure out which month they joined
    // and calculate setup fee + recurring per month active
    ; (restaurants || []).forEach(restaurant => {
      const joinedDate = new Date(restaurant.created_at)
      const joinedMonthKey = `${joinedDate.getFullYear()}-${String(joinedDate.getMonth() + 1).padStart(2, '0')}`

      // Initialize month if needed
      if (!monthlyMap[joinedMonthKey]) {
        monthlyMap[joinedMonthKey] = {
          month: joinedMonthKey,
          restaurants_signed: 0,
          setup_fee_earned: 0,
          recurring_earned: 0,
          total_earned: 0,
          rank_at_month: 'none',
        }
      }
      monthlyMap[joinedMonthKey].restaurants_signed += 1
    })

  // Assign ranks to each month based on restaurants signed that month
  Object.keys(monthlyMap).forEach(monthKey => {
    const month = monthlyMap[monthKey]
    month.rank_at_month = getRankForCount(month.restaurants_signed)
  })

    // Now calculate earnings from actual payments
    ; (allPayments || []).forEach(payment => {
      const payDate = new Date(payment.created_at)
      const monthKey = `${payDate.getFullYear()}-${String(payDate.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          restaurants_signed: 0,
          setup_fee_earned: 0,
          recurring_earned: 0,
          total_earned: 0,
          rank_at_month: 'none',
        }
      }

      const month = monthlyMap[monthKey]

      if (payment.type === 'setup' && !setupFeesCounted.has(payment.restaurant_id)) {
      // 28.5% of actual setup fee charged — works for both Tier A and B
      month.setup_fee_earned += (payment.amount ?? 0) * 0.285
      setupFeesCounted.add(payment.restaurant_id)
    } else if (payment.type === 'subscription') {
      // Recurring % of actual monthly amount charged — works for both tiers
      const pct = RANK_RECURRING_PCT[month.rank_at_month] || 0
      month.recurring_earned += (payment.amount ?? 0) * pct
    }

      month.total_earned = month.setup_fee_earned + month.recurring_earned
    })

  // Sort months descending
  const monthlyStats = Object.values(monthlyMap)
    .sort((a, b) => b.month.localeCompare(a.month))

  // ── Current rank (this month) ──
  const now = new Date()
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonthRestaurants = (restaurants || []).filter(r => {
    const d = new Date(r.created_at)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === thisMonthKey
  }).length

  // Diamond requires 2 consecutive months of 20+ — check last month too
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`
  const lastMonthRestaurants = (restaurants || []).filter(r => {
    const d = new Date(r.created_at)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === lastMonthKey
  }).length

  let currentRank = getRankForCount(thisMonthRestaurants)
  if (thisMonthRestaurants >= 20 && lastMonthRestaurants >= 20) {
    currentRank = 'diamond'
  } else if (currentRank === 'diamond') {
    // Didn't hit 20 twice — max is platinum
    currentRank = 'platinum'
  }

  // Update rank in DB if it changed
  if (currentRank !== affiliate.current_rank) {
    await admin
      .from('affiliates')
      .update({ current_rank: currentRank })
      .eq('id', affiliateId)
  }

  // ── Totals ──
  const totalEarned = monthlyStats.reduce((sum, m) => sum + m.total_earned, 0)
  const totalPaid = (paymentHistory || []).reduce((sum, p) => sum + p.amount_paid, 0)

  return (
    <AffiliateDashboardClient
      affiliate={{ ...affiliate, current_rank: currentRank }}
      restaurants={restaurants || []}
      monthlyStats={monthlyStats}
      payments={paymentHistory || []}
      totalEarned={totalEarned}
      totalPaid={totalPaid}
      thisMonthCount={thisMonthRestaurants}
    />
  )
}