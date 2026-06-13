'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'

type Log = {
  id: string
  admin_email: string
  action: string
  target_type: string
  target_id: string | null
  target_name: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  suspend: 'bg-yellow-900/50 text-yellow-400',
  unsuspend: 'bg-green-900/50 text-green-400',
  delete: 'bg-red-900/50 text-red-400',
  update_settings: 'bg-blue-900/50 text-blue-400',
  update_content: 'bg-purple-900/50 text-purple-400',
}

const ACTION_LABELS: Record<string, string> = {
  suspend: 'Suspended',
  unsuspend: 'Unsuspended',
  delete: 'Deleted',
  update_settings: 'Settings Updated',
  update_content: 'Content Updated',
}

export default function AuditClient({ logs }: { logs: Log[] }) {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const filtered = logs.filter((log) => {
    const matchesSearch =
      (log.target_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    return matchesSearch && matchesAction
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Actions</option>
          <option value="suspend">Suspend</option>
          <option value="unsuspend">Unsuspend</option>
          <option value="delete">Delete</option>
          <option value="update_settings">Settings Update</option>
          <option value="update_content">Content Update</option>
        </select>
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">Action</th>
              <th className="text-left px-4 py-3">Target</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Type</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Admin</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No logs found.
                </td>
              </tr>
            )}
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      ACTION_COLORS[log.action] ?? 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-white font-medium">
                  {log.target_name ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell capitalize">
                  {log.target_type.replace('_', ' ')}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                  {log.admin_email}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}