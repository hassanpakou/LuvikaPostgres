// src/app/(admin)/layout.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,   // ✅ Ajouté
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ Ajouté
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
          // ✅ Supprimé set/remove → interdits dans un layout
        },
      },
    }
  );

  // ✅ getUser() au lieu de getSession()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/auth/sign-in');
  }

  return <div>{children}</div>;
}