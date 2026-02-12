import { NextRequest, NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
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
    const challengeBase64 = (await cookieStore).get('biometric_auth_challenge')?.value;

    if (!challengeBase64) {
      return NextResponse.json({ error: 'Challenge expired' }, { status: 400 });
    }

    const expectedChallenge = challengeBase64;

    const { data: creds, error: fetchError } = await supabase
      .from('biometric_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('credential_id', body.id)
      .eq('is_active', true)
      .single();

    if (fetchError || !creds) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    const rpID = getRpId();

    const verification = await verifyAuthenticationResponse({
      response: {
        id: body.id,
        rawId: body.rawId,
        response: {
          clientDataJSON: body.response.clientDataJSON,
          authenticatorData: body.response.authenticatorData,
          signature: body.response.signature,
          userHandle: body.response.userHandle,
        },
        type: body.type,
        clientExtensionResults: body.clientExtensionResults || {},
      },
      expectedChallenge,
      expectedOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      expectedRPID: rpID,
      // @ts-ignore - La propriété 'authenticator' est supportée par l'API réelle
      authenticator: {
        credentialID: creds.credential_id,
        credentialPublicKey: Buffer.from(creds.public_key).toString('base64'),
        counter: creds.sign_count,
        transports: ['internal'],
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const authenticationInfo = verification.authenticationInfo;
    
    if (!authenticationInfo) {
      return NextResponse.json({ error: 'Authentication info missing' }, { status: 400 });
    }

    await supabase
      .from('biometric_credentials')
      .update({ 
        sign_count: authenticationInfo.newCounter ?? creds.sign_count,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', creds.id);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    const response = NextResponse.json({ 
      success: true,
      message: 'Authenticated successfully',
      session: {
        access_token: session?.access_token,
        expires_at: session?.expires_at,
      }
    });
    
    response.cookies.delete('biometric_auth_challenge');
    return response;
  } catch (error: any) {
    console.error('❌ Biometric auth verify error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 401 });
  }
}