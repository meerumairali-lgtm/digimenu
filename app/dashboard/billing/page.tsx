'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const TRIAL_DAYS = 7

interface Payment {
  id: string
  paddle_transaction_id: string
  amount: number
  currency: string
  type: string
  status: string
  created_at: string
}

interface BillingInfo {
  subscription_status: string
  bypass_payment: boolean
  trial_started_at: string | null
  pricing_tier: string
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [billing, setBilling] = useState<BillingInfo | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, subscription_status, bypass_payment, trial_started_at, pricing_tier')
        .eq('user_id', user.id)
        .maybeSingle()

      if (restaurant) {
        setBilling(restaurant)
        setRestaurantId(restaurant.id)

        const { data: paymentRows } = await supabase
          .from('payments')
          .select('id, paddle_transaction_id, amount, currency, type, status, created_at')
          .eq('restaurant_id', restaurant.id)
          .order('created_at', { ascending: false })

        if (paymentRows) setPayments(paymentRows)
      } else {
        const { data: pending } = await supabase
          .from('pending_signups')
          .select('subscription_status, trial_started_at, pricing_tier')
          .eq('user_id', user.id)
          .maybeSingle()

        if (pending) {
          setBilling({ ...pending, bypass_payment: false })
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  function daysRemaining(trialStartedAt: string | null): number {
    if (!trialStartedAt) return 0
    const startedMs = new Date(trialStartedAt).getTime()
    const elapsedDays = (Date.now() - startedMs) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.ceil(TRIAL_DAYS - elapsedDays))
  }

  const sectionStyle = {
    background: '#f0f9ff', borderRadius: 12, padding: 20,
    border: '1px solid #e0f2fe'
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' as const, color: '#0D1B2A' }}>Loading...</div>
  }

  const isActive = billing?.subscription_status === 'active'
  const isBypassed = billing?.bypass_payment === true
  const isUnlocked = isActive || isBypassed
  const remaining = !isUnlocked ? daysRemaining(billing?.trial_started_at || null) : 0

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, color: '#0D1B2A' }}>Billing & Subscription</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#0D1B2A' }}>Subscription Status</h3>

          {isBypassed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                ⭐ VIP Access
              </span>
              <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Your account has complimentary access — no billing applies.</p>
            </div>
          ) : isActive ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: '#dcfce7', color: '#166534', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                Active
              </span>
              <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Your subscription is active.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{
                  background: remaining > 0 ? '#fef3c7' : '#fee2e2',
                  color: remaining > 0 ? '#92400e' : '#991b1b',
                  fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999
                }}>
                  {remaining > 0 ? `Trial — ${remaining} day${remaining === 1 ? '' : 's'} left` : 'Trial ended'}
                </span>
              </div>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#888' }}>
                {remaining > 0
                  ? 'Your public menu page will go live once you subscribe. You can keep editing everything in your dashboard until then.'
                  : 'Your trial has ended. Subscribe now to make your menu page live for customers.'}
              </p>
              <Link
                href="/checkout"
                style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 8, background: '#38BDF8', color: '#0D1B2A', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
              >
                {remaining > 0 ? 'Upgrade now' : 'Subscribe to go live'}
              </Link>
            </div>
          )}
        </div>

        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Payment History</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>Past charges to your account</p>

          {payments.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: '#888', fontStyle: 'italic' }}>No payments yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {payments.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e0f2fe' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0D1B2A', textTransform: 'capitalize' as const }}>
                      {p.type === 'setup' ? 'Setup fee' : p.type === 'monthly' ? 'Monthly subscription' : p.type}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>
                      {new Date(p.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0D1B2A' }}>
                      {p.amount != null ? `$${Number(p.amount).toFixed(2)}` : '—'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: p.status === 'completed' ? '#16a34a' : '#888', textTransform: 'capitalize' as const }}>
                      {p.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}