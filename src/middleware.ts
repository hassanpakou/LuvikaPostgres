// src/middleware.ts
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
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { response.cookies.set({ name, value, ...options }); },
        remove(name, options) { response.cookies.delete({ name, ...options }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // ✅ Routes publiques : toujours accessibles
  const publicPaths = ['/auth/sign-in', '/auth/sign-up', '/auth/forgot-password', '/auth/callback', '/auth/error', '/', '/privacy', '/terms', '/cookies', '/contact'];
  const isPublicPath = publicPaths.some(p => path === p || path.startsWith(p + '/'));
  
  if (isPublicPath) {
    return response;
  }

  // ✅ Routes protégées : si pas connecté → redirection vers sign-in
  const protectedPaths = ['/dashboard', '/admin', '/complete-profile'];
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));

  if (isProtectedPath && !user) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('redirect', path); // ✅ Sauvegarde la page demandée
    return NextResponse.redirect(signInUrl);
  }

  // ✅ Vérification onboarding pour dashboard
  if (user && path.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_done')
      .eq('id', user.id)
      .single();

    if (!profile || profile.onboarding_done !== true) {
      // Ne pas rediriger si on est déjà sur complete-profile
      if (path !== '/complete-profile') {
        return NextResponse.redirect(new URL('/complete-profile', request.url));
      }
    }
  }

  // ✅ Redirection events vers locale par défaut
  if (path.startsWith('/events/')) {
    return NextResponse.redirect(new URL(path.replace('/events/', '/fr/events/'), request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|api|static|.*\\..*|favicon.ico|sw.js).*)',
  ],
};