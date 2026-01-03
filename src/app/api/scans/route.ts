// src/app/api/scans/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const { profile_id, scan_type } = await request.json();

  if (!profile_id || !scan_type) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  try {
    // 🔹 ✅ RGPD : anonymise l'IP (hash + troncature) — optionnel
    let anonymizedIp = null;
const headersList = await headers();
let ip = headersList.get('x-real-ip') || 
         headersList.get('x-forwarded-for')?.split(',')[0] || 
         '127.0.0.1';

// 🔹 Nettoie l'IP
ip = ip.trim().replace(/[^0-9a-f.:]/g, '');
if (!ip || ip === '::1' || ip === '127.0.0.1') ip = '0.0.0.0';    if (ip && ip !== '0.0.0.0') {
      // Hash + 8 premiers chars → impossible à reverse, mais groupable
      const hash = require('crypto').createHash('sha256').update(ip).digest('hex');
      anonymizedIp = hash.substring(0, 8);
    }

    // 🔹 ✅ Insère le scan
    const { error } = await supabase
      .from('scans')
      .insert({
        id: uuidv4(),
        profile_id,
        scan_type,
        ip_anonymized: anonymizedIp, // ✅ stocké, non identifiable
        created_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Scan logging error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}