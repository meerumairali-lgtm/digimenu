export const RESERVED_SLUGS = [
  'login', 'signup', 'logout', 'forgot-password', 'reset-password',
  'dashboard', 'super-admin', 'api', 'menu', 'about', 'contact',
  'pricing', 'privacy', 'terms', 'support', 'help', 'blog', 'admin',
  'app', 'www', 'static', 'public', 'assets', 'images',
  'favicon.ico', 'robots.txt', 'sitemap.xml',
]

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.trim().toLowerCase())
}