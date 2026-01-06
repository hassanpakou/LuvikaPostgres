// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClientForPage() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (name && value !== undefined) {
                cookieStore.set({ name, value, ...options });
              }
            });
          } catch (error) {
            // Ignore in Server Components (only setAll in Route Handlers)
            if (process.env.NODE_ENV === 'development') {
              console.warn('🍪 setAll ignored in Server Component (safe)');
            }
          }
        },
      },
    }
  );
}

// ✅ Identique — on réutilise la même logique partout
export const createClientForAction = createClientForPage;

export const auth = {
  async getUser() {
    const supabase = await createClientForPage();
    return supabase.auth.getUser();
  },
};