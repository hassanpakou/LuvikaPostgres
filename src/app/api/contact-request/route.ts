// src/app/api/contact-request/route.ts
import { Resend } from 'resend';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { profile_id, name, email, phone, message } = await req.json();

    if (!profile_id || !name || !email || !message) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    // ✅ Récupère l’email du propriétaire
    const { data: owner } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', profile_id)
      .single();

    if (!owner?.email) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    // ✅ Envoie l’email
    const { error: mailError } = await resend.emails.send({
      from: 'LUVIKA <onboarding@resend.dev>',
      to: owner.email,
      subject: `📩 Nouveau message de ${name} via votre profil LUVIKA`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 20px auto; background: #0f172a; color: white; padding: 30px; border-radius: 16px; border: 1px solid #334155;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <span style="font-size: 28px;">✉️</span>
            </div>
            <h1 style="font-weight: 700; font-size: 24px; margin: 0;">Nouveau message</h1>
            <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0;">Via votre profil LUVIKA</p>
          </div>

          <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; gap: 12px; margin-bottom: 16px;">
              <div style="flex: 1;">
                <p style="margin: 0 0 4px; font-size: 13px; color: #94a3b8;">Nom</p>
                <p style="margin: 0; font-weight: 500;">${name}</p>
              </div>
              <div style="flex: 1;">
                <p style="margin: 0 0 4px; font-size: 13px; color: #94a3b8;">Email</p>
                <p style="margin: 0; font-weight: 500; word-break: break-all;">${email}</p>
              </div>
            </div>
            ${phone ? `
              <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 4px; font-size: 13px; color: #94a3b8;">Téléphone</p>
                <p style="margin: 0; font-weight: 500;">${phone}</p>
              </div>
            ` : ''}

            <div style="margin-top: 16px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8;">Message</p>
              <div style="background: #0f172a; border-radius: 8px; padding: 14px; font-size: 15px; line-height: 1.5; white-space: pre-wrap;">${message}</div>
            </div>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #334155; color: #94a3b8; font-size: 13px;">
            <p style="margin: 0 0 8px;">Ce message provient d’un visiteur de votre profil public.</p>
            <p style="margin: 0;">
              <a href="https://luvika.vercel.app/fr/${profile_id}" 
                 style="color: #38bdf8; text-decoration: none;">luvika.dev/${profile_id}</a>
            </p>
          </div>
        </div>
      `,
    });

    if (mailError) throw mailError;

    // ✅ Réponse réussie (pas de données sensibles exposées)
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Contact request email error:', err);
    return NextResponse.json({ error: 'Échec de l’envoi' }, { status: 500 });
  }
}