// src/app/(admin)/admin/users/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, ShieldCheck, ShieldX } from 'lucide-react';
import { UserActions } from '@/components/admin/UserActions';

export default async function UsersPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get(name) { return cookieStore.get(name)?.value; } },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/auth/sign-in');
  }

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const t = await getTranslations();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('admin.nav.back_to_dashboard')}
        </Link>
        <h1 className="text-3xl font-bold text-white">
          {t('admin.modules.users.title')}
        </h1>
        <p className="text-gray-400">
          {t('admin.modules.users.description')}
        </p>
      </div>

      {users.length === 0 ? (
        <Card className="glass-border">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">{t('admin.users.no_users')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-left text-gray-400 font-medium">{t('admin.users.name')}</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">{t('admin.users.username')}</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">{t('admin.users.email')}</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">{t('admin.users.role')}</th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">{t('admin.users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{u.full_name}</td>
                  <td className="py-3 px-4 text-cyan-300">@{u.username}</td>
                  <td className="py-3 px-4 text-gray-300">{u.email}</td>
                  <td className="py-3 px-4">
                    {u.id === user.id ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                        <ShieldX className="w-3 h-3" /> User
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {/* ✅ Actions sécurisées */}
                    <UserActions id={u.id} isSelf={u.id === user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}