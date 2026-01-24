import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const cookieStore = request.cookies

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          response.cookies.delete({ name, ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // 🔐 Protection dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}