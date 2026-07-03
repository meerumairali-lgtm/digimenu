'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Affiliate = {
  id: string
  name: string
  username: string
  current_rank: string
  payment_suspended: boolean
  email: string
  phone: string
  address: string
  city: string
  age: number
  cnic: string
  bank_name: string
  bank_account_number: string
  bank_account_title: string
  created_at: string
}

type Restaurant = {
  id: string
  name: string
  slug: string
  subscription_status: string
  created_at: string
  pricing_tier: string
}

type Payment = {
  id: string
  period_start: string
  period_end: string
  amount_paid: number
  paid_at: string
  notes: string | null
}

type MonthlyStats = {
  id?: string
  month: string
  restaurants_signed: number
  setup_fee_earned: number
  recurring_earned: number
  total_earned: number
  rank_at_month: string
}

const RANK_COLORS: Record<string, string> = {
  none: '#9ca3af',
  silver: '#94a3b8',
  gold: '#f59e0b',
  platinum: '#38BDF8',
  diamond: '#a78bfa',
}

const RANK_LABELS: Record<string, string> = {
  none: 'No Rank',
  silver: 'Silver Partner',
  gold: 'Gold Partner',
  platinum: 'Platinum Partner',
  diamond: 'Diamond Partner',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function formatMonth(d: string) {
  return new Date(d).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric'
  })
}

function formatMonthFromKey(key: string) {
  // key is YYYY-MM-DD
  return new Date(key).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric'
  })
}

const performanceColors: Record<string, string> = {
  Promoted: '#10b981',
  Demoted: '#ef4444',
  Sustained: '#f59e0b',
}

export default function AffiliateDashboardClient({
  affiliate,
  restaurants,
  payments,
  prevMonthStats,
  prevMonthPayment,
  prevMonthStart,
  prevMonthEnd,
  nextPayoutDate,
  thisMonthCount,
  projectedRank,
  nextRankInfo,
  estimatedTotal,
  performanceLabel,
  totalEarned,
  totalPaid,
}: {
  affiliate: Affiliate
  restaurants: Restaurant[]
  payments: Payment[]
  prevMonthStats: MonthlyStats | null
  prevMonthPayment: Payment | null
  prevMonthStart: string
  prevMonthEnd: string
  nextPayoutDate: string
  thisMonthCount: number
  projectedRank: string
  nextRankInfo: { label: string; needed: number }
  estimatedTotal: number
  performanceLabel: string | null
  totalEarned: number
  totalPaid: number
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'history' | 'settings'>('overview')
  const [changePw, setChangePw] = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const router = useRouter()

  const balance = totalEarned - totalPaid
  const rankColor = RANK_COLORS[affiliate.current_rank] || RANK_COLORS.none
  const projectedColor = RANK_COLORS[projectedRank] || RANK_COLORS.none

  // Current month name
  const now = new Date()
  const currentMonthName = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  async function handleLogout() {
    await fetch('/api/affiliates/logout', { method: 'POST' })
    router.push('/affiliate/login')
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')
    if (changePw.newPw !== changePw.confirm) { setPwError('New passwords do not match'); return }
    if (changePw.newPw.length < 8) { setPwError('New password must be at least 8 characters'); return }
    setPwLoading(true)
    const res = await fetch('/api/affiliates/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: changePw.current, newPassword: changePw.newPw }),
    })
    const data = await res.json()
    if (!res.ok) { setPwError(data.error || 'Failed') } else {
      setPwSuccess('Password changed successfully!')
      setChangePw({ current: '', newPw: '', confirm: '' })
    }
    setPwLoading(false)
  }

  const s = {
    page: { minHeight: '100vh', background: '#0D1B2A', fontFamily: 'system-ui, sans-serif' } as React.CSSProperties,
    topbar: { background: '#112240', borderBottom: '1px solid rgba(56,189,248,0.1)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
    content: { maxWidth: 900, margin: '0 auto', padding: '32px 20px' } as React.CSSProperties,
    card: { background: '#112240', borderRadius: 16, padding: 24, border: '1px solid rgba(56,189,248,0.1)' } as React.CSSProperties,
    tab: (active: boolean) => ({
      padding: '9px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
      background: active ? '#38BDF8' : 'transparent',
      color: active ? '#0D1B2A' : '#7DD3FC',
      fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap' as const,
    }),
    input: { padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.2)', fontSize: 14, width: '100%', background: '#0D1B2A', color: '#fff', boxSizing: 'border-box' as const, outline: 'none' },
    label: { fontSize: 12, fontWeight: 600, color: '#7DD3FC', display: 'block', marginBottom: 5 } as React.CSSProperties,
  }

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🤝</span>
          <div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Menuberg</span>
            <span style={{ color: '#38BDF8', fontSize: 12, marginLeft: 6 }}>Affiliate Portal</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#7DD3FC', fontSize: 13 }}>Hi, {affiliate.name.split(' ')[0]}</span>
          <button onClick={handleLogout} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(56,189,248,0.2)', background: 'none', color: '#7DD3FC', fontSize: 13, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={s.content}>
        {/* Payment suspended warning */}
        {affiliate.payment_suspended && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, color: '#f87171', fontSize: 14 }}>
            ⚠️ Your payments are currently suspended due to low activity. Please contact your manager with proof or explanation to reinstate.
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {(['overview', 'restaurants', 'history', 'settings'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={s.tab(activeTab === t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Two payment cards side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

              {/* Previous month — locked payout card */}
              <div style={{ ...s.card, borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Next payout
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7DD3FC' }}>
                      {formatDate(nextPayoutDate)}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    🔒 Locked
                  </span>
                </div>

                <p style={{ margin: '0 0 4px', fontSize: 11, color: '#4A6FA5' }}>
                  Period: {formatDate(prevMonthStart)} – {formatDate(prevMonthEnd)}
                </p>

                <p style={{ margin: '0 0 16px', fontSize: 32, fontWeight: 800, color: '#fff' }}>
                  ${prevMonthStats ? prevMonthStats.total_earned.toFixed(2) : '0.00'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#7DD3FC' }}>New clients</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{prevMonthStats?.restaurants_signed ?? 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#7DD3FC' }}>Rank</span>
                    <span style={{ color: RANK_COLORS[prevMonthStats?.rank_at_month || 'none'], fontWeight: 600 }}>
                      {RANK_LABELS[prevMonthStats?.rank_at_month || 'none']}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#7DD3FC' }}>Performance</span>
                    <span style={{ color: performanceColors[performanceLabel || 'Sustained'] || '#f59e0b', fontWeight: 600 }}>
                      {performanceLabel || '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingTop: 8, borderTop: '1px solid rgba(56,189,248,0.1)' }}>
                    <span style={{ color: '#7DD3FC' }}>Status</span>
                    {prevMonthPayment ? (
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Paid on {formatDate(prevMonthPayment.paid_at)}</span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>⏳ Pending</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Current month — live projected card */}
              <div style={{ ...s.card, borderColor: `${projectedColor}33` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: projectedColor, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Current month
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7DD3FC' }}>{currentMonthName}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: `${projectedColor}15`, color: projectedColor, border: `1px solid ${projectedColor}33` }}>
                    Live
                  </span>
                </div>

                <p style={{ margin: '0 0 4px', fontSize: 11, color: '#4A6FA5' }}>Estimated earnings</p>
                <p style={{ margin: '0 0 16px', fontSize: 32, fontWeight: 800, color: '#fff' }}>
                  ${estimatedTotal.toFixed(2)}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#7DD3FC' }}>New restaurants</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{thisMonthCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#7DD3FC' }}>Projected rank</span>
                    <span style={{ color: projectedColor, fontWeight: 600 }}>{RANK_LABELS[projectedRank]}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#7DD3FC' }}>Total portfolio</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{restaurants.length} restaurants</span>
                  </div>
                  {nextRankInfo.needed > 0 && (
                    <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, background: `${projectedColor}10`, border: `1px solid ${projectedColor}22` }}>
                      <p style={{ margin: 0, fontSize: 12, color: projectedColor }}>
                        🎯 Need <strong>{nextRankInfo.needed} more</strong> restaurant{nextRankInfo.needed !== 1 ? 's' : ''} this month to reach <strong>{nextRankInfo.label}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
              {[
                { label: 'Total restaurants', value: restaurants.length, color: '#38BDF8' },
                { label: 'Earned to date', value: `$${totalEarned.toFixed(2)}`, color: '#10b981' },
                { label: 'Total paid out', value: `$${totalPaid.toFixed(2)}`, color: '#a78bfa' },
                { label: 'Balance owed', value: `$${balance.toFixed(2)}`, color: '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} style={s.card}>
                  <p style={{ margin: '0 0 6px', fontSize: 12, color: '#7DD3FC' }}>{stat.label}</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Referral link */}
            <div style={s.card}>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 1 }}>Your referral link</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0D1B2A', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(56,189,248,0.2)' }}>
                <code style={{ flex: 1, fontSize: 13, color: '#7DD3FC', wordBreak: 'break-all' }}>
                  https://www.menuberg.com/signup?ref={affiliate.username}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`https://www.menuberg.com/signup?ref=${affiliate.username}`)}
                  style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(56,189,248,0.3)', background: 'none', color: '#38BDF8', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Copy
                </button>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#4A6FA5' }}>
                Share this link — restaurants that sign up through it are automatically tracked to you.
              </p>
            </div>

            {/* Payment schedule reminder */}
            <div style={{ ...s.card, background: 'rgba(56,189,248,0.04)' }}>
              <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 1 }}>Payment schedule</p>
              <p style={{ margin: 0, fontSize: 13, color: '#7DD3FC', lineHeight: 1.7 }}>
                💰 <strong style={{ color: '#fff' }}>Setup bonus</strong> — 28.5% of setup fee for each new restaurant that pays.<br />
                🔄 <strong style={{ color: '#fff' }}>Monthly recurring</strong> — % of each restaurant's monthly subscription based on your rank.<br />
                📅 <strong style={{ color: '#fff' }}>Payout cycle</strong> — Month closes on last day → paid by 15th of following month.
              </p>
            </div>
          </div>
        )}

        {/* ── RESTAURANTS ── */}
        {activeTab === 'restaurants' && (
          <div style={s.card}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#fff' }}>
              {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} in your portfolio
            </p>
            {restaurants.length === 0 ? (
              <p style={{ color: '#4A6FA5', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
                No restaurants yet — share your referral link to get started!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {restaurants.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0D1B2A', borderRadius: 10, padding: '12px 16px', gap: 12 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontSize: 14 }}>{r.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#4A6FA5' }}>
                        menuberg.com/{r.slug} · Joined {formatDate(r.created_at)}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, flexShrink: 0,
                      color: r.subscription_status === 'active' ? '#10b981' : '#f59e0b',
                      background: r.subscription_status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    }}>
                      {r.subscription_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENT HISTORY ── */}
        {activeTab === 'history' && (
          <div style={s.card}>
            <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#fff' }}>Payment history</p>
            {payments.length === 0 ? (
              <p style={{ color: '#4A6FA5', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
                No payments recorded yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {payments.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0D1B2A', borderRadius: 8, padding: '12px 16px' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, color: '#fff' }}>
                        {formatDate(p.period_start)} – {formatDate(p.period_end)}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#4A6FA5' }}>
                        Paid {formatDate(p.paid_at)}{p.notes ? ` · ${p.notes}` : ''}
                      </p>
                    </div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#10b981' }}>
                      ${p.amount_paid.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={s.card}>
              <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 1 }}>Your profile</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {[
                  { label: 'Full name', value: affiliate.name },
                  { label: 'Username', value: `@${affiliate.username}` },
                  { label: 'Email', value: affiliate.email },
                  { label: 'Phone', value: affiliate.phone },
                  { label: 'City', value: affiliate.city },
                  { label: 'Age', value: String(affiliate.age) },
                  { label: 'CNIC', value: affiliate.cnic },
                  { label: 'Bank name', value: affiliate.bank_name },
                  { label: 'Account title', value: affiliate.bank_account_title },
                  { label: 'Account number', value: affiliate.bank_account_number },
                ].map(item => (
                  <div key={item.label}>
                    <p style={{ margin: '0 0 2px', fontSize: 11, color: '#4A6FA5' }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#fff', wordBreak: 'break-all' }}>{item.value || '—'}</p>
                  </div>
                ))}
              </div>
              <p style={{ margin: '16px 0 0', fontSize: 12, color: '#4A6FA5' }}>To update your profile details, contact your manager.</p>
            </div>

            <div style={s.card}>
              <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 1 }}>Change password</p>
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={s.label}>Current password</label>
                  <input type="password" required value={changePw.current} onChange={e => setChangePw({ ...changePw, current: e.target.value })} style={s.input} />
                </div>
                <div>
                  <label style={s.label}>New password</label>
                  <input type="password" required value={changePw.newPw} onChange={e => setChangePw({ ...changePw, newPw: e.target.value })} style={s.input} />
                </div>
                <div>
                  <label style={s.label}>Confirm new password</label>
                  <input type="password" required value={changePw.confirm} onChange={e => setChangePw({ ...changePw, confirm: e.target.value })} style={s.input} />
                </div>
                {pwError && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{pwError}</p>}
                {pwSuccess && <p style={{ color: '#10b981', fontSize: 13, margin: 0 }}>{pwSuccess}</p>}
                <button type="submit" disabled={pwLoading} style={{ padding: '10px', borderRadius: 8, background: '#38BDF8', color: '#0D1B2A', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: pwLoading ? 0.7 : 1 }}>
                  {pwLoading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}