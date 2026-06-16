'use client'

import { useState } from 'react'
import { Megaphone, X } from 'lucide-react'

type Announcement = {
  id: string
  title: string
  message: string
}

export default function AnnouncementBanner({
  announcements,
}: {
  announcements: Announcement[]
}) {
  const [dismissed, setDismissed] = useState<string[]>([])

  async function dismiss(id: string) {
    setDismissed((prev) => [...prev, id])
    await fetch('/api/dashboard/dismiss-announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcement_id: id }),
    })
  }

  const visible = announcements.filter((a) => !dismissed.includes(a.id))

  if (visible.length === 0) return null

  return (
    <div className="space-y-0">
      {visible.map((a) => (
        <div
          key={a.id}
          className="bg-sky-500 text-white px-4 py-3 flex items-start justify-between gap-4"
        >
          <div className="flex items-start gap-3 max-w-4xl mx-auto w-full">
            <Megaphone size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm">{a.title}: </span>
              <span className="text-sm text-sky-50">{a.message}</span>
            </div>
            <button
              onClick={() => dismiss(a.id)}
              className="shrink-0 hover:bg-sky-400 rounded p-0.5 transition-colors"
              title="Dismiss"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}