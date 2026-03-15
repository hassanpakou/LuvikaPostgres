import { generateRegistrationOptions } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options })
            );
          },
        },
      }
    );

    // 1. Vérifier l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    // 2. Récupérer les identifiants existants pour les exclure
    const { data: existingCredentials } = await supabase
      .from('biometric_credentials')
      .select('credential_id, device_type') // On récupère aussi device_type si besoin
      .eq('user_id', user.id)
      .eq('is_active', true);

    // 🔹 CORRECTION ICI : Cast explicite des transports
    const excludeCredentials = existingCredentials?.map((cred) => ({
      id: cred.credential_id,
      type: 'public-key' as const,
      // On cast le tableau de string vers le type attendu par simplewebauthn
      transports: ['internal', 'hybrid'] as AuthenticatorTransportFuture[], 
    })) || [];

    // 3. Générer les options
    const options = await generateRegistrationOptions({
      rpName: 'LUVIKA',
      rpID: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').hostname,
      userID: userIdBytes, // Assurez-vous d'utiliser la variable convertie (Uint8Array)
      userName: user.email || '',
      attestationType: 'none',
      excludeCredentials, // ✅ Maintenant compatible
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });
    // 4. Stocker le challenge temporairement dans un cookie sécurisé
    cookieStore.set('webauthn_challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300,
      path: '/',
    });

    return NextResponse.json({ options });
  } catch (error) {
    console.error('Registration init error:', error);
    return NextResponse.json({ error: 'Échec initialisation' }, { status: 500 });
  }
}
