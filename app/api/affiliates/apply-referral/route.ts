import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const referralCookie = cookieStore.get('menuberg_referral')

    if (!referralCookie) {
      return NextResponse.json({ referral: null })
    }

    const referral = JSON.parse(referralCookie.value)
    return NextResponse.json({ referral })
  } catch {
    return NextResponse.json({ referral: null })
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('menuberg_referral')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}