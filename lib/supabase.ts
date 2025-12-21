// src/lib/supabase.ts
// Client Supabase sécurisé pour Next.js (App Router)
// Fonctionne côté client ET serveur (grâce à createClient)

import { createClient } from '@supabase/supabase-js';

// Récupère les variables d'environnement (safe : NEXT_PUBLIC_ = exposé côté client)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Création du client Supabase
// ⚠️ Ce client est "public" (anon) → les permissions dépendent de RLS !
export const supabase = createClient(supabaseUrl, supabaseAnonKey);