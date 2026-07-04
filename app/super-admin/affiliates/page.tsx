import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AffiliateList from './AffiliateList'

export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export default async function AffiliatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) redirect('/dashboard')

  const { data: affiliates } = await supabase
    .from('affiliates')
    .select(`
      id, name, username, current_rank, payment_suspended, created_at,
      email, phone, address, city, age, cnic,
      bank_name, bank_account_number, bank_account_title,
      affiliate_monthly_stats (
        month, restaurants_signed, setup_fee_earned,
        recurring_earned, total_earned, rank_at_month
      ),
      affiliate_payments (
        id, period_start, period_end, amount_paid, paid_at, notes
      )
    `)
    .order('created_at', { ascending: false })

  // For each affiliate, also count total restaurants referred
  const { data: restaurantCounts } = await supabase
    .from('restaurants')
    .select('referred_by')
    .not('referred_by', 'is', null)

  const countMap: Record<string, number> = {}
  ;(restaurantCounts || []).forEach(r => {
    if (r.referred_by) countMap[r.referred_by] = (countMap[r.referred_by] || 0) + 1
  })

  return (
    <AffiliateList
      initialAffiliates={(affiliates || []).map(a => ({
        ...a,
        total_restaurants: countMap[a.id] || 0,
      }))}
    />
  )
}