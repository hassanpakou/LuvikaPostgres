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
    // ✅ await obligatoire ici
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: any) { cookieStore.delete({ name, ...options }); },
        },
      }
    );

    // ✅ Typage explicite + gestion d’erreur
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user; // ✅ user peut être undefined

    const body = await req.json();
    const parsed = ScanSchema.parse(body);

    // 🌐 Récupération IP robuste
let ip = '127.0.0.1'; // req.ip n’existe pas → initialise à localhost
    if (req.headers.has('x-forwarded-for')) {
      ip = (req.headers.get('x-forwarded-for') as string).split(',')[0].trim();
    } else if (req.headers.has('x-real-ip')) {
      ip = req.headers.get('x-real-ip')!;
    }

    // ✅ Insertion sécurisée
    const { error: insertError } = await supabase.from('scans').insert({
      profile_id: parsed.profile_id,
      scanner_id: user?.id || null, // anonyme autorisé
      scanner_ip: ip,
      scanner_device: parsed.scanner_device || null,
      scanner_os: parsed.scanner_os || null,
      scanner_browser: parsed.scanner_browser || null,
      scan_type: parsed.scan_type,
      event_id: parsed.event_id || null,
    });

    if (insertError) {
      console.error('Erreur insertion scan:', insertError);
      return NextResponse.json(
        { success: false, error: 'Échec de l’enregistrement' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Scan enregistré' },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Erreur API /scans:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}