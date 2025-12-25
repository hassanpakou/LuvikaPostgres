// src/app/complete-profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Check, User, AlertCircle, Loader2 } from 'lucide-react';

export default function CompleteProfilePage() {
  const t = useTranslations('auth.complete');
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ✅ Vérification de la session au chargement de la page
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Pas de session → redirige vers login
        router.push('/auth/sign-in');
      }
    };

    checkAuth();
  }, [router, supabase]);

  // Vérification en temps réel de la disponibilité du username
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const checkUsername = async () => {
      setCheckingUsername(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur vérification username:', error);
        setUsernameAvailable(null);
      } else {
        setUsernameAvailable(!data);
      }

      setCheckingUsername(false);
    };

    const timeout = setTimeout(checkUsername, 600);
    return () => clearTimeout(timeout);
  }, [username, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError(t('error_full_name_required'));
      return;
    }

    if (!username.trim() || username.length < 3) {
      setError(t('error_username_too_short'));
      return;
    }

    if (!usernameAvailable) {
      setError(t('username_taken'));
      return;
    }

    setLoading(true);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user) {
      router.push('/auth/sign-in');
      return;
    }

    const { error: insertError } = await supabase.from('profiles').insert({
      id: session.user.id,
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      role: 'user',
    });

    if (insertError) {
      console.error('Erreur insertion profil:', insertError);

      if (insertError.message.includes('duplicate key') || insertError.code === '23505') {
        setError(t('username_taken'));
        setUsernameAvailable(false);
      } else {
        setError(t('error_generic') || insertError.message);
      }
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    }

    setLoading(false);
  };

  const handleUsernameChange = (value: string) => {
    const cleaned = value
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 20);

    setUsername(cleaned);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br">
      <div className="w-full max-w-md glass-border backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/15">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-gray-400 mt-2">{t('description')}</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10" />
            </div>
            <p className="text-white text-lg font-medium">{t('success')}</p>
            <p className="text-gray-400 mt-2">{t('redirecting')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
<Label htmlFor="full_name">{t('full_name')}</Label>
              <Input
                id="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('full_name_placeholder')}
                required
                minLength={2}
                maxLength={100}
                className="mt-2 bg-white/5 border-white/20 focus:border-cyan-400"
                autoFocus
              />
            </div>

            <div>
<Label htmlFor="username">{t('username')}</Label> 
             <div className="relative mt-2">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder={t('username_placeholder')}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-z0-9_-]+"
                  className="pr-12 bg-white/5 border-white/20 focus:border-cyan-400"
                />

                <div className="absolute right-3 top-3">
                  {checkingUsername && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
                  {!checkingUsername && usernameAvailable === true && (
                    <Check className="w-5 h-5 text-green-400" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                {username.length >= 3 &&
                  (usernameAvailable === true
                    ? t('username_available')
                    : usernameAvailable === false
                    ? t('username_taken')
                    : t('username_checking'))}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {t('username_hint')}
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || checkingUsername || !usernameAvailable || !fullName.trim() || username.length < 3}
              className="w-full bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 h-12 text-lg font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                t('submit')
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}