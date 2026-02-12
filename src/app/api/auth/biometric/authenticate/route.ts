import { NextRequest, NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';

// ✅ Helper pour nettoyer le RP ID
function getCleanRpId(): string {
  const rawRpId = process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID || 'localhost';
  return rawRpId
    .replace(/^https?:\/\//, '')
    .replace(/:\d+$/, '')
    .replace(/\/$/, '')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientForPage();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer les credentials actifs
    const { data: creds, error: fetchError } = await supabase
      .from('biometric_credentials')
      .select('credential_id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (fetchError) throw fetchError;

    if (creds.length === 0) {
      return NextResponse.json({ 
        error: 'No biometric credentials found' 
      }, { status: 404 });
    }

    // ✅ RP ID nettoyé
    const rpID = getCleanRpId();

    // 🔍 Debug en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Authenticate - RP ID:', rpID);
      console.log('🔐 Authenticate - Credentials count:', creds.length);
    }

    // Options d'authentification
    const options = await generateAuthenticationOptions({
      rpID,
      timeout: 60000,
      userVerification: 'required',
      allowCredentials: creds.map(cred => ({
        id: cred.credential_id, // ✅ Déjà en string base64
        transports: ['internal'] as const,
      })),
    });

    const challengeBase64 = Buffer.from(options.challenge).toString('base64');
    
    const response = NextResponse.json({ 
      options: {
        ...options,
        challenge: challengeBase64,
        // ✅ Pas besoin de mapper allowCredentials, déjà en string
      }
    });
    
    response.cookies.set('biometric_auth_challenge', challengeBase64, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300, // 5 minutes
      path: '/',
      sameSite: 'strict',
    });

    return response;
  } catch (error: any) {
    console.error('❌ Biometric auth init error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to init authentication' 
    }, { status: 500 });
  }
}