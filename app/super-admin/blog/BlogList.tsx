'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Plus, Pencil, Eye, Archive, Trash2, Star } from 'lucide-react'
import type { AdminPost, PostStatus } from '@/lib/blog'

const STATUS_STYLES: Record<PostStatus, string> = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  published: 'bg-green-500/10 text-green-400 border-green-500/20',
  archived: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

export default function BlogList({ initialPosts }: { initialPosts: AdminPost[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PostStatus>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const counts = useMemo(
    () => ({
      all: posts.length,
      draft: posts.filter((p) => p.status === 'draft').length,
      published: posts.filter((p) => p.status === 'published').length,
      archived: posts.filter((p) => p.status === 'archived').length,
    }),
    [posts]
  )

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [posts, search, statusFilter])

  async function archivePost(id: string, title: string) {
    if (!confirm(`Archive "${title}"? It will be removed from the public blog but kept in the dashboard.`)) return
    setLoadingId(id)
    const res = await fetch('/api/super-admin/blog/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'archived' }),
    })
    if (res.ok) {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'archived' } : p)))
    }
    setLoadingId(null)
  }

  async function deletePostRow(id: string, title: string) {
    if (!confirm(`Permanently delete "${title}"? This cannot be undone.`)) return
    setLoadingId(id)
    const res = await fetch('/api/super-admin/blog/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title }),
    })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
    }
    setLoadingId(null)
  }

  const tabs: { label: string; value: 'all' | PostStatus; count: number }[] = [
    { label: 'All', value: 'all', count: counts.all },
    { label: 'Published', value: 'published', count: counts.published },
    { label: 'Drafts', value: 'draft', count: counts.draft },
    { label: 'Archived', value: 'archived', count: counts.archived },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog</h1>
          <p className="text-gray-400 text-sm mt-1">{posts.length} total articles</p>
        </div>
        <Link
          href="/super-admin/blog/new"
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus size={16} /> New Article
        </Link>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setStatusFilter(t.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === t.value ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {t.label} <span className="opacity-70">({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Published</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Updated</th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No articles found.
                  </td>
                </tr>
              )}

              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.featured && <Star size={13} className="text-amber-400 shrink-0" fill="currentColor" />}
                      <p className="font-medium text-white">{p.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">/blog/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-400">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-xs border px-2 py-1 rounded-full capitalize ${STATUS_STYLES[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400">
                    {p.published_at ? new Date(p.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400">
                    {new Date(p.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/super-admin/blog/${p.id}`}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <Link
                        href={`/super-admin/blog/${p.id}/preview`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye size={15} />
                      </Link>
                      {p.status !== 'archived' && (
                        <button
                          onClick={() => archivePost(p.id, p.title)}
                          disabled={loadingId === p.id}
                          className="p-1.5 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Archive"
                        >
                          <Archive size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => deletePostRow(p.id, p.title)}
                        disabled={loadingId === p.id}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
