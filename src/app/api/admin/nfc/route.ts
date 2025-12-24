// src/app/api/admin/nfc/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { 
          cookieStore.set({ name, value, ...options }); // ✅ { name, value, ...options }
        },
        remove(name, options) { 
          cookieStore.delete({ name, ...options }); // ✅ { name, ...options }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { data: cards, error } = await supabase
    .from('nfc_cards')
    .select(`
      *,
      profiles!inner (id, full_name, username, email)
    `)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(cards);
}