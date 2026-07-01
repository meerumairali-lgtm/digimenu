import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, username, password } = await request.json()

    if (!name?.trim() || !username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Check username not already taken
    const { data: existing } = await admin
      .from('affiliates')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const { data, error } = await admin
      .from('affiliates')
      .insert({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password_hash,
        current_rank: 'none',
        profile_completed: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ affiliate: data }, { status: 200 })
  } catch (err) {
    console.error('affiliates/create error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}