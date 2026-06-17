'use client'
import { useMemo } from 'react'
import Link from 'next/link'

type Props = {
  restaurantName: string
  stats: { today: number; thisWeek: number; thisMonth: number; allTime: number }
  rawViews: { visited_at: string }[]
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function BarChart({ data, labelKey, valueKey, accent = '#38BDF8' }: {
  data: { label: string; value: number }[]
  labelKey?: string
  valueKey?: string
  accent?: string
}) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 10, color: '#38BDF8', fontWeight: 600, opacity: d.value > 0 ? 1 : 0 }}>{d.value || ''}</span>
          <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: accent, opacity: d.value === 0 ? 0.15 : 0.85, height: `${(d.value / max) * 80}px`, minHeight: d.value > 0 ? 4 : 0, transition: 'height 0.3s ease' }} />
          <span style={{ fontSize: 9, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsClient({ restaurantName, stats, rawViews }: Props) {

  // Last 7 days bar chart
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const label = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dateStr = d.toISOString().slice(0, 10)
      const value = rawViews.filter(v => v.visited_at.slice(0, 10) === dateStr).length
      return { label, value }
    })
  }, [rawViews])

  // Last 30 days bar chart
  const last30Days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      const dateStr = d.toISOString().slice(0, 10)
      const value = rawViews.filter(v => v.visited_at.slice(0, 10) === dateStr).length
      const label = i % 5 === 0 ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
      return { label, value }
    })
  }, [rawViews])

  // By day of week
  const byDayOfWeek = useMemo(() => {
    const counts = Array(7).fill(0)
    rawViews.forEach(v => {
      const day = new Date(v.visited_at).getDay()
      counts[day]++
    })
    return DAYS_SHORT.map((label, i) => ({ label, value: counts[i] }))
  }, [rawViews])

  // By hour
  const byHour = useMemo(() => {
    const counts = Array(24).fill(0)
    rawViews.forEach(v => {
      const hour = new Date(v.visited_at).getHours()
      counts[hour]++
    })
    return HOURS.map(h => ({
      label: h % 6 === 0 ? `${h === 0 ? '12a' : h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}` : '',
      value: counts[h]
    }))
  }, [rawViews])

  // Peak day and hour
  const peakDay = useMemo(() => {
    const max = Math.max(...byDayOfWeek.map(d => d.value))
    return max > 0 ? byDayOfWeek.find(d => d.value === max)?.label : '—'
  }, [byDayOfWeek])

  const peakHour = useMemo(() => {
    const counts = Array(24).fill(0)
    rawViews.forEach(v => { counts[new Date(v.visited_at).getHours()]++ })
    const max = Math.max(...counts)
    if (max === 0) return '—'
    const h = counts.indexOf(max)
    return h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`
  }, [rawViews])

  // Recent visits
  const recentVisits = useMemo(() => {
    return [...rawViews].reverse().slice(0, 10)
  }, [rawViews])

  const card = {
    background: '#fff', borderRadius: 16,
    border: '1px solid #e0f2fe', padding: '20px 24px',
    marginBottom: 16,
  }

  const statCard = (label: string, value: number, sub?: string) => (
    <div style={{ background: '#f0f9ff', borderRadius: 12, padding: '16px 20px', border: '1px solid #e0f2fe', flex: 1 }}>
      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#38BDF8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#0D1B2A' }}>{value.toLocaleString()}</p>
      {sub && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>{sub}</p>}
    </div>
  )

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 60px', fontFamily: '"Inter", sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/dashboard" style={{ fontSize: 13, color: '#38BDF8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0D1B2A' }}>Analytics</h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#94a3b8' }}>{restaurantName}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {statCard('Today', stats.today, 'visitors')}
        {statCard('This Week', stats.thisWeek, 'last 7 days')}
        {statCard('This Month', stats.thisMonth, 'this month')}
        {statCard('All Time', stats.allTime, 'total visits')}
      </div>

      {/* Last 7 days chart */}
      <div style={card}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#0D1B2A' }}>Last 7 Days</h3>
        <BarChart data={last7Days} />
      </div>

      {/* Last 30 days chart */}
      <div style={card}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#0D1B2A' }}>Last 30 Days</h3>
        <BarChart data={last30Days} />
      </div>

      {/* Peak insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ ...card, marginBottom: 0 }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Busiest Day</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0D1B2A' }}>{peakDay}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>of the week</p>
        </div>
        <div style={{ ...card, marginBottom: 0 }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Peak Hour</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0D1B2A' }}>{peakHour}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>most visitors</p>
        </div>
      </div>

      {/* By day of week */}
      <div style={card}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#0D1B2A' }}>Visits by Day of Week</h3>
        <BarChart data={byDayOfWeek} accent='#7DD3FC' />
      </div>

      {/* By hour */}
      <div style={card}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#0D1B2A' }}>Visits by Hour of Day</h3>
        <BarChart data={byHour} accent='#38BDF8' />
      </div>

      {/* Recent visits */}
      {recentVisits.length > 0 && (
        <div style={card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#0D1B2A' }}>Recent Visits</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentVisits.map((v, i) => {
              const date = new Date(v.visited_at)
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: '#0D1B2A' }}>
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>
                    {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {rawViews.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <p style={{ fontSize: 32, margin: '0 0 12px' }}>📊</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#0D1B2A', margin: '0 0 6px' }}>No visits yet</p>
          <p style={{ fontSize: 13, margin: 0 }}>Share your menu link and visits will appear here</p>
        </div>
      )}
    </div>
  )
}