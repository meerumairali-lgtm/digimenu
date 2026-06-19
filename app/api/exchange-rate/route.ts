import { NextResponse } from 'next/server'
import { getUsdExchangeRates } from '@/lib/currency'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rates = await getUsdExchangeRates()
  return NextResponse.json({ rates })
}