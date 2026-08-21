import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import RestaurantActions from './RestaurantActions'
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Share2,
  Globe,
  Palette,
  LayoutTemplate,
  DollarSign,
  Hash,
  User,
  Calendar,
  Flag,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single()

  if (restaurantError) {
    console.error('RestaurantDetailPage: failed to fetch restaurant', id, restaurantError)
  }

  if (!restaurant) notFound()

  const [{ count: categoryCount }, { count: itemCount }, { data: payments }] = await Promise.all([
    supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id),
    supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id),
    supabase
      .from('payments')
      .select('amount, currency, type, status, created_at')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false }),
  ])

  const lastPayment = payments?.[0] ?? null
  const totalPaid = (payments ?? [])
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)

  const isInTrial = restaurant.subscription_status === 'pending' && !!restaurant.trial_started_at
  const trialDaysElapsed = isInTrial
    ? Math.floor((Date.now() - new Date(restaurant.trial_started_at).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const trialDaysLeft = trialDaysElapsed !== null ? Math.max(0, 7 - trialDaysElapsed) : null

  const infoRows = [
    { label: 'Restaurant ID', value: restaurant.id, icon: Hash, mono: true },
    { label: 'User ID', value: restaurant.user_id, icon: User, mono: true },
    {
      label: 'Created',
      value: new Date(restaurant.created_at).toLocaleString('en-GB'),
      icon: Calendar,
    },
    { label: 'Country', value: restaurant.country, icon: Flag },
    { label: 'Address', value: restaurant.address, icon: MapPin },
    { label: 'Phone', value: restaurant.phone, icon: Phone },
    { label: 'Email', value: restaurant.email, icon: Mail },
    { label: 'WhatsApp', value: restaurant.whatsapp, icon: MessageCircle },
    { label: 'Instagram', value: restaurant.instagram, icon: Share2 },
    { label: 'Facebook', value: restaurant.facebook, icon: Globe },
    { label: 'Theme', value: restaurant.theme, icon: Palette },
    { label: 'Layout', value: restaurant.layout, icon: LayoutTemplate },
    { label: 'Currency', value: restaurant.currency, icon: DollarSign },
  ]

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link
        href="/super-admin/restaurants"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Restaurants
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">
              {restaurant.name}
            </h1>

            {restaurant.is_suspended ? (
              <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-full">
                Suspended
              </span>
            ) : (
              <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>

          {restaurant.tagline && (
            <p className="text-gray-400 text-sm">{restaurant.tagline}</p>
          )}
        </div>

        <Link
          href={`/${restaurant.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <ExternalLink size={14} />
          View Public Menu
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Restaurant Details
            </h2>

            <div className="space-y-3">
              {infoRows.map((row) => {
                if (!row.value) return null
                const Icon = row.icon

                return (
                  <div key={row.label} className="flex items-start gap-3">
                    <Icon
                      size={15}
                      className="text-gray-500 mt-0.5 flex-shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{row.label}</p>
                      <p
                        className={`text-sm text-white break-all ${
                          row.mono
                            ? 'font-mono text-xs text-gray-300'
                            : ''
                        }`}
                      >
                        {row.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Statistics
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Categories</span>
                <span className="text-sm font-semibold text-white">
                  {categoryCount ?? 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Menu Items</span>
                <span className="text-sm font-semibold text-white">
                  {itemCount ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Billing
            </h2>

            <div className="space-y-3">
              {isInTrial && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Trial</span>
                  <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full">
                    {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} left
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Status</span>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full capitalize">
                  {restaurant.bypass_payment ? 'VIP' : restaurant.subscription_status?.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Next payment</span>
                <span className="text-sm text-white">
                  {restaurant.next_billed_at
                    ? new Date(restaurant.next_billed_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Last payment</span>
                <span className="text-sm text-white">
                  {lastPayment
                    ? `$${lastPayment.amount.toFixed(2)} — ${new Date(lastPayment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : '—'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                <span className="text-sm text-gray-400">Total paid</span>
                <span className="text-sm font-semibold text-white">
                  {totalPaid > 0 ? `$${totalPaid.toFixed(2)}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <RestaurantActions
            restaurantId={restaurant.id}
            isSuspended={restaurant.is_suspended}
          />
        </div>
      </div>
    </div>
  )
}