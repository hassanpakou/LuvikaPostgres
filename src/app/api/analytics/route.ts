// src/app/api/analytics/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'week'; // week | month
  const profileId = searchParams.get('profile_id');

  if (!profileId) {
    return NextResponse.json({ error: 'profile_id required' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - (range === 'month' ? 30 : 7));

  try {
    // 🔹 1. Évolution quotidienne
    const { data : daily } = await supabase.rpc('get_daily_scan_counts', {
      p_profile_id: profileId,
      p_start_date: startDate.toISOString(),
    });

    // 🔹 2. Répartition QR vs NFC
    const { data : qrNfc } = await supabase.rpc('get_qr_nfc_distribution', {
      p_profile_id: profileId,
      p_start_date: startDate.toISOString(),
    });

    // 🔹 3. Top 5 IP anonymisées (si activé)
    const { data : topIps } = await supabase.rpc('get_top_anonymized_ips', {
      p_profile_id: profileId,
      p_start_date: startDate.toISOString(),
    });

    return NextResponse.json({
      daily: daily || [],
      qrNfc: qrNfc?.[0] || { qr_count: 0, nfc_count: 0, total: 0 },
      topIps: topIps || [],
    });
  } catch (error: any) {
    console.error('❌ Analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}