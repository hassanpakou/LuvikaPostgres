// src/app/api/scans/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ScanSchema = z.object({
  profile_id: z.string().uuid(),
  scan_type: z.enum(['nfc', 'qr_profile', 'qr_event']),
  event_id: z.string().uuid().optional(),
  scanner_device: z.string().optional(),
  scanner_os: z.string().optional(),
  scanner_browser: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value; },
          set(name, value, options) { cookieStore.set({ name, value, ...options }); },
          remove(name, options) { cookieStore.delete({ name, ...options }); },
        },
      }
    );

    const sessionResult = await supabase.auth.getSession();
    const session = sessionResult.data.session;

    const body = await req.json();
    const parsed = ScanSchema.parse(body);

    // 🌐 IP fiable (Vercel + localhost)
    let ip = '0.0.0.0';
    const xff = req.headers.get('x-forwarded-for');
    if (xff) {
      ip = xff.split(',')[0].trim();
    } else if (req.headers.has('x-real-ip')) {
      ip = req.headers.get('x-real-ip')!;
    } else {
      ip = '127.0.0.1';
    }

    // ✅ Insertion sécurisée
    const insertRes = await supabase
      .from('scans')
      .insert({
        profile_id: parsed.profile_id,
        scanner_id: session?.user.id || null,
        scanner_ip: ip,
        scanner_device: parsed.scanner_device,
        scanner_os: parsed.scanner_os,
        scanner_browser: parsed.scanner_browser,
        scan_type: parsed.scan_type,
        event_id: parsed.event_id || null,
      });

    if (insertRes.error) throw insertRes.error;

    return NextResponse.json(
      { success: true, message: 'Scan enregistré' },
      { status: 201 }
    );

  } catch (err: any) {
    console.error('Erreur API /scans:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur inconnue' },
      { status: 400 }
    );
  }
}