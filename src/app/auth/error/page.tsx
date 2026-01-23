// src/app/auth/error/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '../../../../components/ui/button';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations();
  const [message, setMessage] = useState('Une erreur est survenue.');

  useEffect(() => {
    // 🔑 Récupère le message une fois que searchParams est prêt
    const msg = searchParams.get('message') || 'Une erreur est survenue.';
    setMessage(msg);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-red-900/10 to-black">
      <div className="relative w-full max-w-md">
        {/* 🔹 Bulles flottantes */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-red-500/10 blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl animate-float animation-delay-2000"></div>

        <div className="glass-border backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/15 text-center relative z-10 overflow-hidden">
          {/* 🔹 Glow interne */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-cyan-500/5 rounded-3xl -z-10"></div>

          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full mb-6 border border-red-400/30 shadow-lg">
            <AlertCircle className="w-10 h-10 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-cyan-300 animate-pulse" />
          </div>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent mb-4">
            {t('auth.error.title')}
          </h1>

          <p className="text-gray-300 mb-8 leading-relaxed">
            {message}
          </p>

          <Button asChild className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 h-12 text-lg font-semibold shadow-lg hover:shadow-cyan-500/30 transition-all duration-300">
            <Link href="/auth/sign-in">
              {t('auth.signin.submit')}
            </Link>
          </Button>

          <p className="text-gray-500 text-sm mt-6 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Retournez en sécurité vers votre espace.
          </p>
        </div>
      </div>
    </div>
  );
}