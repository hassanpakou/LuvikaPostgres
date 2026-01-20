// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient(supabaseKey?: string) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}