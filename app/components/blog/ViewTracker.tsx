'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export default function ViewTracker({ event, params }: { event: string; params?: Record<string, unknown> }) {
  useEffect(() => {
    trackEvent(event, params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  return null
}
