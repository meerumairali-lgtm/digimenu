'use client'

import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

export default function BlogCtaButton({ postSlug }: { postSlug: string }) {
  return (
    <div className="bg-[#0D1B2A] rounded-2xl px-8 py-10 text-center my-14">
      <h3 className="text-2xl font-bold text-white mb-2">Ready to build your restaurant&apos;s online presence?</h3>
      <p className="text-gray-300 mb-6 max-w-md mx-auto">
        Menuberg helps restaurants launch a professional website and QR digital menu in minutes — no coding required.
      </p>
      <Link
        href="/signup"
        onClick={() => trackEvent('article_cta_click', { post_slug: postSlug })}
        className="inline-block bg-sky-400 hover:bg-sky-300 text-[#0D1B2A] font-bold px-7 py-3 rounded-lg transition-colors"
      >
        Create Your Restaurant Website
      </Link>
    </div>
  )
}
