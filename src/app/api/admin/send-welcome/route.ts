import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend'; // ✅ Utilisation de Resend (déjà configuré pour les matricules)

// ✅ Initialisation sécurisée de Resend
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  // 🔐 CRÉATION SÉCURISÉE DU CLIENT AVEC COOKIES
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 🔐 VÉRIFICATION SÉCURISÉE : getUser() au lieu de getSession()
  const { data : { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // 🔐 VÉRIFICATION RÔLE ADMIN DANS PROFILES (pas dans user_metadata)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // ✅ VÉRIFICATION : L'utilisateur existe dans profiles
    const { data : targetUser } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('email', email)
      .single();

    if (!targetUser) {
      return NextResponse.json({ 
        error: 'Utilisateur introuvable dans la base' 
      }, { status: 404 });
    }

    // ✅ ENVOI EMAIL SÉCURISÉ VIA RESEND (pas inviteUserByEmail !)
    if (!resend) {
      console.error('❌ RESEND_API_KEY manquante dans .env.local');
      return NextResponse.json({ 
        error: 'Service email non configuré - Contactez l\'administrateur' 
      }, { status: 500 });
    }

    const { error: emailError } = await resend.emails.send({
      from: 'LUVIKA <welcome@luvika.me>',
      to: [email],
      subject: '🎉 Bienvenue sur LUVIKA - Votre identité digitale vous attend !',
      html: generateWelcomeEmail(targetUser.full_name || targetUser.username || 'Utilisateur'),
    });

    if (emailError) {
      console.error('❌ Erreur Resend:', emailError);
      return NextResponse.json({ 
        error: `Échec envoi: ${emailError.message}` 
      }, { status: 500 });
    }

    console.log(`✅ Email de bienvenue envoyé à ${email} par admin ${user.id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email de bienvenue envoyé avec succès' 
    });
  } catch (error: any) {
    console.error('❌ Erreur globale envoi welcome email:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur' 
    }, { status: 500 });
  }
}

// 🔑 TEMPLATE EMAIL DE BIENVENUE PROFESSIONNEL
function generateWelcomeEmail(fullName: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur LUVIKA</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <!-- CONTENEUR PRINCIPAL -->
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9, #06b6d4); padding: 40px 30px; text-align: center;">
              <div style="background: white; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <span style="font-size: 32px; font-weight: bold; color: #06b6d4;">L</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">LUVIKA</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Révèle qui tu es</p>
            </td>
          </tr>
          
          <!-- CONTENU -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 15px;">Bonjour ${fullName},</h2>
              <p style="color: #475569; line-height: 1.6; margin: 0 0 25px; font-size: 16px;">
                Bienvenue sur <strong>LUVIKA</strong>, la plateforme qui révèle votre identité digitale unique ! 🌍
              </p>
              
              <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px dashed #f59e0b; border-radius: 16px; padding: 30px; text-align: center; margin: 25px 0; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);">
                <p style="color: #92400e; font-weight: bold; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">Votre voyage commence ici</p>
                <p style="color: #92400e; font-size: 42px; font-weight: 800; letter-spacing: 4px; margin: 0; font-family: monospace;">WELCOME</p>
              </div>
              
              <p style="color: #475569; line-height: 1.6; margin: 0 0 25px; font-size: 16px;">
                Vous faites maintenant partie de la communauté LUVIKA. Voici ce que vous pouvez faire dès maintenant :
              </p>
              
              <ul style="color: #475569; line-height: 1.8; margin: 0 0 30px; padding-left: 20px; font-size: 16px;">
                <li>✨ Créez votre profil digital unique</li>
                <li>📇 Générez votre QR code personnel</li>
                <li>💳 Commandez votre carte NFC</li>
                <li>📊 Suivez vos statistiques en temps réel</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://luvika.vercel.app/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; text-decoration: none; padding: 16px 40px; border-radius: 14px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4); transition: all 0.3s ease;">
                  Accéder à mon dashboard
                </a>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 20px;">
                <p style="color: #475569; margin: 0 0 10px; font-size: 15px;">
                  <strong> Besoin d'aide ?</strong>
                </p>
                <p style="color: #64748b; margin: 0; line-height: 1.6; font-size: 14px;">
                  Notre équipe support est à votre disposition :<br>
                  <a href="mailto:support@luvika.me" style="color: #0ea5e9; text-decoration: underline;">support@luvika.me</a>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px;">
                <a href="https://luvika.vercel.app" style="color: #64748b; text-decoration: none; font-size: 14px;">Site web</a>
                <a href="https://luvika.vercel.app/contact" style="color: #64748b; text-decoration: none; font-size: 14px;">Contact</a>
                <a href="https://luvika.vercel.app/legal" style="color: #64748b; text-decoration: none; font-size: 14px;">Mentions légales</a>
              </div>
              <p style="color: #64748b; margin: 10px 0 5px; font-size: 13px;">
                © ${new Date().getFullYear()} LUVIKA — Révèle qui tu es
              </p>
              <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                Kinshasa, République Démocratique du Congo
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}