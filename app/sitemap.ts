import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('slug, updated_at')
    .or('subscription_status.eq.active,bypass_payment.eq.true')

  const restaurantEntries: MetadataRoute.Sitemap = (restaurants || []).map(r => ({
    url: `https://${r.slug}.menuberg.com`,
    lastModified: r.updated_at || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: 'https://www.menuberg.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://www.menuberg.com/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  return [...staticEntries, ...restaurantEntries]
}