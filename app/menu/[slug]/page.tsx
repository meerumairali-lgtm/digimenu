import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MenuClient from './MenuClient'

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!restaurant) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('*, menu_items(*)')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order')

  return (
    <MenuClient
      restaurant={restaurant}
      categories={categories || []}
    />
  )
}