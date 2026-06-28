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
  ArrowUp,
  ArrowDown,
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
  country: string | null
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  past_due: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

type SortKey =
  | 'name'
  | 'slug'
  | 'country'
  | 'created_at'
  | 'pricing_tier'
  | 'subscription_status'
  | 'is_suspended'

type SortDir = 'asc' | 'desc'

export default function RestaurantList({
  initialRestaurants,
}: {
  initialRestaurants: Restaurant[]
}) {
  const [restaurants, setRestaurants] = useState(initialRestaurants ?? [])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [tierFilter, setTierFilter] = useState<'all' | 'tier_a' | 'tier_b'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'past_due' | 'cancelled' | 'pending'>('all')
  const [vipFilter, setVipFilter] = useState<'all' | 'vip' | 'non_vip'>('all')
  const [countryFilter, setCountryFilter] = useState<'all' | string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const countryOptions = useMemo(() => {
    const set = new Set<string>()
    restaurants.forEach((r) => {
      if (r.country) set.add(r.country)
    })
    return Array.from(set).sort()
  }, [restaurants])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    const result = restaurants.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.slug.toLowerCase().includes(search.toLowerCase()) ||
        (r.email ?? '').toLowerCase().includes(search.toLowerCase())

      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && !r.is_suspended) ||
        (filter === 'suspended' && r.is_suspended)

      const matchesTier = tierFilter === 'all' || r.pricing_tier === tierFilter

      const matchesStatus = statusFilter === 'all' || r.subscription_status === statusFilter

      const matchesVip =
        vipFilter === 'all' ||
        (vipFilter === 'vip' && r.bypass_payment) ||
        (vipFilter === 'non_vip' && !r.bypass_payment)

      const matchesCountry = countryFilter === 'all' || r.country === countryFilter

      return matchesSearch && matchesFilter && matchesTier && matchesStatus && matchesVip && matchesCountry
    })

    const sorted = [...result].sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''

      switch (sortKey) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'slug':
          aVal = a.slug.toLowerCase()
          bVal = b.slug.toLowerCase()
          break
        case 'country':
          aVal = (a.country ?? '').toLowerCase()
          bVal = (b.country ?? '').toLowerCase()
          break
        case 'created_at':
          aVal = a.created_at
          bVal = b.created_at
          break
        case 'pricing_tier':
          aVal = a.pricing_tier ?? ''
          bVal = b.pricing_tier ?? ''
          break
        case 'subscription_status':
          aVal = a.subscription_status ?? ''
          bVal = b.subscription_status ?? ''
          break
        case 'is_suspended':
          aVal = a.is_suspended ? 1 : 0
          bVal = b.is_suspended ? 1 : 0
          break
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        const cmp = aVal - bVal
        return sortDir === 'asc' ? cmp : -cmp
      }

      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })

    return sorted
  }, [restaurants, search, filter, tierFilter, statusFilter, vipFilter, countryFilter, sortKey, sortDir])

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

  const selectStyle =
    'px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-orange-500'

  function SortHeader({
    label,
    sortableKey,
    className = '',
    align = 'left',
  }: {
    label: string
    sortableKey: SortKey
    className?: string
    align?: 'left' | 'right'
  }) {
    const active = sortKey === sortableKey
    return (
      <th
        onClick={() => toggleSort(sortableKey)}
        className={`px-4 py-3 text-gray-400 font-medium cursor-pointer hover:text-white select-none ${
          align === 'right' ? 'text-right' : 'text-left'
        } ${className}`}
      >
        <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
          {label}
          {active && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
        </span>
      </th>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Restaurants</h1>
        <p className="text-gray-400 text-sm mt-1">
          {restaurants.length} total restaurants on the platform
        </p>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 mb-6">
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

        <div className="flex flex-wrap items-center gap-2">
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

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
            className={selectStyle}
          >
            <option value="all">All Tiers</option>
            <option value="tier_a">Tier A</option>
            <option value="tier_b">Tier B</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className={selectStyle}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value as typeof vipFilter)}
            className={selectStyle}
          >
            <option value="all">All (VIP + Non-VIP)</option>
            <option value="vip">VIP only</option>
            <option value="non_vip">Non-VIP only</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className={selectStyle}
          >
            <option value="all">All Countries</option>
            {countryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <SortHeader label="Restaurant" sortableKey="name" />
                <SortHeader label="Slug" sortableKey="slug" className="hidden md:table-cell" />
                <SortHeader label="Country" sortableKey="country" className="hidden lg:table-cell" />
                <SortHeader label="Created" sortableKey="created_at" className="hidden lg:table-cell" />
                <SortHeader label="Billing" sortableKey="pricing_tier" />
                <SortHeader label="Status" sortableKey="is_suspended" />
                <th className="text-right px-4 py-3 text-gray-400 font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
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
                    {r.country ?? '—'}
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