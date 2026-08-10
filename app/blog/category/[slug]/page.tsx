import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCategoryBySlug, getPublishedPosts, SITE_URL } from '@/lib/blog'
import LandingNav from '@/app/components/LandingNav'
import SiteFooter from '@/app/components/blog/SiteFooter'
import BlogCard from '@/app/components/blog/BlogCard'
import Pagination from '@/app/components/blog/Pagination'
import ViewTracker from '@/app/components/blog/ViewTracker'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 9

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const category = await getCategoryBySlug(supabase, slug)

  if (!category) return {}

  const title = `${category.name} | Menuberg Blog`
  const description = category.description || `Articles about ${category.name.toLowerCase()} for restaurant owners.`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog/category/${category.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/blog/category/${category.slug}`, type: 'website' },
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page } = await searchParams
  const supabase = await createClient()

  const category = await getCategoryBySlug(supabase, slug)
  if (!category) notFound()

  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1)
  const { posts, count } = await getPublishedPosts(supabase, {
    categorySlug: slug,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
  })
  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex flex-col">
      <ViewTracker event="category_view" params={{ category_slug: category.slug }} />
      <LandingNav />

      <main className="flex-1 pt-16 pb-20 px-6 max-w-6xl mx-auto w-full">
        <p className="text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-sky-400">Home</Link> → <Link href="/blog" className="hover:text-sky-400">Blog</Link> → {category.name}
        </p>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{category.name}</h1>
        {category.description && <p className="text-gray-400 mb-10 max-w-xl">{category.description}</p>}

        {posts.length === 0 ? (
          <p className="text-gray-500 py-16 text-center">No articles in this category yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/blog/category/${slug}`} />
      </main>

      <SiteFooter />
    </div>
  )
}
