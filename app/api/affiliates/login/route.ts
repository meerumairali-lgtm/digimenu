import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: affiliate, error } = await admin
      .from('affiliates')
      .select('id, name, username, password_hash, current_rank, profile_completed, payment_suspended')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle()

    if (error || !affiliate) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, affiliate.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    // Set a simple session cookie — affiliate ID + username signed together
    const cookieStore = await cookies()
    cookieStore.set('affiliate_session', JSON.stringify({
      id: affiliate.id,
      username: affiliate.username,
      name: affiliate.name,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        username: affiliate.username,
        current_rank: affiliate.current_rank,
        profile_completed: affiliate.profile_completed,
        payment_suspended: affiliate.payment_suspended,
      }
    }, { status: 200 })
  } catch (err) {
    console.error('affiliates/login error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}