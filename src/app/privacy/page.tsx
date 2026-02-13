// src/app/privacy/page.tsx
'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Shield, Lock, Users, Database, Settings, 
  ArrowLeft, Sparkle, FileText, Key, 
  Eye, Trash2, Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
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
            <span className="text-cyan-300 font-medium text-sm">Confidentialité</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-3">
            Politique de confidentialité – Luvika
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm">
            Votre vie privée est notre priorité absolue. Cette politique explique comment nous protégeons vos données personnelles.
          </p>
          
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        {/* 🔹 Sections compactes avec icônes */}
        <div className="space-y-5">
          {[
            {
              title: 'Introduction',
              icon: FileText,
              color: 'from-blue-500 to-cyan-500',
              content: 'Luvika est une plateforme de cartes numériques professionnelles. La protection de vos données personnelles est une priorité absolue. Cette politique explique quelles données nous collectons, pourquoi, et comment elles sont protégées.'
            },
            {
              title: 'Données collectées',
              icon: Database,
              color: 'from-green-500 to-emerald-500',
              content: 'Lors de l\'utilisation de Luvika, nous collectons :',
              items: [
                'Nom et prénom',
                'Adresse e-mail',
                'Numéro de téléphone',
                'Photo de profil',
                'Informations de carte numérique créées',
                'Données de connexion (adresse IP, type d\'appareil)'
              ]
            },
            {
              title: 'Finalité de la collecte',
              icon: Target,
              color: 'from-purple-500 to-pink-500',
              content: 'Les données sont utilisées pour :',
              items: [
                'Créer et gérer votre compte',
                'Générer vos cartes numériques',
                'Sécuriser l\'accès à la plateforme',
                'Améliorer les performances du service'
              ]
            },
            {
              title: 'Cookies',
              icon: Cookie,
              color: 'from-amber-500 to-orange-500',
              content: 'Luvika utilise des cookies pour :',
              items: [
                'Maintenir votre session connectée',
                'Sécuriser la navigation',
                'Mémoriser certaines préférences'
              ],
              highlight: 'Aucun cookie publicitaire tiers n\'est utilisé sans votre consentement.'
            },
            {
              title: 'Partage des données',
              icon: Share2,
              color: 'from-indigo-500 to-blue-500',
              content: 'Vos données ne sont jamais vendues. Elles peuvent être hébergées chez des services techniques sécurisés uniquement pour le fonctionnement de la plateforme.'
            },
            {
              title: 'Sécurité',
              icon: Shield,
              color: 'from-cyan-500 to-blue-500',
              content: 'Nous mettons en place des mesures techniques avancées pour protéger vos informations contre tout accès non autorisé.'
            },
            {
              title: 'Durée de conservation',
              icon: Clock,
              color: 'from-teal-500 to-emerald-500',
              content: 'Les données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression à tout moment.'
            },
            {
              title: 'Vos droits',
              icon: Key,
              color: 'from-yellow-500 to-orange-500',
              content: 'Vous pouvez :',
              items: [
                'Accéder à vos données',
                'Modifier vos informations',
                'Supprimer votre compte'
              ]
            },
            {
              title: 'Contact',
              icon: Mail,
              color: 'from-red-500 to-pink-500',
              content: (
                <>
                  Pour toute demande :{' '}
                  <a href="mailto:support@luvika.com" className="text-cyan-300 hover:underline font-medium">
                    support@luvika.com
                  </a>
                </>
              )
            }
          ].map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="glass-border rounded-2xl p-5 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center flex-shrink-0`}>
                  <section.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                {section.content}
              </p>
              
              {section.items && (
                <ul className="space-y-2 mt-3 text-gray-300 text-sm">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 pl-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              
              {section.highlight && (
                <Badge className="mt-3 bg-amber-500/20 text-amber-300 border-amber-500/30 text-sm py-1 px-3 font-medium">
                  {section.highlight}
                </Badge>
              )}
            </motion.div>
          ))}
        </div>

        {/* 🔹 Bouton retour compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
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
          transition={{ delay: 0.7 }}
          className="text-center mt-10 pt-6 border-t border-white/10 text-[11px] text-gray-500"
        >
          <p>LUVIKA • Politique de Confidentialité • Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</p>
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
import { Target, Cookie, Share2, Clock } from 'lucide-react';