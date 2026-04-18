//api/auth/biometric/register/route.ts
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getRpId, getOrigin } from '@/src/lib/webauthn/utils';

// ✅ CORRECTION : Définir le type localement pour éviter l'erreur d'import
type AuthenticatorTransportFuture = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'usb';

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
      .select('credential_id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    // ✅ Utilisation du type local ici pour le cast
    const excludeCredentials = existingCredentials?.map((cred) => ({
      id: cred.credential_id,
      type: 'public-key' as const,
      transports: ['internal', 'hybrid'] as AuthenticatorTransportFuture[], 
    })) || [];

    // 3. Générer les options
    const options = await generateRegistrationOptions({
      rpName: 'LUVIKA',
      rpID: getRpId(),                 // ✅ Utilisation de la fonction
      userID: new TextEncoder().encode(user.id),
      userName: user.email || '',
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });

    // 4. Stocker le challenge temporairement
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
