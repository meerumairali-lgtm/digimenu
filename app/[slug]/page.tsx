import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Old path-based URLs are permanently retired in favor of subdomains.
  // Redirect anyone who still hits menuberg.com/slug straight to the
  // real, canonical slug.menuberg.com address.
  redirect(`https://${slug}.menuberg.com`)
}