import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const cookieStore = request.cookies;
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.delete({ name, ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Rediriger /events/* vers /fr/events/* (default locale)
  if (path.startsWith('/events/')) {
    return NextResponse.redirect(new URL(path.replace('/events/', '/fr/events/'), request.url));
  }

  // Routes protégées : si pas connecté → redirection
  if (!user && (path.startsWith('/dashboard') || path === '/complete-profile')) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  // Vérifie le profil et onboarding
  if (user && path.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_done')
      .eq('id', user.id)
      .single();

    if (!profile || profile.onboarding_done !== true) {
      return NextResponse.redirect(new URL('/complete-profile', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/complete-profile',
  ],
};