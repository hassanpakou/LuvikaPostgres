// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ✅ Pour les Server Components (pages, layouts) — READ-ONLY
export async function createClientForPage() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ✅ SEULEMENT `get` — lecture seule, autorisée dans les pages
        get(name) {
          return cookieStore.get(name)?.value;
        },
        // ❌ `set` et `remove` supprimés → interdits dans les pages
      },
    }
  );
}

// ✅ Pour les Route Handlers & Server Actions — FULL ACCESS
export async function createClientForAction() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );
}

// ✅ Helper pratique pour l’auth (lecture seule)
export const auth = {
  async getUser() {
    const supabase = await createClientForPage();
    return supabase.auth.getUser();
  },
};