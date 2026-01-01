// src/app/api/events/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 🔹 1. Initialisation Supabase — ce qu'il faut ici :
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

  // 🔹 2. Authentification
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 🔹 3. Vérification du plan (optionnel mais recommandé)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = profile?.plan || 'freemium';
  if (plan === 'freemium' || plan === 'basic') {
    return NextResponse.json(
      { error: 'Fonctionnalité réservée aux abonnements Premium et Entreprise' },
      { status: 403 }
    );
  }

  // 🔹 4. Lecture du body
  const { name, description, location, starts_at, ends_at } = await request.json();

  if (!name || !starts_at || !ends_at) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  // 🔹 5. Génération QR code ID unique
  const qrCodeId = `evt_${nanoid(6).toLowerCase()}`;

  // 🔹 6. Insertion
  const { data, error } = await supabase
    .from('events')
    .insert({
      profile_id: user.id,
      name,
      description: description || null,
      location: location || null,
      starts_at,
      ends_at,
      qr_code_id: qrCodeId,
    })
    .select('id, name, qr_code_id, starts_at, ends_at')
    .single();

  if (error) {
    console.error('❌ Échec création événement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}