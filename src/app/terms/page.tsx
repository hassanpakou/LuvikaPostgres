// src/app/terms/page.tsx
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FileText, User, Lock, AlertTriangle, 
  RefreshCw, ArrowLeft, Sparkle, CheckCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
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
            <span className="text-cyan-300 font-medium text-sm">Conditions Générales</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-3">
            {t('terms')}
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm">
            Conditions d'utilisation de la plateforme LUVIKA. En utilisant nos services, vous acceptez ces conditions.
          </p>
          
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400 mx-auto mt-4 rounded-full"></div>
          
          <Badge className="mt-3 bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs py-0.5 px-2">
            En vigueur au : {new Date().toLocaleDateString('fr-FR')}
          </Badge>
        </motion.div>

        {/* 🔹 Sections compactes */}
        <div className="space-y-5">
          {[
            {
              title: '1. Acceptation des conditions',
              icon: CheckCircle,
              color: 'from-green-500 to-emerald-500',
              content: 'En utilisant LUVIKA, vous acceptez ces conditions. Si vous n\'êtes pas d\'accord, veuillez ne pas utiliser le service.'
            },
            {
              title: '2. Compte utilisateur',
              icon: User,
              color: 'from-blue-500 to-cyan-500',
              content: 'Vous êtes responsable de la sécurité de votre compte et des informations que vous partagez publiquement.'
            },
            {
              title: '3. Propriété intellectuelle',
              icon: Lock,
              color: 'from-purple-500 to-pink-500',
              content: 'LUVIKA et son code source sont la propriété de ses auteurs. Le contenu que vous publiez reste le vôtre.'
            },
            {
              title: '4. Limitation de responsabilité',
              icon: AlertTriangle,
              color: 'from-amber-500 to-orange-500',
              content: 'LUVIKA est fourni « tel quel ». Nous ne garantissons pas la disponibilité 24/7 ni la fiabilité des scans NFC/QR.'
            },
            {
              title: '5. Modifications',
              icon: RefreshCw,
              color: 'from-cyan-500 to-blue-500',
              content: 'Nous pouvons mettre à jour ces conditions. Vous serez informé(e) en cas de changement majeur.'
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
          <p>LUVIKA • Conditions Générales d'Utilisation • Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</p>
          <p className="mt-1 flex items-center justify-center gap-1.5">
            <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Fait avec ❤️ à Kinshasa</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}