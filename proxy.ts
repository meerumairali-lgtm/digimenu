import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'
const RESERVED_SUBDOMAINS = ['www', 'dashboard', 'admin']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  // ---------- Supabase ----------
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          response = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ---------- Auth Protection ----------

  if (pathname.startsWith('/super-admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  }

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  }

  if (pathname === '/login' || pathname === '/signup') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // ---------- Subdomain Routing ----------

  const hostname = request.headers.get('host') || ''
  const host = hostname.split(':')[0]

  if (host.endsWith('menuberg.com')) {
    const parts = host.split('.')
    const isSubdomain = parts.length > 2

    if (isSubdomain) {
      const subdomain = parts[0]

      if (!RESERVED_SUBDOMAINS.includes(subdomain)) {
        const url = request.nextUrl.clone()

        url.pathname = `/${subdomain}${
          url.pathname === '/' ? '' : url.pathname
        }`

        return NextResponse.rewrite(url)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export default proxy