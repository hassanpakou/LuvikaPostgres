// src/app/api/auth/check-email/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );

  const { email } = await req.json();

  // ✅ Vérifie dans `profiles` (table publique + RLS safe)
const {  count } = await supabase
  .from('profiles')
  .select('*', { count: 'exact', head: true })
  .eq('email', email);

  return NextResponse.json({ exists: (count || 0) > 0 });
}