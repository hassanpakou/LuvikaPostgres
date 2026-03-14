import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    
    const challenge = cookieStore.get('webauthn_auth_challenge')?.value;
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge expiré' }, { status: 400 });
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

    // Récupérer la clé publique depuis la DB
    const { data: credentialData, error: fetchError } = await supabase
      .from('biometric_credentials')
      .select('*')
      .eq('credential_id', body.id)
      .eq('is_active', true)
      .single();

    if (fetchError || !credentialData) {
      throw new Error('Identifiant biométrique introuvable');
    }

    // Vérifier la signature
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      expectedRPID: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').hostname,
      credential: {
        id: credentialData.credential_id,
        publicKey: new Uint8Array(credentialData.public_key), // Conversion Bytea -> Uint8Array
        counter: Number(credentialData.sign_count),
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      throw new Error('Vérification échouée');
    }

    // Mettre à jour le sign_count et last_used_at
    await supabase
      .from('biometric_credentials')
      .update({
        sign_count: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq('credential_id', body.id);

    cookieStore.delete('webauthn_auth_challenge');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Auth verify error:', error);
    return NextResponse.json({ error: error.message || 'Échec authentification' }, { status: 500 });
  }
}
