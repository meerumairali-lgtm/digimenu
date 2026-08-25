import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/blog'

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

  const { data: posts } = await supabase
    .from('posts_public')
    .select('slug, updated_at')

  const blogEntries: MetadataRoute.Sitemap = (posts || []).map(p => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at || new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const { data: categories } = await supabase
    .from('blog_categories')
    .select('slug')

  const categoryEntries: MetadataRoute.Sitemap = (categories || []).map(c => ({
    url: `${SITE_URL}/blog/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
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
    { url: 'https://www.menuberg.com/privacy',lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://www.menuberg.com/refund', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://www.menuberg.com/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },

  ]

  return [...staticEntries, ...blogEntries, ...categoryEntries, ...restaurantEntries]
}