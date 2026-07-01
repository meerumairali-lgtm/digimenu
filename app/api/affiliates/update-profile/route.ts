import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('affiliate_session')
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = JSON.parse(session.value)
    const body = await request.json()

    const {
      email, phone, address, city, age,
      bank_name, bank_account_number, bank_account_title, cnic,
    } = body

    if (!email?.trim() || !phone?.trim() || !address?.trim() ||
      !city?.trim() || !age || !bank_name?.trim() ||
      !bank_account_number?.trim() || !bank_account_title?.trim() || !cnic?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { error } = await admin
      .from('affiliates')
      .update({
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        age: parseInt(age),
        bank_name: bank_name.trim(),
        bank_account_number: bank_account_number.trim(),
        bank_account_title: bank_account_title.trim(),
        cnic: cnic.trim(),
        profile_completed: true,
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('update-profile error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}