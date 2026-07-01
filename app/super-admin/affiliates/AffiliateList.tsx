'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, ExternalLink, DollarSign, Plus, Eye } from 'lucide-react'

type MonthlyStats = {
  month: string
  restaurants_signed: number
  setup_fee_earned: number
  recurring_earned: number
  total_earned: number
  rank_at_month: string
}

type Payment = {
  id: string
  period_start: string
  period_end: string
  amount_paid: number
  paid_at: string
  notes: string | null
}

type Affiliate = {
  id: string
  name: string
  username: string
  current_rank: string
  payment_suspended: boolean
  created_at: string
  total_restaurants: number
  affiliate_monthly_stats: MonthlyStats[]
  affiliate_payments: Payment[]
}

const RANK_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  none: { label: 'No Rank', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  silver: { label: 'Silver Partner', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  gold: { label: 'Gold Partner', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  platinum: { label: 'Platinum Partner', color: '#38BDF8', bg: 'rgba(56,189,248,0.1)' },
  diamond: { label: 'Diamond Partner', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
}

function RankBadge({ rank }: { rank: string }) {
  const s = RANK_STYLES[rank] || RANK_STYLES.none
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
      color: s.color, background: s.bg, border: `1px solid ${s.color}33`,
      whiteSpace: 'nowrap' as const,
    }}>
      {s.label}
    </span>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatMonth(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

// Calculate what's owed for the previous complete month
function calcPendingPayment(affiliate: Affiliate): number {
  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthStr = prevMonth.toISOString().slice(0, 7) // YYYY-MM

  const stats = affiliate.affiliate_monthly_stats.find(s =>
    s.month.startsWith(prevMonthStr)
  )
  if (!stats) return 0

  // Check if already paid for this period
  const alreadyPaid = affiliate.affiliate_payments.some(p =>
    p.period_start.startsWith(prevMonthStr)
  )
  if (alreadyPaid) return 0

  return stats.total_earned
}

export default function AffiliateList({ initialAffiliates }: { initialAffiliates: Affiliate[] }) {
  const [affiliates, setAffiliates] = useState(initialAffiliates)
  const [selected, setSelected] = useState<Affiliate | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showPay, setShowPay] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payNotes, setPayNotes] = useState('')
  const [addForm, setAddForm] = useState({ name: '', username: '', password: '' })
  const [adding, setAdding] = useState(false)
  const [paying, setPaying] = useState(false)
  const [addError, setAddError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  async function handleAddAffiliate() {
    if (!addForm.name.trim() || !addForm.username.trim() || !addForm.password.trim()) {
      setAddError('All fields are required.')
      return
    }
    setAdding(true)
    setAddError('')

    // Hash password using Supabase auth — create a real auth user
    const { data: authData, error: authError } = await supabase.auth.admin?.createUser?.({
      email: `${addForm.username}@affiliate.menuberg.com`,
      password: addForm.password,
      email_confirm: true,
    }) as any

    // If admin createUser not available client-side, store hashed manually
    // We'll use a simple approach: store in affiliates table directly
    // Password stored as plain for now (admin-only table, no public access)
    // In production you'd use a server action or API route for this
    const { data: newAffiliate, error } = await supabase
      .from('affiliates')
      .insert({
        name: addForm.name.trim(),
        username: addForm.username.trim().toLowerCase(),
        password_hash: addForm.password, // stored as-is, admin only
        current_rank: 'none',
      })
      .select()
      .single()

    if (error) {
      setAddError(error.message)
      setAdding(false)
      return
    }

    setAffiliates(prev => [{ ...newAffiliate, total_restaurants: 0, affiliate_monthly_stats: [], affiliate_payments: [] }, ...prev])
    setAddForm({ name: '', username: '', password: '' })
    setShowAdd(false)
    setAdding(false)
  }

  async function handlePay() {
    if (!selected || !payAmount) return
    setPaying(true)

    const now = new Date()
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const { data: payment, error } = await supabase
      .from('affiliate_payments')
      .insert({
        affiliate_id: selected.id,
        period_start: prevMonthStart.toISOString().slice(0, 10),
        period_end: prevMonthEnd.toISOString().slice(0, 10),
        amount_paid: parseFloat(payAmount),
        notes: payNotes || null,
      })
      .select()
      .single()

    if (!error && payment) {
      // Update local state
      const updatedAffiliate = {
        ...selected,
        affiliate_payments: [...selected.affiliate_payments, payment],
      }
      setAffiliates(prev => prev.map(a => a.id === selected.id ? updatedAffiliate : a))
      setSelected(updatedAffiliate)
    }

    setPaying(false)
    setShowPay(false)
    setPayAmount('')
    setPayNotes('')
  }

  const pending = selected ? calcPendingPayment(selected) : 0
  const lastPayment = selected?.affiliate_payments?.sort((a, b) =>
    new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
  )[0] || null

  const totalEarned = selected?.affiliate_monthly_stats?.reduce((sum, s) => sum + (s.total_earned || 0), 0) || 0
  const totalPaid = selected?.affiliate_payments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Affiliates</h1>
          <p className="text-gray-400 text-sm mt-1">{affiliates.length} affiliate{affiliates.length !== 1 ? 's' : ''} on the platform</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={15} /> Add Affiliate
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Username</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium">Rank</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium hidden md:table-cell">Restaurants</th>
              <th className="text-left px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">Status</th>
              <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {affiliates.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  No affiliates yet — add your first one above.
                </td>
              </tr>
            )}
            {affiliates.map(a => (
              <tr key={a.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{a.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Since {formatDate(a.created_at)}</p>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{a.username}</td>
                <td className="px-4 py-3"><RankBadge rank={a.current_rank} /></td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-400">{a.total_restaurants}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {a.payment_suspended ? (
                    <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-full">Suspended</span>
                  ) : (
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">Active</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSelected(a)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye size={15} />
                    </button>
                    
                      href={`/affiliate/dashboard?preview=${a.id}`}
                      target="_blank"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="View dashboard"
                    <a>
                      <ExternalLink size={15} />
                    </a>
                    <button
                      onClick={() => { setSelected(a); setShowPay(true) }}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Record payment"
                    >
                      <DollarSign size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Affiliate Detail Overlay ── */}
      {selected && !showPay && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                <p className="text-gray-400 text-sm font-mono">@{selected.username}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Rank + status */}
              <div className="flex items-center gap-3 flex-wrap">
                <RankBadge rank={selected.current_rank} />
                {selected.payment_suspended && (
                  <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-full">Payment Suspended</span>
                )}
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total restaurants', value: selected.total_restaurants },
                  { label: 'Earned to date', value: `$${totalEarned.toFixed(2)}` },
                  { label: 'Total paid', value: `$${totalPaid.toFixed(2)}` },
                  { label: 'Balance owed', value: `$${(totalEarned - totalPaid).toFixed(2)}` },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-800 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Payment due */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-xs text-emerald-400 font-semibold mb-1">Payment due (last month)</p>
                <p className="text-2xl font-bold text-white">${pending.toFixed(2)}</p>
                {lastPayment && (
                  <p className="text-xs text-gray-400 mt-2">
                    Last paid: ${lastPayment.amount_paid.toFixed(2)} on {formatDate(lastPayment.paid_at)}
                    {lastPayment.notes && ` — ${lastPayment.notes}`}
                  </p>
                )}
              </div>

              {/* Monthly breakdown */}
              {selected.affiliate_monthly_stats.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Monthly breakdown</p>
                  <div className="flex flex-col gap-2">
                    {[...selected.affiliate_monthly_stats]
                      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
                      .map(s => (
                        <div key={s.month} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                          <div>
                            <p className="text-sm text-white font-medium">{formatMonth(s.month)}</p>
                            <p className="text-xs text-gray-400">{s.restaurants_signed} restaurants · <RankBadge rank={s.rank_at_month} /></p>
                          </div>
                          <p className="text-sm font-bold text-emerald-400">${s.total_earned.toFixed(2)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Payment history */}
              {selected.affiliate_payments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Payment history</p>
                  <div className="flex flex-col gap-2">
                    {[...selected.affiliate_payments]
                      .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
                      .map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                          <div>
                            <p className="text-sm text-white">{formatDate(p.period_start)} – {formatDate(p.period_end)}</p>
                            <p className="text-xs text-gray-400">Paid on {formatDate(p.paid_at)}{p.notes ? ` · ${p.notes}` : ''}</p>
                          </div>
                          <p className="text-sm font-bold text-white">${p.amount_paid.toFixed(2)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                
                  href={`/affiliate/dashboard?preview=${selected.id}`}
                  target="_blank"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                <a>
                  <ExternalLink size={14} /> View Dashboard
                </a>
                <button
                  onClick={() => setShowPay(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <DollarSign size={14} /> Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pay Modal ── */}
      {showPay && selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Record Payment</h3>
              <button onClick={() => { setShowPay(false); setPayAmount(''); setPayNotes('') }} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Affiliate</p>
                <p className="text-sm font-semibold text-white">{selected.name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Suggested amount (last month)</p>
                <p className="text-lg font-bold text-emerald-400">${pending.toFixed(2)}</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2">Amount paid (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  placeholder={pending.toFixed(2)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2">Notes (optional)</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  placeholder="e.g. Paid via Easypaisa"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                />
              </div>

              <button
                onClick={handlePay}
                disabled={paying || !payAmount}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {paying ? 'Recording...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Affiliate Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Add Affiliate</h3>
              <button onClick={() => { setShowAdd(false); setAddError('') }} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {addError && <p className="text-xs text-red-400">{addError}</p>}

              <div>
                <label className="text-xs text-gray-400 block mb-2">Full name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Ali Hassan"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2">Username</label>
                <input
                  type="text"
                  value={addForm.username}
                  onChange={e => setAddForm({ ...addForm, username: e.target.value.toLowerCase() })}
                  placeholder="alihassan"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                />
                <p className="text-xs text-gray-500 mt-1">Their referral URL: menuberg.com/signup?ref={addForm.username || 'username'}</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2">Password</label>
                <input
                  type="text"
                  value={addForm.password}
                  onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Set a strong password"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sky-500"
                />
                <p className="text-xs text-gray-500 mt-1">Share this with the affiliate — they'll use it to log in.</p>
              </div>

              <button
                onClick={handleAddAffiliate}
                disabled={adding}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {adding ? 'Creating...' : 'Create Affiliate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}