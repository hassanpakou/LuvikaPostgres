// src/app/dashboard/orders/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export default async function UserOrdersPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data : { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  // ✅ À compléter avec fetch('/api/orders?user_id=...')
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Mes commandes NFC</h1>
      <p className="text-gray-400">Gérez vos commandes en cours.</p>
      <div className="mt-6 bg-gray-800/50 border border-white/10 rounded-xl p-6">
        <p className="text-gray-500 italic">🚧 En développement — bientôt disponible</p>
      </div>
    </div>
  );
}