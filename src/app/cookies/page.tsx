// src/app/cookies/page.tsx
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, Globe, ArrowLeft, Sparkle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function CookiesPage() {
  const t = useTranslations('footer');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* 🔹 Header compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20 mb-4">
            <Sparkle className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span className="text-cyan-300 font-medium text-sm">Politique de Cookies</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-3">
            {t('cookies')}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm">
            Nous utilisons des cookies strictement nécessaires au bon fonctionnement de notre plateforme. Aucun cookie de suivi n'est utilisé.
          </p>
          
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        {/* 🔹 Contenu compact avec cartes */}
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-border rounded-2xl p-5 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Cookies Utilisés</h2>
                <p className="text-gray-300 text-sm">Strictement nécessaires au fonctionnement du site</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { icon: Lock, title: 'Authentification', desc: 'Cookies Supabase pour garder votre session active' },
                { icon: Globe, title: 'Préférences', desc: 'Langue sélectionnée, thème (si activé)' },
                { icon: Shield, title: 'Sécurité', desc: 'Protection contre les attaques CSRF' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-lg">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">{item.title}</h3>
                    <p className="text-[13px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-border rounded-2xl p-5 md:p-6 bg-gradient-to-br from-amber-900/20 to-orange-900/10 border border-amber-500/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">⚠️ Important</h2>
                <p className="text-gray-200 text-sm">
                  <span className="font-medium text-amber-300">Aucun cookie de suivi</span> (Google Analytics, Meta Pixel, etc.) n'est utilisé sur LUVIKA.
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  Vous pouvez gérer ou supprimer les cookies via les paramètres de votre navigateur à tout moment.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-border rounded-2xl p-5 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-3">Vos Droits</h2>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span>Accéder à la liste des cookies utilisés</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span>Supprimer les cookies via les paramètres de votre navigateur</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                <span>Refuser les cookies non-essentiels (aucun sur LUVIKA)</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* 🔹 Bouton retour compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-cyan-300 hover:text-cyan-200 hover:bg-white/10">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Retour à l'accueil
            </Button>
          </Link>
        </motion.div>

        {/* 🔹 Footer compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10 pt-6 border-t border-white/10 text-[11px] text-gray-500"
        >
          <p>LUVIKA • Politique de Cookies • Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</p>
          <p className="mt-1 flex items-center justify-center gap-1.5">
            <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Fait avec ❤️ à Kinshasa</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// 🔹 Icônes manquantes
import { AlertTriangle } from 'lucide-react';