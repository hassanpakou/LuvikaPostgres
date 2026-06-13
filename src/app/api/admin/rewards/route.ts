// src/app/api/admin/rewards/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Utilise le client Supabase standard avec la service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, email, avatar_url, scans_count, plan, badges, created_at')
      .gte('scans_count', 10000)
      .order('scans_count', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data || [] });
  } catch (err: any) {
    console.error('❌ Fatal:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}