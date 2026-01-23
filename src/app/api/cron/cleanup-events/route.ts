// src/app/api/cron/cleanup-events/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // ✅ Utilise createClient (pas createServerClient)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ Important : utilise la clé service
  );

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('events')
    .delete()
    .lt('ends_at', fourteenDaysAgo);

  if (error) {
    console.error('❌ Auto-delete failed:', error);
    return new NextResponse('Error', { status: 500 });
  }

  console.log('✅ Old events cleaned up');
  return new NextResponse('OK', { status: 200 });
}