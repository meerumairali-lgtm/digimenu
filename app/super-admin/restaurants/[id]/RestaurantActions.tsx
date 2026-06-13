'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldOff, ShieldCheck, Trash2 } from 'lucide-react'

export default function RestaurantActions({
  restaurantId,
  isSuspended,
}: {
  restaurantId: string
  isSuspended: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleSuspend() {
    setLoading(true)
    await supabase
      .from('restaurants')
      .update({ is_suspended: !isSuspended })
      .eq('id', restaurantId)
    setLoading(false)
    router.refresh()
  }

  async function deleteRestaurant() {
    if (
      !confirm(
        'Permanently delete this restaurant? All data will be lost. This cannot be undone.'
      )
    )
      return
    setLoading(true)
    await supabase.from('restaurants').delete().eq('id', restaurantId)
    router.push('/super-admin/restaurants')
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
        Quick Actions
      </h2>
      <div className="space-y-2">
        <button
          onClick={toggleSuspend}
          disabled={loading}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50
            ${
              isSuspended
                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20'
            }`}
        >
          {isSuspended ? (
            <>
              <ShieldCheck size={15} /> Reactivate Account
            </>
          ) : (
            <>
              <ShieldOff size={15} /> Suspend Account
            </>
          )}
        </button>

        <button
          onClick={deleteRestaurant}
          disabled={loading}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
        >
          <Trash2 size={15} /> Delete Restaurant
        </button>
      </div>
    </div>
  )
}