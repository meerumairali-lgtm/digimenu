import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { restaurant_id, paddle_customer_id } = await request.json()

    if (!restaurant_id || !paddle_customer_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { error } = await admin
      .from('payments')
      .update({ restaurant_id })
      .is('restaurant_id', null)
      .eq('paddle_customer_id', paddle_customer_id)

    if (error) {
      console.error('backfill-payments: update failed', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('backfill-payments: unexpected error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}