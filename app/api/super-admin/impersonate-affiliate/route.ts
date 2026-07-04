import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { affiliate_id } = await request.json()
    if (!affiliate_id) {
      return NextResponse.json({ error: 'Missing affiliate_id' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: affiliate } = await admin
      .from('affiliates')
      .select('id, name, username, current_rank, profile_completed, payment_suspended')
      .eq('id', affiliate_id)
      .single()

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
    }

    const cookieStore = await cookies()

    // Store the real admin return path before overwriting session
    cookieStore.set('affiliate_impersonating', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/',
    })

    // Set affiliate session exactly as login would
    cookieStore.set('affiliate_session', JSON.stringify({
      id: affiliate.id,
      username: affiliate.username,
      name: affiliate.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2,
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('impersonate-affiliate error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('affiliate_session')
    cookieStore.delete('affiliate_impersonating')
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}