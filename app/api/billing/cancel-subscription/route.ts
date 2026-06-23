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
    return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 })
  }

  if (restaurant.subscription_status === 'cancelled') {
    return NextResponse.json({ error: 'Subscription is already canceled' }, { status: 400 })
  }

  const paddleApiKey = process.env.PADDLE_API_KEY
  const paddleApiBase = process.env.PADDLE_API_BASE || 'https://sandbox-api.paddle.com'

  if (!paddleApiKey) {
    console.error('PADDLE_API_KEY not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const paddleRes = await fetch(
    `${paddleApiBase}/subscriptions/${restaurant.paddle_subscription_id}/cancel`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paddleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ effective_from: 'next_billing_period' }),
    }
  )

  if (!paddleRes.ok) {
    const errBody = await paddleRes.text()
    console.error('Paddle cancel-subscription call failed', paddleRes.status, errBody)
    return NextResponse.json({ error: 'Failed to cancel subscription with Paddle' }, { status: 502 })
  }

  console.log('CANCEL DEBUG: about to update restaurant', restaurant.id, 'to cancelled')

  const { data: updateData, error: updateError } = await admin
    .from('restaurants')
    .update({ subscription_status: 'cancelled' })
    .eq('id', restaurant.id)
    .select()

  console.log('CANCEL DEBUG: update result', JSON.stringify({ updateData, updateError }))

  if (updateError) {
    console.error('Failed to locally mark subscription canceled after Paddle success', updateError)
  }

  return NextResponse.json({ success: true })
}