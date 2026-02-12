import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // 🔑 Récupérer les cookies pour l'authentification
    const cookieStore = await cookies();
    
    // ✅ Initialiser Supabase avec les cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );
    
    // 🔐 Récupérer l'utilisateur authentifié
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 🔍 Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'unread';
    
    // 📊 Construire la requête
    let query = supabase
      .from('contact_requests')
      .select('id', { count: 'exact' })
      .eq('profile_id', user.id);
    
    if (status === 'unread') {
      query = query.is('read_at', null);
    }
    
    const { count, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('❌ Error fetching messages count:', error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}

// POST endpoint to handle return action
export async function POST(request: NextRequest) {
  try {
    // 🔑 Récupérer les cookies pour l'authentification
    const cookieStore = await cookies();
    
    // ✅ Initialiser Supabase avec les cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );
    
    // 🔐 Récupérer l'utilisateur authentifié
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 🔍 Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'return') {
      return NextResponse.json({ success: true, redirect: '/dashboard' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('❌ Error handling return action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
