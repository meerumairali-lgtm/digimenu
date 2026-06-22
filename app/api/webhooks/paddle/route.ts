import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const PRICE_ID_LOOKUP: Record<string, { tier: string; kind: 'setup' | 'monthly' }> = {
  pri_01kvkakwytrpft23tq4vs7sast: { tier: 'tier_a', kind: 'setup' },
  pri_01kvkar865vqnsabs6frwfatkg: { tier: 'tier_a', kind: 'monthly' },
  pri_01kvka7a5mtbnzmeh3mxdjyk85: { tier: 'tier_b', kind: 'setup' },
  pri_01kvka88sbchnykgxpba8f5r6w: { tier: 'tier_b', kind: 'monthly' },
}

function verifySignature(rawBody: string, paddleSignature: string, secretKey: string): boolean {
  const parts = paddleSignature.split(';')
  if (parts.length !== 2) return false

  const [tsPart, h1Part] = parts.map((p) => p.split('=')[1])
  if (!tsPart || !h1Part) return false

  const eventTimeMs = parseInt(tsPart, 10) * 1000
  if (isNaN(eventTimeMs) || Date.now() - eventTimeMs > 5000) {
    return false
  }

  const signedPayload = `${tsPart}:${rawBody}`
  const computedHash = createHmac('sha256', secretKey).update(signedPayload, 'utf8').digest('hex')

  const a = Buffer.from(computedHash)
  const b = Buffer.from(h1Part)
  if (a.length !== b.length) return false

  return timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  const paddleSignature = request.headers.get('paddle-signature')
  const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY

  if (!paddleSignature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }
  if (!secretKey) {
    console.error('PADDLE_WEBHOOK_SECRET_KEY not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const rawBody = await request.text()

  if (!verifySignature(rawBody, paddleSignature, secretKey)) {
    console.error('Paddle webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const eventType = event?.event_type
  const data = event?.data || {}
  const customData = data?.custom_data || {}

  const admin = createAdminClient()

  try {
    switch (eventType) {
      case 'transaction.completed': {
        const userId = customData?.user_id

        if (!userId) {
          console.error('transaction.completed missing custom_data.user_id — likely a test payload, skipping DB writes')
          break
        }

        const { data: restaurant, error: restaurantLookupError } = await admin
          .from('restaurants')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()

        if (restaurantLookupError) {
          console.error('transaction.completed: failed to look up restaurant for user', userId, restaurantLookupError)
        }

        const restaurantId: string | null = restaurant?.id || null

        if (restaurant) {
          const { error: restaurantUpdateError } = await admin
            .from('restaurants')
            .update({
              subscription_status: 'active',
              paddle_customer_id: data?.customer_id || null,
              paddle_subscription_id: data?.subscription_id || null,
            })
            .eq('id', restaurant.id)

          if (restaurantUpdateError) {
            console.error('transaction.completed: failed to update restaurants row', restaurant.id, restaurantUpdateError)
          }
        } else {
          const { error: pendingUpdateError } = await admin
            .from('pending_signups')
            .update({
              subscription_status: 'active',
              paddle_customer_id: data?.customer_id || null,
              paddle_subscription_id: data?.subscription_id || null,
            })
            .eq('user_id', userId)

          if (pendingUpdateError) {
            console.error('transaction.completed: failed to update pending_signups row', userId, pendingUpdateError)
          }
        }

        const lineItems = data?.details?.line_items || []
        for (const item of lineItems) {
          try {
            const priceId = item?.price_id
            const classification = priceId ? PRICE_ID_LOOKUP[priceId] : null

            const dbType = classification?.kind === 'monthly' ? 'subscription' : classification?.kind || 'setup'

            const { error: paymentInsertError } = await admin.from('payments').insert({
              restaurant_id: restaurantId,
              paddle_transaction_id: data?.id,
              amount: item?.totals?.total ? Number(item.totals.total) / 100 : null,
              currency: data?.currency_code || 'USD',
              type: dbType,
              status: 'completed',
            })

            if (paymentInsertError) {
              console.error(
                'transaction.completed: failed to insert payment row for line item',
                item?.id,
                'transaction',
                data?.id,
                paymentInsertError
              )
            }
          } catch (itemErr) {
            console.error(
              'transaction.completed: unexpected error inserting payment for line item',
              item?.id,
              'transaction',
              data?.id,
              itemErr
            )
          }
        }
        break
      }

      case 'transaction.payment_failed': {
        const userId = customData?.user_id
        console.error('Paddle payment failed — user:', userId, 'transaction:', data?.id)
        break
      }

      case 'subscription.canceled': {
        const subscriptionId = data?.id
        if (subscriptionId) {
          await admin
            .from('restaurants')
            .update({ subscription_status: 'canceled' })
            .eq('paddle_subscription_id', subscriptionId)
        }
        break
      }

      case 'subscription.updated': {
        const subscriptionId = data?.id
        const status = data?.status
        if (subscriptionId && status) {
          await admin
            .from('restaurants')
            .update({ subscription_status: status })
            .eq('paddle_subscription_id', subscriptionId)
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Error processing Paddle webhook:', err)
  }

  return NextResponse.json({ success: true }, { status: 200 })
}