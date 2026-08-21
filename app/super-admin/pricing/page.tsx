import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PricingClient from './PricingClient'

export const dynamic = 'force-dynamic'

export default async function PricingSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'meerumairali@gmail.com') redirect('/dashboard')

  const { data: pricing } = await supabase
  .from('pricing_tiers')
  .select('id, label, monthly_price')
  .eq('id', 'standard')
  .single()

return <PricingClient initialPricing={pricing} />
}