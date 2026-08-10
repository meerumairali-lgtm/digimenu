import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/blog'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/super-admin', '/api', '/login', '/signup'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
