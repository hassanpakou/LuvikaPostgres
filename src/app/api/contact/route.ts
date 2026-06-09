// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Logo Luvika (base64 - version simplifiée, ou utilisez une URL CDN)
// Pour une URL dynamique qui fonctionne en local et en production
const LUVITA_LOGO_URL = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app'}/logo.png`;
// Ou utilisez un logo en base64 pour éviter les liens externes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Template HTML pour l'admin (AVEC VOTRE LOGO)
const adminEmailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau message de contact</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f4f7fb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .card {
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 30px;
        text-align: center;
      }
      .logo {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
      }
      .logo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        background: white;
        padding: 8px;
        box-sizing: border-box;
      }
      h1 {
        color: white;
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
      .content {
        padding: 40px 30px;
      }
      .message-box {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
        border-left: 4px solid #667eea;
      }
      .info-row {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e9ecef;
      }
      .label {
        font-weight: 600;
        color: #495057;
        margin-bottom: 5px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .value {
        color: #212529;
        font-size: 16px;
      }
      .footer {
        background: #f8f9fa;
        padding: 20px 30px;
        text-align: center;
        border-top: 1px solid #e9ecef;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        border-radius: 8px;
        margin-top: 20px;
      }
      @media (max-width: 600px) {
        .content {
          padding: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="logo">
            <img src="${LUVITA_LOGO_URL}" alt="Luvika">
          </div>
          <h1>✨ Nouveau message reçu</h1>
        </div>
        <div class="content">
          <div class="info-row">
            <div class="label">👤 Nom complet</div>
            <div class="value">${escapeHtml(name)}</div>
          </div>
          <div class="info-row">
            <div class="label">📧 Adresse email</div>
            <div class="value">
              <a href="mailto:${escapeHtml(email)}" style="color: #667eea; text-decoration: none;">
                ${escapeHtml(email)}
              </a>
            </div>
          </div>
          <div class="message-box">
            <div class="label">💬 Message</div>
            <div class="value" style="white-space: pre-wrap; margin-top: 10px;">
              ${escapeHtml(message).replace(/\n/g, '<br>')}
            </div>
          </div>
          <div style="margin-top: 30px; padding: 15px; background: #f1f3f5; border-radius: 8px;">
            <p style="margin: 0; color: #6c757d; font-size: 13px;">
              ⚡ Répondez directement à cet email pour contacter ${escapeHtml(name)}
            </p>
          </div>
          <a href="mailto:${escapeHtml(email)}" class="button">
            📩 Répondre maintenant
          </a>
        </div>
        <div class="footer">
          <p style="margin: 0; color: #6c757d; font-size: 12px;">
            Luvika - Créons des connexions qui comptent
          </p>
          <p style="margin: 10px 0 0; color: #adb5bd; font-size: 11px;">
            Cet email a été envoyé automatiquement depuis le formulaire de contact Luvika
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

// Template HTML pour l'utilisateur (AVEC VOTRE LOGO)
const userEmailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation - Luvika</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f4f7fb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .card {
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 30px;
        text-align: center;
      }
      .logo {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
      }
      .logo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        background: white;
        padding: 8px;
        box-sizing: border-box;
      }
      h1 {
        color: white;
        margin: 10px 0 0;
        font-size: 28px;
        font-weight: 700;
      }
      .checkmark {
        font-size: 50px;
        margin: 10px 0;
      }
      .content {
        padding: 40px 30px;
      }
      .message-copy {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
        border-left: 4px solid #28a745;
      }
      .info {
        background: #e7f3ff;
        border-radius: 12px;
        padding: 15px;
        margin: 20px 0;
      }
      .footer {
        background: #f8f9fa;
        padding: 20px 30px;
        text-align: center;
        border-top: 1px solid #e9ecef;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        border-radius: 8px;
        margin-top: 20px;
      }
      @media (max-width: 600px) {
        .content {
          padding: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="logo">
            <img src="${LUVITA_LOGO_URL}" alt="Luvika">
          </div>
          <div class="checkmark">✅</div>
          <h1>Message reçu !</h1>
        </div>
        <div class="content">
          <p style="font-size: 18px; margin-bottom: 20px;">
            Bonjour <strong>${escapeHtml(name)}</strong> 👋
          </p>
          <p style="color: #6c757d;">
            Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais 
            (généralement sous 24 heures).
          </p>
          
          <div class="message-copy">
            <p style="font-weight: 600; margin-bottom: 10px; color: #28a745;">
              📝 Copie de votre message :
            </p>
            <p style="white-space: pre-wrap; margin: 0; color: #495057;">
              ${escapeHtml(message).replace(/\n/g, '<br>')}
            </p>
          </div>

          <div class="info">
            <p style="margin: 0 0 5px 0;">💡 <strong>Prochaines étapes :</strong></p>
            <ul style="margin: 5px 0 0 20px; color: #6c757d;">
              <li>Notre équipe va étudier votre demande</li>
              <li>Vous recevrez une réponse personnalisée sous 24h</li>
              <li>En attendant, n'hésitez pas à consulter notre site</li>
            </ul>
          </div>

          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app'}" class="button">
            🚀 Découvrir Luvika
          </a>
        </div>
        <div class="footer">
          <p style="margin: 0; font-weight: 600; color: #333;">
            Luvika - Créons des connexions qui comptent
          </p>
          <p style="margin: 10px 0 0; color: #6c757d; font-size: 12px;">
            📍 Kinshasa, RDC | ✨ Réponse garantie sous 24h
          </p>
          <p style="margin: 15px 0 0; color: #adb5bd; font-size: 11px;">
            Cet email est une confirmation automatique. Merci de ne pas y répondre directement.
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

    // Envoi des emails
    const [adminEmailResult, userEmailResult] = await Promise.allSettled([
      resend.emails.send({
        from: 'Luvika <onboarding@resend.dev>',
        to: ['phakunestor@gmail.com'],
        subject: `🔔 Nouveau message de contact - ${name}`,
        replyTo: email,
        text: `Nom: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        html: adminEmailHtml,
      }),
      resend.emails.send({
        from: 'Luvika <onboarding@resend.dev>',
        to: [email],
        subject: '✅ Confirmation - Nous avons bien reçu votre message',
        text: `Merci ${name} ! Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.\n\nCopie de votre message :\n${message}`,
        html: userEmailHtml,
      })
    ]);

    if (adminEmailResult.status === 'rejected' && userEmailResult.status === 'rejected') {
      console.error('Échec des deux envois:', adminEmailResult.reason, userEmailResult.reason);
      throw new Error('Échec de l\'envoi des emails');
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message envoyé avec succès'
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Erreur API contact:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'envoi. Veuillez réessayer.'
      },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour échapper les caractères HTML
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}