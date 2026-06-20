import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

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

  console.log('Paddle webhook received:', eventType)
  console.log('Full payload:', JSON.stringify(data, null, 2))

  return NextResponse.json({ success: true }, { status: 200 })
}