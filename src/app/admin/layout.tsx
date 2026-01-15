// src/app/(admin)/layout.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Toaster } from 'sonner';
import { AdminHeader } from '@/src/components/admin/AdminHeader';
import { AdminLayoutProvider } from '@/src/contexts/AdminLayoutContext';
import { NetworkWatcher } from '@/src/components/system/NetworkWatcher';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/auth/sign-in');
  }

  return (
    <AdminLayoutProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-950 text-white">
        <AdminHeader />
        {children}
        <Toaster position="top-right" richColors closeButton />
        <Toaster position="top-right" richColors />
        {/* ← Obligatoire pour voir les toasts & pour surveiller la connexion globale*/}
        <NetworkWatcher/>
      </div>
    </AdminLayoutProvider>
  );
}