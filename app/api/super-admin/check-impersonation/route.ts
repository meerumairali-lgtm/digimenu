import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const impersonating = cookieStore.get('affiliate_impersonating')
  return NextResponse.json({ impersonating: !!impersonating })
}