import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { referral_code } = await request.json()

    if (!referral_code) {
      return NextResponse.json({ error: 'Missing referral code' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify the referral code actually exists before setting cookie —
    // prevents someone from setting a cookie with a made-up username
    const { data: affiliate } = await admin
      .from('affiliates')
      .select('id, username')
      .eq('username', referral_code.toLowerCase().trim())
      .maybeSingle()

    if (!affiliate) {
      return NextResponse.json({ error: 'Referral code not found' }, { status: 404 })
    }

    // Set HTTP-only cookie — can't be read or modified by JavaScript
    const cookieStore = await cookies()
    cookieStore.set('menuberg_referral', JSON.stringify({
      code: affiliate.username,
      affiliate_id: affiliate.id,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days — survives email confirmation wait
      path: '/',
    })

    return NextResponse.json({ success: true, affiliate_username: affiliate.username })
  } catch (err) {
    console.error('resolve-referral error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}