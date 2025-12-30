// src/app/api/orders/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 🔹 ✅ ATTENDRE les cookies
  const cookieStore = await cookies(); // ← await obligatoire

  // 🔹 Crée le client Supabase SSR
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  // 🔹 Récupère la session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      quantity = 1,
      shipping_address = null,
      product_type = 'nfc_premium',
    } = body;

    if (!quantity || quantity < 1 || !product_type) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // 🔹 Insère la commande
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        quantity,
        shipping_address,
        product_type,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // 🔹 Optionnel : déclencher Edge Function
    try {
      await supabase.functions.invoke('send-order-confirmation', {
        body: { order_id: order.id },
      });
    } catch (emailErr) {
      console.warn('📧 Email non envoyé (Edge Function)', emailErr);
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erreur création commande:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}