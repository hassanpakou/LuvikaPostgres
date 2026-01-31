// src/app/api/admin/users/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        // On n'utilise pas set/remove ici dans ce handler GET
      },
    }
  );

  // 🔐 Vérifier admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    console.log("Accès refusé: utilisateur non admin ou non authentifié");
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  // 🔹 Récupère les profils
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) {
    console.error("Erreur récupération profils:", profilesError);
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  // 🔹 Récupère les données d'auth via l'API REST Admin
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local');
    return NextResponse.json({ error: 'Erreur de configuration' }, { status: 500 });
  }

  try {
    // Appel à l'API REST Supabase Auth Admin
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`, // Clé de service
          apikey: serviceRoleKey, // Toujours inclure l'apikey
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API REST Auth:', errorText);
      return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs auth' }, { status: 500 });
    }

    const authUsersData = await response.json();
    const authUsers = authUsersData.users || []; // La structure peut varier, vérifiez si c'est '.users' ou directement le tableau

    console.log("Données brutes API REST Auth:", authUsersData); // 🔍 Log pour vérifier la structure

    // 🔹 Combine les données (sécurisé)
    const usersWithBanStatus = (profiles || []).map(profile => {
      // Cherche dans la réponse de l'API REST
      const authUser = authUsers.find((u: { id: any; }) => u.id === profile.id);
      // Le champ 'banned_until' devrait être présent dans 'authUser' si l'utilisateur est banni
      return {
        ...profile,
        banned_until: authUser?.banned_until || null,
      };
    });

    console.log("Données envoyées à l'API:", usersWithBanStatus);
    return NextResponse.json(usersWithBanStatus);
  } catch (err) {
    console.error("Erreur lors de l'appel à l'API REST Auth:", err);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des utilisateurs' }, { status: 500 });
  }
}