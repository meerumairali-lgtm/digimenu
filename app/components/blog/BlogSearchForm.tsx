'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export default function BlogSearchForm({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    trackEvent('blog_search', { query: trimmed })
    router.push(trimmed ? `/blog?search=${encodeURIComponent(trimmed)}` : '/blog')
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles…"
        aria-label="Search articles"
        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#0D1B2A] placeholder-gray-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-colors"
      />
    </form>
  )
}
