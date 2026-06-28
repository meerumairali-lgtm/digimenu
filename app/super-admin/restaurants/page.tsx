import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RestaurantList from './RestaurantList'

export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export default async function RestaurantsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, slug, email, created_at, is_suspended, theme, currency, layout, pricing_tier, subscription_status, bypass_payment, country')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching restaurants:', error)
  }

  return (
    <main>
      <RestaurantList initialRestaurants={restaurants ?? []} />
    </main>
  )
}