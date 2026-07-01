import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('affiliate_session')
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = JSON.parse(session.value)
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword?.trim() || !newPassword?.trim()) {
      return NextResponse.json({ error: 'Both fields required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: affiliate } = await admin
      .from('affiliates')
      .select('password_hash')
      .eq('id', id)
      .single()

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
    }

    const valid = await bcrypt.compare(currentPassword, affiliate.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await admin
      .from('affiliates')
      .update({ password_hash: newHash })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('change-password error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}