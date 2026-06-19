'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  ExternalLink,
  Eye,
  ShieldOff,
  ShieldCheck,
  Trash2,
  Filter,
  Crown,
} from 'lucide-react'

type Restaurant = {
  id: string
  name: string
  slug: string
  email: string | null
  created_at: string
  is_suspended: boolean
  theme: string | null
  currency: string | null
  layout: string | null
  pricing_tier: string
  subscription_status: string
  bypass_payment: boolean
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  past_due: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function RestaurantList({
  initialRestaurants,
}: {
  initialRestaurants: Restaurant[]
}) {
  const [restaurants, setRestaurants] = useState(initialRestaurants ?? [])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.slug.toLowerCase().includes(search.toLowerCase()) ||
        (r.email ?? '').toLowerCase().includes(search.toLowerCase())

      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && !r.is_suspended) ||
        (filter === 'suspended' && r.is_suspended)

      return matchesSearch && matchesFilter
    })
  }, [restaurants, search, filter])

  async function toggleSuspend(id: string, currentlySuspended: boolean, name: string) {
    setLoadingId(id)

    const res = await fetch('/api/super-admin/suspend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        suspend: !currentlySuspended,
        name,
      }),
    })

    if (res.ok) {
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, is_suspended: !currentlySuspended } : r
        )
      )
    }

    setLoadingId(null)
  }

  async function toggleBypass(id: string, currentlyBypassed: boolean, name: string) {
    setLoadingId(id)

    const res = await fetch('/api/super-admin/toggle-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        bypass: !currentlyBypassed,
        name,
      }),
    })

    if (res.ok) {
      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, bypass_payment: !currentlyBypassed } : r
        )
      )
    }

    setLoadingId(null)
  }

  async function deleteRestaurant(id: string, name: string) {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${name}"? This cannot be undone.`
      )
    )
      return

    setLoadingId(id)

    const res = await fetch('/api/super-admin/delete-restaurant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
    })

    if (res.ok) {
      setRestaurants((prev) => prev.filter((r) => r.id !== id))
    }

    setLoadingId(null)
  }

  const filters: { label: string; value: typeof filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Restaurants</h1>
        <p className="text-gray-400 text-sm mt-1">
          {restaurants.length} total restaurants on the platform
        </p>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name, slug, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-500" />

          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  filter === f.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">
                  Restaurant
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">
                  Created
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">
                  Billing
                </th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No restaurants found
                  </td>
                </tr>
              )}

              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{r.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.email ?? 'No email'}
                    </p>
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-gray-400 font-mono text-xs">
                      {r.slug}
                    </span>
                  </td>

                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-gray-500 uppercase">
                        {r.pricing_tier === 'tier_b' ? 'Tier B' : 'Tier A'}
                      </span>
                      {r.bypass_payment ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-full">
                          <Crown size={11} /> VIP
                        </span>
                      ) : (
                        <span className={`inline-flex items-center text-xs border px-2 py-1 rounded-full capitalize ${STATUS_STYLES[r.subscription_status] ?? STATUS_STYLES.pending}`}>
                          {r.subscription_status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {r.is_suspended ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-full">
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* View detail */}
                      <Link
                        href={`/super-admin/restaurants/${r.id}`}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </Link>

                      {/* Public menu */}
                      <Link
                        href={`/${r.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Open Public Menu"
                      >
                        <ExternalLink size={15} />
                      </Link>

                      {/* VIP bypass toggle */}
                      <button
                        onClick={() => toggleBypass(r.id, r.bypass_payment, r.name)}
                        disabled={loadingId === r.id}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50
                          ${
                            r.bypass_payment
                              ? 'text-amber-400 hover:bg-amber-500/10'
                              : 'text-gray-500 hover:bg-gray-700 hover:text-amber-400'
                          }`}
                        title={r.bypass_payment ? 'Remove VIP bypass (require payment)' : 'Grant VIP bypass (skip payment)'}
                      >
                        <Crown size={15} />
                      </button>

                      {/* Suspend / Reactivate */}
                      <button
                        onClick={() => toggleSuspend(r.id, r.is_suspended, r.name)}
                        disabled={loadingId === r.id}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50
                          ${
                            r.is_suspended
                              ? 'text-green-400 hover:bg-green-500/10'
                              : 'text-yellow-400 hover:bg-yellow-500/10'
                          }`}
                        title={r.is_suspended ? 'Reactivate' : 'Suspend'}
                      >
                        {r.is_suspended ? (
                          <ShieldCheck size={15} />
                        ) : (
                          <ShieldOff size={15} />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteRestaurant(r.id, r.name)}
                        disabled={loadingId === r.id}
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