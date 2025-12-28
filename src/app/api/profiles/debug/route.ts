import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // Get all profiles with more details
  const { data: profiles, error, count } = await supabase
    .from('profiles')
    .select('id, username, full_name, email, created_at, role, plan, onboarding_done', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ 
      error: 'Erreur base de données', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }

  // Check auth.users table to see if there are registered users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  return NextResponse.json({
    diagnostics: {
      total_profiles: count,
      total_auth_users: authUsers?.users?.length || 0,
      database_connected: true,
      timestamp: new Date().toISOString()
    },
    profiles_table: {
      count: count,
      sample_data: profiles || [],
      usernames: profiles?.map(p => p.username) || []
    },
    auth_users: {
      count: authUsers?.users?.length || 0,
      note: authError ? "Impossible d'accéder aux utilisateurs auth (permissions)" : "OK",
      sample_emails: authUsers?.users?.slice(0, 5).map(u => u.email) || []
    },
    next_steps: count === 0 ? [
      "1. Créez un compte utilisateur via votre interface d'inscription",
      "2. Ou insérez des données de test via Supabase Dashboard",
      "3. SQL: INSERT INTO profiles (id, username, full_name, email) VALUES (gen_random_uuid(), 'testuser', 'Test User', 'test@example.com')"
    ] : []
  });
}