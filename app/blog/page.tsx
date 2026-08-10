import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPublishedPosts, getFeaturedPost, getCategories, SITE_URL } from '@/lib/blog'
import LandingNav from '@/app/components/LandingNav'
import SiteFooter from '@/app/components/blog/SiteFooter'
import BlogCard from '@/app/components/blog/BlogCard'
import BlogSearchForm from '@/app/components/blog/BlogSearchForm'
import Pagination from '@/app/components/blog/Pagination'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 9

export const metadata: Metadata = {
  title: 'The Menuberg Blog | Restaurant Growth & Digital Menu Guides',
  description: 'Practical ideas, guides, and insights to help restaurants grow online.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'The Menuberg Blog',
    description: 'Practical ideas, guides, and insights to help restaurants grow online.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
}

interface BlogPageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { search, page } = await searchParams
  const supabase = await createClient()
  const categories = await getCategories(supabase)

  const currentPage = Math.max(1, parseInt(page || '1', 10) || 1)
  const isSearching = !!search?.trim()

  if (isSearching) {
    const { posts, count } = await getPublishedPosts(supabase, {
      search,
      limit: PAGE_SIZE,
      offset: (currentPage - 1) * PAGE_SIZE,
    })
    const totalPages = Math.ceil(count / PAGE_SIZE)

    return (
      <div className="min-h-screen bg-[#0D1B2A] flex flex-col">
        <LandingNav />
        <main className="flex-1 pt-16 pb-20 px-6 max-w-6xl mx-auto w-full">
          <BlogHero categories={categories} initialSearch={search} />

          <p className="text-gray-400 text-sm mb-6">
            {count} result{count === 1 ? '' : 's'} for &ldquo;{search}&rdquo;
          </p>

          {posts.length === 0 ? (
            <p className="text-gray-500 py-16 text-center">No articles found. Try another search.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/blog"
            searchParamsToKeep={{ search: search || '' }}
          />
        </main>
        <SiteFooter />
      </div>
    )
  }

  const [featured, { posts, count }] = await Promise.all([
    currentPage === 1 ? getFeaturedPost(supabase) : Promise.resolve(null),
    getPublishedPosts(supabase, {
      limit: PAGE_SIZE,
      offset: (currentPage - 1) * PAGE_SIZE,
    }),
  ])

  // Don't repeat the featured post in the grid on page 1.
  const gridPosts = featured ? posts.filter((p) => p.id !== featured.id) : posts
  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex flex-col">
      <LandingNav />
      <main className="flex-1 pt-16 pb-20 px-6 max-w-6xl mx-auto w-full">
        <BlogHero categories={categories} />

        {featured && currentPage === 1 && (
          <section className="mb-14">
            <BlogCard post={featured} size="large" />
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-white mb-6">Latest Articles</h2>
          {gridPosts.length === 0 ? (
            <p className="text-gray-500 py-16 text-center">No articles published yet — check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/blog" />
      </main>
      <SiteFooter />
    </div>
  )
}

function BlogHero({
  categories,
  initialSearch,
}: {
  categories: { name: string; slug: string }[]
  initialSearch?: string
}) {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">The Menuberg Blog</h1>
      <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
        Practical ideas, guides, and insights to help restaurants grow online.
      </p>

      <div className="flex justify-center mb-8">
        <BlogSearchForm initialValue={initialSearch} />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/blog"
          className="px-4 py-2 rounded-full text-sm font-medium bg-sky-500 text-white"
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/blog/category/${c.slug}`}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[#112240] text-gray-300 border border-sky-500/10 hover:border-sky-500/40 hover:text-white transition-colors"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
