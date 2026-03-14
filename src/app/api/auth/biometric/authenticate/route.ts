import { generateAuthenticationOptions } from '@simplewebauthn/server';
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

    // Optionnel : Si l'utilisateur est déjà connecté, on peut pré-remplir, 
    // mais souvent on fait cela sur une page de login publique.
    // Ici, on suppose qu'on cherche les clés pour un utilisateur potentiellement non connecté 
    // OU on utilise l'ID si déjà connecté pour restreindre.
    
    // Pour simplifier dans votre contexte (déjà connecté dans settings) :
    const { data: { user } } = await supabase.auth.getUser();
    
    let allowCredentials = [];
    if (user) {
      const { data } = await supabase
        .from('biometric_credentials')
        .select('credential_id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (data) {
        allowCredentials = data.map(cred => ({
          id: cred.credential_id,
          type: 'public-key' as const,
        }));
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').hostname,
      allowCredentials,
      userVerification: 'preferred',
    });

    // Stocker le challenge
    cookieStore.set('webauthn_auth_challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300,
      path: '/',
    });

    return NextResponse.json({ options });
  } catch (error) {
    console.error('Auth init error:', error);
    return NextResponse.json({ error: 'Échec initialisation auth' }, { status: 500 });
  }
}
