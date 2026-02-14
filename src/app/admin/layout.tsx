// src/app/admin/admin/layout.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Toaster } from 'sonner';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminLayoutProvider } from '../../contexts/AdminLayoutContext';
import { NetworkWatcher } from '../../components/system/NetworkWatcher';

// 🔹 METADATA ADMIN SPÉCIFIQUE
export const metadata = {
  title: 'Admin Panel • LUVIKA',
  description: 'Espace administrateur - Gestion des utilisateurs, abonnements, commandes NFC et statistiques',
};

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
        <main className="pt-20">
          {children}
        </main>
        
        {/* 🔹 Toaster optimisé - UN SEUL */}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          duration={5000}
          visibleToasts={3}
        />
        
        <NetworkWatcher />
      </div>
    </AdminLayoutProvider>
  );
}