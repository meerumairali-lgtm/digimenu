import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Returns true for loopback, private (RFC1918), and link-local addresses —
// none of these are real public IPs, so geolocation lookups on them fail.
function isReservedIP(ip: string): boolean {
  if (!ip) return true
  if (ip === '::1' || ip === '127.0.0.1') return true
  if (ip.startsWith('192.168.')) return true
  if (ip.startsWith('10.')) return true
  if (ip.startsWith('169.254.')) return true
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true // IPv6 private range

  // 172.16.0.0 – 172.31.255.255
  const match = ip.match(/^172\.(\d+)\./)
  if (match) {
    const secondOctet = parseInt(match[1], 10)
    if (secondOctet >= 16 && secondOctet <= 31) return true
  }

  return false
}

// Detects the visitor's country server-side using their real IP via
// ipapi.co. Always returns 200 with null fields on failure so the
// frontend can gracefully fall back to manual selection.
export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const rawIp = forwarded ? forwarded.split(',')[0].trim() : null

    // In local dev (or if no usable IP is found), rawIp will be a
    // reserved address — skip it and let ipapi.co use this server's
    // own outbound connection instead.
    const useIp = rawIp && !isReservedIP(rawIp) ? rawIp : null
    const url = useIp ? `https://ipapi.co/${useIp}/json/` : `https://ipapi.co/json/`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Menuberg/1.0' },
    })

    if (!res.ok) {
      throw new Error(`ipapi request failed: ${res.status}`)
    }

    const data = await res.json()

    if (data.error) {
      throw new Error(data.reason || 'ipapi returned an error')
    }

    return NextResponse.json({
      country_code: data.country_code || null,
      country_name: data.country_name || null,
    })
  } catch (err) {
    console.error('detect-country error:', err)
    return NextResponse.json({ country_code: null, country_name: null }, { status: 200 })
  }
}