import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PricingClient from './PricingClient'

export const dynamic = 'force-dynamic'

export default async function PricingSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'meerumairali@gmail.com') redirect('/dashboard')

  const { data: tiers } = await supabase
    .from('pricing_tiers')
    .select('id, label, setup_fee, monthly_price, intro_discount_active, intro_monthly_price, intro_duration_months, countries')
    .order('id', { ascending: true })

  return <PricingClient initialTiers={tiers || []} />
}