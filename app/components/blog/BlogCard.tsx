'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/lib/blog'
import { trackEvent } from '@/lib/analytics'

interface BlogCardProps {
  post: Post
  trackingEvent?: string
  size?: 'default' | 'large'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BlogCard({ post, trackingEvent, size = 'default' }: BlogCardProps) {
  const isLarge = size === 'large'

  return (
    <Link
      href={`/blog/${post.slug}`}
      onClick={() => trackingEvent && trackEvent(trackingEvent, { post_slug: post.slug, post_title: post.title })}
      className="group block bg-[#112240] border border-sky-500/10 rounded-xl overflow-hidden hover:border-sky-500/40 transition-colors"
    >
      <div className={`relative w-full bg-[#0D1B2A] ${isLarge ? 'aspect-[16/8]' : 'aspect-[16/10]'}`}>
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            sizes={isLarge ? '(max-width: 768px) 100vw, 800px' : '(max-width: 768px) 100vw, 400px'}
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sky-500/20 text-4xl font-bold">M</div>
        )}
      </div>

      <div className={isLarge ? 'p-6 md:p-8' : 'p-5'}>
        {post.category && (
          <span className="inline-block text-xs font-semibold text-sky-400 uppercase tracking-wide mb-2">
            {post.category.name}
          </span>
        )}
        <h3 className={`font-bold text-white leading-snug mb-2 group-hover:text-sky-300 transition-colors ${isLarge ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p className={`text-gray-400 leading-relaxed mb-3 ${isLarge ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'}`}>
            {post.excerpt}
          </p>
        )}
        <p className="text-xs text-gray-500">
          {post.published_at && formatDate(post.published_at)}
          {post.published_at && post.reading_time ? ' · ' : ''}
          {post.reading_time ? `${post.reading_time} min read` : ''}
        </p>
      </div>
    </Link>
  )
}
