import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Maps each pricing tier to its two Paddle Price IDs (setup fee + monthly).
// const PADDLE_PRICE_IDS: Record<string, { setup: string; monthly: string }> = {
//   tier_a: {
//     setup: 'pri_01kvhcswa3a0wf6me8v7tvj882',
//     monthly: 'pri_01kvhcz3hja1r3dem1kbeg4pbd',
//   },
//   tier_b: {
//     setup: 'pri_01kvhd3q571p0k8cabxt4r9vxz',
//     monthly: 'pri_01kvhd59hydcrc7z94awczcsge',
//   },
// }

const PADDLE_PRICE_IDS: Record<string, { setup: string; monthly: string }> = {
  tier_a: {
    setup: 'pri_01kvkakwytrpft23tq4vs7sast',
    monthly: 'pri_01kvkar865vqnsabs6frwfatkg',
  },
  tier_b: {
    setup: 'pri_01kvka7a5mtbnzmeh3mxdjyk85',
    monthly: 'pri_01kvka88sbchnykgxpba8f5r6w',
  },
}

const PADDLE_API_BASE =
  process.env.PADDLE_ENV === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com'

interface Coupon {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  applies_to: 'setup' | 'monthly' | 'both'
  is_active: boolean
  expires_at: string | null
  max_redemptions: number | null
  times_redeemed: number
}

function applyDiscount(amount: number, coupon: Coupon | null, type: 'setup' | 'monthly'): number {
  if (!coupon) return amount
  if (coupon.applies_to !== 'both' && coupon.applies_to !== type) return amount
  if (coupon.discount_type === 'percent') {
    return Math.max(0, amount - (amount * coupon.discount_value) / 100)
  }
  return Math.max(0, amount - coupon.discount_value)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const couponCode: string | null = body?.couponCode?.trim() || null

    const { data: pending } = await supabase
      .from('pending_signups')
      .select('pricing_tier, subscription_status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (pending?.subscription_status === 'active') {
      return NextResponse.json({ error: 'Already active' }, { status: 400 })
    }

    const tierId = pending?.pricing_tier || 'tier_a'
    const priceIds = PADDLE_PRICE_IDS[tierId]
    if (!priceIds) {
      return NextResponse.json({ error: 'Invalid pricing tier' }, { status: 400 })
    }

    const { data: tier } = await supabase
      .from('pricing_tiers')
      .select('setup_fee, monthly_price, intro_discount_active, intro_monthly_price')
      .eq('id', tierId)
      .single()

    if (!tier) {
      return NextResponse.json({ error: 'Pricing tier not found' }, { status: 400 })
    }

    let coupon: Coupon | null = null
    if (couponCode) {
      const { data: couponRow } = await supabase
        .from('coupons')
        .select(
          'code, discount_type, discount_value, applies_to, is_active, expires_at, max_redemptions, times_redeemed'
        )
        .ilike('code', couponCode)
        .maybeSingle()

      if (
        couponRow &&
        couponRow.is_active &&
        (!couponRow.expires_at || new Date(couponRow.expires_at) >= new Date()) &&
        (!couponRow.max_redemptions || couponRow.times_redeemed < couponRow.max_redemptions)
      ) {
        coupon = couponRow as Coupon
      }
    }

    const baseMonthly =
      tier.intro_discount_active && tier.intro_monthly_price != null
        ? tier.intro_monthly_price
        : tier.monthly_price

    const setupPrice = applyDiscount(tier.setup_fee, coupon, 'setup')
    const monthlyPrice = applyDiscount(baseMonthly, coupon, 'monthly')

    const setupCents = Math.round(setupPrice * 100).toString()
    const monthlyCents = Math.round(monthlyPrice * 100).toString()

    const paddleRes = await fetch(`${PADDLE_API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
      },
      body: JSON.stringify({
        items: [
          {
            price_id: priceIds.setup,
            quantity: 1,
            price: { unit_price: { amount: setupCents, currency_code: 'USD' } },
          },
          {
            price_id: priceIds.monthly,
            quantity: 1,
            price: { unit_price: { amount: monthlyCents, currency_code: 'USD' } },
          },
        ],
        custom_data: {
          user_id: user.id,
          pricing_tier: tierId,
          coupon_code_used: coupon?.code || null,
        },
      }),
    })

    if (!paddleRes.ok) {
      const errText = await paddleRes.text()
      console.error('Paddle transaction creation failed:', errText)
      return NextResponse.json({ error: 'Failed to create transaction' }, { status: 502 })
    }

    const paddleData = await paddleRes.json()
    const transactionId = paddleData?.data?.id

    if (!transactionId) {
      return NextResponse.json({ error: 'No transaction ID returned' }, { status: 502 })
    }

    return NextResponse.json({ transactionId })
  } catch (err) {
    console.error('create-transaction error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}