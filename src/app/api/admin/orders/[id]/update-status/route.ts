// src/app/api/admin/orders/[id]/update-status/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// 🔹 Schéma de validation
const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 🔹 Validation ID
    const params = await context.params;
    const idResult = z.string().uuid().safeParse(params.id);
    if (!idResult.success) {
      return NextResponse.json({ error: 'ID de commande invalide' }, { status: 400 });
    }
    const orderId = idResult.data;

    // 🔹 Validation body
    const body = await request.json();
    const parsed = UpdateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
    const { status } = parsed.data;

    // 🔹 Authentification admin
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // 🔹 Mise à jour BDD
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString() // ✅ Ajout timestamp
      })
      .eq('id', orderId)
      .select('id, status, profiles(full_name, email)');

    if (error) throw error;

    // ✅ Succès avec données enrichies
    return NextResponse.json({ 
      success: true,
      message: `Statut mis à jour : ${status}`,
      order: error ? null : null 
    });
  } catch (error: any) {
    console.error('❌ Erreur update-status:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' }, 
      { status: error.status || 500 }
    );
  }
}