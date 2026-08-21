import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const MONTHLY_PRICE_ID = process.env.PADDLE_MONTHLY_PRICE_ID!
const PADDLE_PRODUCT_ID = process.env.PADDLE_PRODUCT_ID!

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

async function getPaddlePriceAmount(priceId: string): Promise<number | null> {
  const res = await fetch(`${PADDLE_API_BASE}/prices/${priceId}`, {
    headers: { Authorization: `Bearer ${process.env.PADDLE_API_KEY}` },
  })
  if (!res.ok) return null
  const json = await res.json()
  const cents = json?.data?.unit_price?.amount
  return cents != null ? Number(cents) / 100 : null
}

function applyDiscount(amount: number, coupon: Coupon | null): number {
  if (!coupon) return amount
  if (coupon.applies_to !== 'both' && coupon.applies_to !== 'monthly') return amount
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
      .select('subscription_status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (pending?.subscription_status === 'active') {
      return NextResponse.json({ error: 'Already active' }, { status: 400 })
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

    let items: any[]

    if (!coupon) {
      items = [{ price_id: MONTHLY_PRICE_ID, quantity: 1 }]
    } else {
      const catalogPrice = await getPaddlePriceAmount(MONTHLY_PRICE_ID)

      if (catalogPrice == null) {
        console.error('Could not fetch live Paddle price for coupon calculation')
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 502 })
      }

      const price = applyDiscount(catalogPrice, coupon)

      items = [
        {
          quantity: 1,
          price: {
            product_id: PADDLE_PRODUCT_ID,
            description: 'Monthly subscription',
            name: 'Monthly subscription',
            unit_price: {
              amount: Math.round(price * 100).toString(),
              currency_code: 'USD',
            },
          },
        },
      ]
    }

    const paddleRes = await fetch(`${PADDLE_API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
      },
      body: JSON.stringify({
        items,
        custom_data: {
          user_id: user.id,
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