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

  // 🔹 ✅ UTILISE getUser() — PAS getSession()
  const { data : { user }, error } = await supabase.auth.getUser();

  // 🔹 Log sécurisé en développement
  if (process.env.NODE_ENV === 'development' && user) {
    const { data : profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const role = profile?.role || 'user';

    console.log('✅ Session active (middleware):', {
      user_id: user.id,
      email: user.email,
      role,
    });
  }

  // 🔹 PROTECTION DES ROUTES DASHBOARD
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
    
    // Vérifie que le profil existe ET est complet
    const { data : profile } = await supabase
      .from('profiles')
      .select('onboarding_done')
      .eq('id', user.id)
      .single();

    if (!profile || profile.onboarding_done !== true) {
      return NextResponse.redirect(new URL('/complete-profile', request.url));
    }
  }

  // 🔹 PROTECTION DE LA PAGE DE COMPLÉTION
  if (request.nextUrl.pathname === '/complete-profile') {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
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