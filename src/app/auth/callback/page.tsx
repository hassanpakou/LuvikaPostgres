// src/app/auth/callback/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { CheckCircle, Sparkle, ArrowLeft, ShieldCheck, ArrowRight } from 'lucide-react';
import { SiSocialblade } from 'react-icons/si';
import { Badge } from '../../../../components/ui/badge';

// 🔹 Server-side translations
const t = (key: string) => {
  const translations = {
    'auth.callback.back_to_login': 'Retour à la connexion',
    'auth.callback.title': 'Vérification réussie !',
    'auth.callback.subtitle': 'Votre compte a été vérifié avec succès. Préparation de votre espace personnel...',
    'auth.callback.dashboard': 'Accéder au tableau de bord',
    'auth.callback.customize': 'Personnalisez votre profil dès maintenant',
    'navbar.home': 'Accueil',
    'privacy': 'Confidentialité',
    'terms': 'Conditions',
    'contact': 'Contact'
  };
  return translations[key as keyof typeof translations] || key;
};

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
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
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  const code = searchParams.code || searchParams.token_hash;
  const next = (Array.isArray(searchParams.next) ? searchParams.next[0] : searchParams.next) || '/complete-profile';
  const plan = (Array.isArray(searchParams.plan) ? searchParams.plan[0] : searchParams.plan) || 'basic';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code as string);
    if (error) {
      console.error('Erreur vérification code:', error);
      redirect(`/auth/error?message=${encodeURIComponent(error.message || 'Erreur lors de la vérification')}`);
    }

    cookieStore.set('signup_plan', plan, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
      path: '/',
    });

    redirect(next);
  }

  // ✅ Design premium statique (page temporaire mais élégante)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-900/5 to-cyan-900/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 🔹 Fond dynamique premium */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.08),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.05),transparent_70%)]"></div>
      
      {/* 🔙 Retour accueil - Design premium */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2.5 text-gray-300 hover:text-emerald-300 transition-all group z-10"
      >
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium">← {t('navbar.home')}</span>
          <span className="text-[10px] text-emerald-400/80 hidden sm:block">Retour à l'accueil</span>
        </div>
      </Link>

      <div className="w-full max-w-md">
        <div className="relative">
          {/* 🔹 Effet de brillance sur la carte */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-2xl blur opacity-20 animate-pulse-slow"></div>
          
          <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl border border-white/15 shadow-2xl shadow-black/40 overflow-hidden">
            {/* 🔹 Bandeau supérieur décoratif */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
            
            <div className="relative p-7 md:p-8">
              {/* 🔹 Header avec logo LUVIKA */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-5 border border-white/10 shadow-lg shadow-emerald-500/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  <div className="relative z-10">
                    <SiSocialblade className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300 mb-2">
                  {t('auth.callback.title')}
                </h1>
                <p className="text-gray-300 text-sm max-w-xs mx-auto">
                  {t('auth.callback.subtitle')}
                </p>
                
                {/* 🔹 Badges de succès */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[11px] py-0.5 px-2">
                    <ShieldCheck className="w-3 h-3 mr-0.5 inline" />
                    Compte vérifié
                  </Badge>
                  <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25 text-[11px] py-0.5 px-2">
                    <Sparkle className="w-3 h-3 mr-0.5 inline" />
                    Sécurité renforcée
                  </Badge>
                </div>
              </div>

              {/* 🔹 Animation de chargement premium */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
                  <div className="absolute inset-1 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin animation-delay-200"></div>
                  <div className="absolute inset-2 rounded-full border-2 border-white/20 border-t-white animate-spin animation-delay-400"></div>
                  <CheckCircle className="absolute inset-0 m-auto w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
              </div>

              {/* 🔹 Message de succès */}
              <div className="mb-6 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/25 text-center">
                <p className="text-emerald-200 font-medium mb-1">✅ Vérification terminée</p>
                <p className="text-emerald-100/90 text-sm">
                  Votre compte est sécurisé et prêt à l'emploi. Redirection vers votre tableau de bord...
                </p>
              </div>

              {/* 🔹 Bouton d'action premium */}
              <Link href="/auth/sign-in">
                <div className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 text-center cursor-pointer group relative overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></span>
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4.5 h-4.5" />
                    {t('auth.callback.dashboard')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              {/* 🔹 Section d'encouragement */}
              <div className="mt-7 pt-5 border-t border-white/10 text-center">
                <p className="text-gray-300 text-sm mb-3">
                  <span className="font-medium text-emerald-300">Félicitations !</span> Votre identité numérique LUVIKA est prête à être partagée.
                </p>
                <p className="text-[13px] text-emerald-200/80 mt-2 flex items-center justify-center gap-1.5">
                  <Sparkle className="w-3 h-3 text-yellow-400 animate-pulse" />
                  {t('auth.callback.customize')}
                </p>
                
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-[11px] text-gray-500">
                  <Link href="/privacy" className="hover:text-emerald-300 transition-colors">Confidentialité</Link>
                  <span>•</span>
                  <Link href="/terms" className="hover:text-emerald-300 transition-colors">Conditions</Link>
                  <span>•</span>
                  <Link href="/contact" className="hover:text-emerald-300 transition-colors">Contact</Link>
                </div>
              </div>
              
              {/* 🔹 Footer carte */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-300/90">
                  <Sparkle className="w-3 h-3 text-yellow-400 animate-pulse" />
                  <span>Compte sécurisé • Données chiffrées</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 🔹 Signature */}
        <div className="mt-6 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <Sparkle className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Fait avec ❤️ à Kinshasa • LUVIKA v2.1.0</span>
        </div>
      </div>
      
      {/* 🔹 Styles globaux */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
          background-size: 200% 100%;
        }
        
        @keyframes animation-delay-200 {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}