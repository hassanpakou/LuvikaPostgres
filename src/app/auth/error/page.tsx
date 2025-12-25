// src/app/auth/error/page.tsx
'use client'; // ← Ajoute cette ligne en tout premier !

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Une erreur est survenue.';
  const t = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{t('auth.error.title')}</h1>
        <p className="text-gray-400 mb-8">{message}</p>
        <Button asChild className="bg-gradient-to-r from-cyan-600 to-blue-500">
          <Link href="/auth/sign-in">{t('auth.signin.submit')}</Link>
        </Button>
      </div>
    </div>
  );
}