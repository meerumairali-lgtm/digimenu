import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MenuManager from './MenuManager'

export default async function MenuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!restaurant) redirect('/dashboard/setup')

  const { data: categories } = await supabase
    .from('categories')
    .select('*, menu_items(*)')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order')

  return <MenuManager restaurant={restaurant} initialCategories={categories || []} />
}