// src/app/complete-profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { useTranslations } from 'next-intl';
import { 
  User, Phone, MessageCircle, Briefcase, MapPin, 
  Check, AlertCircle, X, SkipForward 
} from 'lucide-react';

type Step = 'identity' | 'contact' | 'bio';
type FormData = {
  full_name: string;
  username: string;
  phone: string;
  whatsapp: string;
  job_title: string;
  company: string;
  bio_short: string;
  address: string;
};

export default function CompleteProfilePage() {
  const t = useTranslations('auth.complete');
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>('identity');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    username: '',
    phone: '',
    whatsapp: '',
    job_title: '',
    company: '',
    bio_short: '',
    address: '',
  });

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const usernameInputRef = useRef<HTMLInputElement>(null);

  // ✅ Vérifie si onboarding déjà fait
  useEffect(() => {
    const checkProfile = async () => {
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/auth/sign-in');

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_done) {
        router.push('/dashboard');
      } else {
        // Pré-remplir avec les données de sign-up si disponibles
        const urlParams = new URLSearchParams(window.location.search);
        const fullName = urlParams.get('full_name') || '';
        const username = urlParams.get('username') || '';
        setFormData(prev => ({ ...prev, full_name: fullName, username }));
      }
    };
    checkProfile();
  }, [router, supabase]);

  // ✅ Vérification username
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const check = async () => {
      setCheckingUsername(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', formData.username.toLowerCase())
        .maybeSingle();

      setUsernameAvailable(!data);
      setCheckingUsername(false);
    };

    const timer = setTimeout(check, 500);
    return () => clearTimeout(timer);
  }, [formData.username, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleNext = async () => {
    if (step === 'identity') {
      if (!formData.full_name.trim()) return setError(t('error_full_name_required'));
      if (!formData.username.trim() || formData.username.length < 3) return setError(t('error_username_too_short'));
      if (usernameAvailable === false) return setError(t('username_taken'));
    }

    if (step === 'identity') {
      setStep('contact');
    } else if (step === 'contact') {
      setStep('bio');
    }
  };

  const handleSkip = () => {
    if (step === 'identity') return; // ❌ pas de skip sur l'identité
    if (step === 'contact') setStep('bio');
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { data : { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/auth/sign-in');

    // ✅ Récupère le plan depuis cookie
    const getPlan = () => {
      const match = document.cookie.match(/signup_plan=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : 'basic';
    };

    const { error: insertError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: formData.full_name.trim(),
      username: formData.username.trim().toLowerCase(),
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      job_title: formData.job_title,
      company: formData.company,
      bio_short: formData.bio_short,
      address: formData.address,
      plan: getPlan(),
      onboarding_done: true,
      role: 'user',
    }, {
      onConflict: 'id',
    });

    if (insertError) {
      console.error('Erreur:', insertError);
      setError(insertError.message || t('error_generic'));
    } else {
      // Nettoie cookie
      document.cookie = "signup_plan=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    }

    setLoading(false);
  };

  const steps: Step[] = ['identity', 'contact', 'bio'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br">
      <div className="w-full max-w-md glass-border backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/15">
        {/* ✅ Progression */}
        <div className="flex justify-between mb-8">
          {steps.map((s, i) => {
            const isActive = step === s;
            const isCompleted = i < currentStepIndex;
            const Icon = 
              s === 'identity' ? User :
              s === 'contact' ? Phone :
              Briefcase;

            return (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-cyan-500 text-white' :
                  'bg-white/10 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-xs text-gray-400 capitalize">
                  {t(`step_${s}`)}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-900/30 text-red-200 p-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <p className="text-white text-lg font-medium">{t('success')}</p>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {step === 'identity' && t('title_identity')}
                {step === 'contact' && t('title_contact')}
                {step === 'bio' && t('title_bio')}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {step === 'identity' && t('desc_identity')}
                {step === 'contact' && t('desc_contact')}
                {step === 'bio' && t('desc_bio')}
              </p>
            </div>

            <div className="space-y-4">
              {step === 'identity' && (
                <>
                  <div>
                    <Label htmlFor="full_name">{t('full_name')}</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder={t('full_name_placeholder')}
                      required
                      className="mt-1"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">{t('username')}</Label>
                    <div className="relative mt-1">
                      <Input
                        ref={usernameInputRef}
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder={t('username_placeholder')}
                        required
                        pattern="^[a-z0-9_-]{3,20}$"
                      />
                      {checkingUsername ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">···</span>
                      ) : usernameAvailable === true ? (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                      ) : usernameAvailable === false ? (
                        <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                      ) : null}
                    </div>
                    {usernameAvailable === false && (
                      <p className="text-xs text-red-400 mt-1">{t('username_taken')}</p>
                    )}
                  </div>
                </>
              )}

              {step === 'contact' && (
                <>
                  <div>
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+243 ..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">{t('whatsapp')}</Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="nestor.k"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              {step === 'bio' && (
                <>
                  <div>
                    <Label htmlFor="job_title">{t('job_title')}</Label>
                    <Input
                      id="job_title"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleChange}
                      placeholder="Développeur Full Stack"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">{t('company')}</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Elikya Fondation"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio_short">{t('bio_short')}</Label>
                    <Textarea
                      id="bio_short"
                      name="bio_short"
                      value={formData.bio_short}
                      onChange={handleChange}
                      placeholder="Passionné de tech et de fierté africaine 🌍"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              {step !== 'identity' && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(prev => 
                    prev === 'contact' ? 'identity' : 
                    prev === 'bio' ? 'contact' : 'identity'
                  )}
                  className="text-gray-300 hover:text-white"
                >
                  ← {t('back')}
                </Button>
              )}

              <div className="flex-1" />

              {step !== 'bio' ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    step === 'identity' && (
                      !formData.full_name.trim() || 
                      formData.username.length < 3 || 
                      usernameAvailable === false
                    )
                  }
                  className="bg-cyan-600 hover:bg-cyan-500"
                >
                  {t('next')} →
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-500"
                >
                  {loading ? t('saving') : t('finish')}
                </Button>
              )}

              {step !== 'identity' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="ml-2 border-white/20 text-gray-300 hover:bg-white/10"
                >
                  <SkipForward className="w-4 h-4 mr-1" />
                  {t('skip')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}