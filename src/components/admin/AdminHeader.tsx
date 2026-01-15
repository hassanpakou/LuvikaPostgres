'use client';

import Link from 'next/link';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/src/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { createNotifier } from '@/src/lib/notify';
import error from 'next/error';
import { useTranslations } from 'next-intl';

const t = useTranslations();
const notify = createNotifier(t);

if (error) {
  notify.ServerError();
}
export function AdminHeader() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/sign-in');
  };

  return (
    <header className="
      fixed top-0 left-0 right-0 z-50
      border-b border-white/10
      bg-slate-900/40
      backdrop-blur-xl
      shadow-lg shadow-black/30
    ">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-lg font-semibold text-white tracking-wide"
        >
          <div className="p-2 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md">
            <Settings className="w-5 h-5 text-cyan-300" />
          </div>
          Admin LUVIKA
        </Link>

        {/* Actions */}
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="
            text-slate-300 
            hover:text-white 
            hover:bg-white/10
            border border-white/10
            backdrop-blur-md
          "
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>

      </div>
    </header>
  );
}
