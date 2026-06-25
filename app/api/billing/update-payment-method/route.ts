import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: restaurant, error: lookupError } = await admin
    .from('restaurants')
    .select('id, paddle_subscription_id, subscription_status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (lookupError || !restaurant) {
    return NextResponse.json({ error: 'No restaurant found for this account' }, { status: 404 })
  }

  if (!restaurant.paddle_subscription_id) {
    return NextResponse.json({ error: 'No subscription found to update' }, { status: 400 })
  }

  // Paddle only allows payment-method updates for subscriptions that are
  // active or past_due. Anything else (cancelled, no subscription yet)
  // should go through the normal checkout flow instead.
  if (restaurant.subscription_status !== 'active' && restaurant.subscription_status !== 'past_due') {
    return NextResponse.json(
      { error: 'Payment method updates are only available for active or past-due subscriptions' },
      { status: 400 }
    )
  }

  const paddleApiKey = process.env.PADDLE_API_KEY
  const paddleApiBase = process.env.PADDLE_API_BASE || 'https://sandbox-api.paddle.com'

  if (!paddleApiKey) {
    console.error('PADDLE_API_KEY not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const paddleRes = await fetch(
    `${paddleApiBase}/subscriptions/${restaurant.paddle_subscription_id}/update-payment-method-transaction`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paddleApiKey}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!paddleRes.ok) {
    const errBody = await paddleRes.text()
    console.error('Paddle update-payment-method-transaction call failed', paddleRes.status, errBody)
    return NextResponse.json({ error: 'Failed to start payment method update with Paddle' }, { status: 502 })
  }

  const paddleData = await paddleRes.json()
  const transactionId = paddleData?.data?.id

  if (!transactionId) {
    console.error('Paddle update-payment-method-transaction response missing transaction id', JSON.stringify(paddleData))
    return NextResponse.json({ error: 'Unexpected response from Paddle' }, { status: 502 })
  }

  return NextResponse.json({ transactionId })
}