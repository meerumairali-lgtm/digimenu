import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { user_id, referral_code } = await request.json()

    if (!user_id || !referral_code) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Look up the affiliate by username (which is the referral code)
    const { data: affiliate } = await admin
      .from('affiliates')
      .select('id, username')
      .eq('username', referral_code.toLowerCase().trim())
      .maybeSingle()

    if (!affiliate) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 })
    }

    // Store on pending_signups so it carries through to restaurant setup
    const { error } = await admin
      .from('pending_signups')
      .update({
        referral_code: affiliate.username,
        referred_by: affiliate.id,
      })
      .eq('user_id', user_id)

    if (error) {
      console.error('resolve-referral: update failed', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, affiliate_username: affiliate.username })
  } catch (err) {
    console.error('resolve-referral error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}