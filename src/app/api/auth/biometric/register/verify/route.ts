import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    
    // Récupérer le challenge stocké
    const challenge = cookieStore.get('webauthn_challenge')?.value;
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge expiré ou manquant' }, { status: 400 });
    }

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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier la réponse cryptographique
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      expectedRPID: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').hostname,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error('Vérification échouée');
    }

    const { credential, aaguid } = verification.registrationInfo;

    // Déterminer le type d'appareil
    const deviceType = aaguid ? 'cross-platform' : 'platform'; 
    const displayName = deviceType === 'platform' ? 'Appareil local (FaceID/TouchID)' : 'Clé de sécurité';

    // Sauvegarder dans la table biometric_credentials
    const { error: insertError } = await supabase.from('biometric_credentials').insert({
      user_id: user.id,
      credential_id: credential.id,
      public_key: Buffer.from(credential.publicKey), // Bytea
      sign_count: credential.counter,
      device_type: deviceType,
      display_name: displayName,
      is_active: true,
    });

    if (insertError) throw insertError;

    // Nettoyer le cookie challenge
    cookieStore.delete('webauthn_challenge');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Registration verify error:', error);
    return NextResponse.json({ error: error.message || 'Échec vérification' }, { status: 500 });
  }
}
