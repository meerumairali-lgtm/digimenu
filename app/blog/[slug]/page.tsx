import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getPostBySlug,
  getRelatedPosts,
  extractToc,
  resolveSeoTitle,
  resolveSeoDescription,
  SITE_URL,
} from '@/lib/blog'
import LandingNav from '@/app/components/LandingNav'
import SiteFooter from '@/app/components/blog/SiteFooter'
import ArticleContent from '@/app/components/blog/ArticleContent'
import TableOfContents from '@/app/components/blog/TableOfContents'
import BlogCard from '@/app/components/blog/BlogCard'
import BlogCtaButton from '@/app/components/blog/BlogCtaButton'
import ArticleJsonLd from '@/app/components/blog/ArticleJsonLd'
import ViewTracker from '@/app/components/blog/ViewTracker'

export const dynamic = 'force-dynamic'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const post = await getPostBySlug(supabase, slug)

  if (!post) return {}

  const title = resolveSeoTitle(post)
  const description = resolveSeoDescription(post)
  const canonical = post.canonical_url || `${SITE_URL}/blog/${post.slug}`

  return {
    title: `${title} | Menuberg Blog`,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const post = await getPostBySlug(supabase, slug)

  if (!post) notFound()

  const [related] = await Promise.all([getRelatedPosts(supabase, post, 3)])
  const toc = extractToc(post.content)

  const publishedDate = post.published_at ?? post.created_at
  const wasUpdated =
    post.published_at && new Date(post.updated_at).toDateString() !== new Date(post.published_at).toDateString()

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex flex-col">
      <ViewTracker event="article_view" params={{ post_slug: post.slug, post_title: post.title }} />
      <ArticleJsonLd post={post} />
      <LandingNav />

      <main className="flex-1 pt-12 pb-20 px-6 max-w-6xl mx-auto w-full">
        <p className="text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-sky-400">Home</Link> →{' '}
          <Link href="/blog" className="hover:text-sky-400">Blog</Link>
          {post.category && (
            <>
              {' '}→{' '}
              <Link href={`/blog/category/${post.category.slug}`} className="hover:text-sky-400">
                {post.category.name}
              </Link>
            </>
          )}
          {' '}→ {post.title}
        </p>

        <div className="max-w-3xl">
          {post.category && (
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="inline-block text-xs font-semibold text-sky-400 uppercase tracking-wide mb-3 hover:text-sky-300"
            >
              {post.category.name}
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">{post.title}</h1>

          {post.excerpt && <p className="text-lg text-gray-300 mb-5">{post.excerpt}</p>}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400 mb-8">
            {post.author && <span className="text-gray-300">{post.author.name}</span>}
            {post.author && <span>·</span>}
            <span>{formatDate(publishedDate)}</span>
            {wasUpdated && (
              <>
                <span>·</span>
                <span>Updated {formatDate(post.updated_at)}</span>
              </>
            )}
            {post.reading_time && (
              <>
                <span>·</span>
                <span>{post.reading_time} min read</span>
              </>
            )}
          </div>
        </div>

        {post.cover_image && (
          <div className="relative w-full max-w-6xl aspect-[16/7] rounded-2xl overflow-hidden mb-10">
            <Image src={post.cover_image} alt={post.title} fill priority sizes="100vw" className="object-cover" />
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12 max-w-6xl">
          <aside className="mb-8 lg:mb-0">
            <TableOfContents entries={toc} />
          </aside>

          <div className="max-w-3xl">
            <ArticleContent markdown={post.content} />

            <BlogCtaButton postSlug={post.slug} />

            {related.length > 0 && (
              <section className="mt-14">
                <h2 className="text-xl font-bold text-white mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {related.map((r) => (
                    <BlogCard key={r.id} post={r} trackingEvent="related_article_click" />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-14 pt-8 border-t border-sky-500/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 font-bold shrink-0">
                M
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">About Menuberg</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Menuberg helps restaurants create professional websites and digital storefronts without
                  complicated setup.{' '}
                  <Link href="/" className="text-sky-400 hover:text-sky-300 underline underline-offset-2">
                    Learn more
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
