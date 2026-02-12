import { NextRequest, NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import { getRpId } from '@/src/lib/webauthn/utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientForPage();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const cookieStore = await cookies();
    const challengeBase64 = (await cookieStore).get('biometric_challenge')?.value;

    if (!challengeBase64) {
      return NextResponse.json({ error: 'Challenge expired' }, { status: 400 });
    }

    const expectedChallenge = challengeBase64;
    const rpID = getRpId();

    // ✅ CORRECTION : Les données du client sont DÉJÀ en base64, pas besoin de Buffer.from()
    const verification = await verifyRegistrationResponse({
      response: {
        id: body.id,
        rawId: body.rawId, // ✅ Déjà string base64 (envoyé par le client via btoa())
        response: {
          clientDataJSON: body.response.clientDataJSON, // ✅ Déjà string base64
          attestationObject: body.response.attestationObject, // ✅ Déjà string base64
        },
        type: body.type,
        clientExtensionResults: body.clientExtensionResults || {},
      },
      expectedChallenge,
      expectedOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    if (!verification.verified) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    const registrationInfo = verification.registrationInfo as any;
    
    if (!registrationInfo) {
      return NextResponse.json({ error: 'Registration info missing' }, { status: 400 });
    }

    const signCount = registrationInfo.credential?.counter || registrationInfo.counter || 0;

    const { error: insertError } = await supabase
      .from('biometric_credentials')
      .insert({
        user_id: user.id,
        credential_id: body.id,
        public_key: Buffer.from(registrationInfo.credential.publicKey).toString('base64'),
        sign_count: signCount,
        device_type: 'platform',
        display_name: `Appareil de ${user.email?.split('@')[0] || 'utilisateur'}`,
      });

    if (insertError) throw insertError;

    const response = NextResponse.json({ success: true });
    response.cookies.delete('biometric_challenge');
    return response;
  } catch (error: any) {
    console.error('❌ Biometric register verify error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}