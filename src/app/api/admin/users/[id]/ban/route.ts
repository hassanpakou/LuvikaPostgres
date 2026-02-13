// src/app/api/admin/users/[id]/ban/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Promise<{ id: string }>
) {
  const { id: userIdToBan } = await params; // ✅ await params
  console.log("Tentative de bannir l'utilisateur:", userIdToBan); // 🔍 Log pour débug

  const cookieStore = await cookies();
  
  // 🔐 Vérifier admin
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set({ name, value, ...options }); },
        remove(name, options) { cookieStore.delete({ name, ...options }); },
      },
    }
  );

  // ✅ CORRECTION SÉCURISÉE
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile?.role !== 'admin') {
  return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
}

  const adminId = user.id;
  console.log("Admin demandant le bannissement:", adminId); // 🔍 Log

  if (userIdToBan === adminId) {
    console.log("Tentative d'auto-bannissement:", adminId); // 🔍 Log
    return NextResponse.json({ error: 'Auto-bannissement interdit' }, { status: 400 });
  }

  // 🔑 Clé service_role obligatoire
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local');
    return NextResponse.json({ error: 'Erreur de configuration' }, { status: 500 });
  }

  try {
    // 🔥 Bannir via API REST
    console.log("Appel API REST pour bannir:", userIdToBan); // 🔍 Log
    const banRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userIdToBan}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banned_until: 'infinity',
        }),
      }
    );

    if (!banRes.ok) {
      const errorText = await banRes.text();
      console.error('Erreur bannissement API REST:', errorText);
      console.error('Statut réponse API REST:', banRes.status); // 🔍 Log
      return NextResponse.json({ error: 'Échec du bannissement via API REST' }, { status: banRes.status });
    }
    console.log("Utilisateur banni via API REST avec succès:", userIdToBan); // 🔍 Log

    // ✅ Désactiver dans profiles
    console.log("Mise à jour du profil pour désactiver:", userIdToBan); // 🔍 Log
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ verified: false })
      .eq('id', userIdToBan);

    if (profileUpdateError) {
      console.error('Erreur mise à jour profile:', profileUpdateError); // 🔍 Log
      // Ne renvoie pas d'erreur ici, continue vers l'audit
    } else {
        console.log("Profil mis à jour avec succès:", userIdToBan); // 🔍 Log
    }

    // 📜 Audit
    console.log("Insertion dans admin_actions pour admin:", adminId, "cible:", userIdToBan); // 🔍 Log
    const { error: auditError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action: 'ban_user',
        target_user_id: userIdToBan,
        details: { reason: 'Bannissement manuel' },
      });

    if (auditError) {
      console.error('Erreur log audit dans admin_actions:', auditError); // 🔍 Log IMPORTANT
      // Tu peux choisir de renvoyer une erreur ici si l'audit est critique
      // return NextResponse.json({ error: 'Échec du log d\'audit' }, { status: 500 });
    } else {
        console.log("Log d'audit inséré avec succès dans admin_actions"); // 🔍 Log
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Exception dans le processus de bannissement:', err); // 🔍 Log
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}