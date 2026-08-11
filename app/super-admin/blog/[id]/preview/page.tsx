import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPostById } from '@/lib/blog'
import ArticleContent from '@/app/components/blog/ArticleContent'

export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export const metadata: Metadata = {
  title: 'Article Preview',
  robots: { index: false, follow: false },
}

export default async function BlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const post = await getPostById(supabase, id)
  if (!post) notFound()

  const readingTime = post.reading_time ?? 1
  const displayDate = post.published_at ?? post.updated_at

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-amber-500 text-[#0D1B2A] text-sm font-semibold text-center py-2 px-4 sticky top-0 z-10">
        Preview only — status: {post.status}. Not visible to the public and not indexed by search engines.
      </div>

      <main className="pt-12 pb-20 px-6 max-w-3xl mx-auto">
        <p className="text-xs text-gray-500 mb-4">
          Home → Blog{post.category ? ` → ${post.category.name}` : ''} → {post.title}
        </p>

        {post.category && (
          <span className="inline-block text-xs font-semibold text-sky-600 uppercase tracking-wide mb-3">
            {post.category.name}
          </span>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] leading-tight mb-4">{post.title}</h1>

        {post.excerpt && <p className="text-lg text-gray-600 mb-5">{post.excerpt}</p>}

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
          {post.author && <span>{post.author.name}</span>}
          {post.author && <span>·</span>}
          <span>
            {new Date(displayDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>

        {post.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_image} alt={post.title} className="w-full rounded-xl mb-10" />
        )}

        <ArticleContent markdown={post.content} />
      </main>
    </div>
  )
}
