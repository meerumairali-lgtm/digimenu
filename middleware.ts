import { NextRequest, NextResponse } from 'next/server'

// Subdomains that are NOT restaurant slugs — these keep their normal routing.
const RESERVED_SUBDOMAINS = ['www', 'dashboard', 'admin']

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Strip port if present (useful for local dev, harmless in production)
  const host = hostname.split(':')[0]

  // Not on menuberg.com at all (e.g. a Vercel preview URL) — leave untouched
  if (!host.endsWith('menuberg.com')) {
    return NextResponse.next()
  }

  const parts = host.split('.')
  // menuberg.com itself has 2 parts; a subdomain has 3+ (sub.menuberg.com)
  const isSubdomain = parts.length > 2

  if (!isSubdomain) {
    // Plain menuberg.com or www.menuberg.com — normal routing (landing page etc.)
    return NextResponse.next()
  }

  const subdomain = parts[0]

  if (RESERVED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.next()
  }

  // Any other subdomain = treat as a restaurant slug.
  // Rewrite restaurant.menuberg.com/  ->  /restaurant  (internally, URL bar unchanged)
  url.pathname = `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes (webhooks, checkout, etc. — must stay untouched)
     * - _next static/image internals
     * - favicon and common static files
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}