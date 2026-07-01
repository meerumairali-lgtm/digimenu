'use client'

import { useState } from 'react'
import { Database } from 'lucide-react'

export default function RevenueCard({
  thisMonth,
  allTime,
}: {
  thisMonth: number
  allTime: number
}) {
  const [mode, setMode] = useState<'month' | 'alltime'>('month')

  const value = mode === 'month' ? thisMonth : allTime

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <select
          value={mode}
          onChange={e => setMode(e.target.value as 'month' | 'alltime')}
          className="text-xs bg-gray-800 text-gray-300 border border-gray-700 rounded-full px-2 py-0.5 outline-none cursor-pointer"
        >
          <option value="month">This month</option>
          <option value="alltime">All time</option>
        </select>
      </div>
      <div className="text-emerald-400 mb-3">
        <Database size={20} />
      </div>
      <p className="text-2xl font-bold text-white">
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <p className="text-sm text-gray-400 mt-1">Monthly Revenue</p>
    </div>
  )
}