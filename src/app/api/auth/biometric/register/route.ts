import { NextRequest, NextResponse } from 'next/server';
import { createClientForPage } from '@/src/lib/supabase/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';

// ✅ Helper pour nettoyer le RP ID
function getCleanRpId(): string {
  const rawRpId = process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID || 'localhost';
  return rawRpId
    .replace(/^https?:\/\//, '') // Supprime http:// ou https://
    .replace(/:\d+$/, '')        // Supprime le port (:3000)
    .replace(/\/$/, '')          // Supprime le slash final
    .trim();                     // Supprime les espaces
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientForPage();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer les credentials existants pour exclusion
    const { data: existingCreds, error: fetchError } = await supabase
      .from('biometric_credentials')
      .select('credential_id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (fetchError) throw fetchError;

    // ✅ RP ID nettoyé
    const rpID = getCleanRpId();

    // 🔍 Debug en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Register - RP ID:', rpID);
      console.log('🔐 Register - User ID:', user.id);
    }

    // Options d'enregistrement
    const options = await generateRegistrationOptions({
      rpName: 'LUVIKA',
      rpID,
      userID: Uint8Array.from(user.id, c => c.charCodeAt(0)),
      userName: user.email || user.id,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: existingCreds.map(cred => ({
        id: cred.credential_id,
        transports: ['internal'] as const,
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        requireResidentKey: true,
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    });

    const challengeBase64 = Buffer.from(options.challenge).toString('base64');
    
    const response = NextResponse.json({ 
      options: {
        ...options,
        challenge: challengeBase64,
        user: {
          ...options.user,
          id: Buffer.from(options.user.id).toString('base64'),
        },
      }
    });
    
    response.cookies.set('biometric_challenge', challengeBase64, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300, // 5 minutes
      path: '/',
      sameSite: 'strict',
    });

    return response;
  } catch (error: any) {
    console.error('❌ Biometric register init error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to init registration' 
    }, { status: 500 });
  }
}