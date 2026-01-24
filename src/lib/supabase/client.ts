// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

// ✅ Client anonyme (pour le frontend)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ✅ Client admin (à utiliser uniquement côté serveur)
export function createAdminClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}