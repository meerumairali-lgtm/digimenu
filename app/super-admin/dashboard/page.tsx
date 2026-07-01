import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Store,
  Users,
  UtensilsCrossed,
  LayoutList,
  CheckCircle,
  XCircle,
  CalendarDays,
} from 'lucide-react'
import RevenueCard from './RevenueCard'

export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

async function getStats() {
  const supabase = await createClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { count: totalRestaurants },
    { count: activeRestaurants },
    { count: suspendedRestaurants },
    { count: totalCategories },
    { count: totalItems },
    { count: newThisMonth },
    { count: paidSubscribers },
    { data: paymentsThisMonth },
    { data: paymentsAllTime },
  ] = await Promise.all([
    supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('is_suspended', false),
    supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('is_suspended', true),
    supabase
      .from('categories')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString()),
    // Paid subscribers: active status, NOT a VIP bypass
    supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')
      .eq('bypass_payment', false),
    // Revenue this month
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString()),
    // Revenue all time
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed'),
  ])

  const revenueThisMonth = (paymentsThisMonth ?? [])
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)

  const revenueAllTime = (paymentsAllTime ?? [])
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)

  return {
    totalRestaurants: totalRestaurants ?? 0,
    activeRestaurants: activeRestaurants ?? 0,
    suspendedRestaurants: suspendedRestaurants ?? 0,
    totalCategories: totalCategories ?? 0,
    totalItems: totalItems ?? 0,
    newThisMonth: newThisMonth ?? 0,
    paidSubscribers: paidSubscribers ?? 0,
    revenueThisMonth,
    revenueAllTime,
  }
}

export default async function SuperAdminDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const stats = await getStats()

  const cards = [
    {
      label: 'Total Restaurants',
      value: stats.totalRestaurants,
      icon: Store,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    },
    {
      label: 'Active Restaurants',
      value: stats.activeRestaurants,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: 'Suspended',
      value: stats.suspendedRestaurants,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    {
      label: 'Total Categories',
      value: stats.totalCategories,
      icon: LayoutList,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Total Menu Items',
      value: stats.totalItems,
      icon: UtensilsCrossed,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      label: 'New This Month',
      value: stats.newThisMonth,
      icon: CalendarDays,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
    {
      label: 'Paid Subscribers',
      value: stats.paidSubscribers,
      icon: Users,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="text-gray-400 text-sm mt-1">
          Live stats across all Menuberg restaurants
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`rounded-xl border ${card.border} ${card.bg} p-5`}
            >
              <div className={`${card.color} mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-sm text-gray-400 mt-1">{card.label}</p>
            </div>
          )
        })}

        {/* Revenue card is client-side for the month/all-time dropdown */}
        <RevenueCard
          thisMonth={stats.revenueThisMonth}
          allTime={stats.revenueAllTime}
        />
      </div>
    </div>
  )
}