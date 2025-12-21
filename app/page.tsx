// src/app/page.tsx
// Page d'accueil — 3D Card animée + présentation

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProfileCard3D from '@/components/cards/ProfileCard3D';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-12">
      {/* Titre principal */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-6"
      >
        LUVIKA
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10"
      >
        Révèle qui tu es — carte de visite intelligente NFC · QR Code · Abonnements · Événements
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 mb-16"
      >
        <Link href="/auth/sign-up">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400">
            Créer mon profil
          </Button>
        </Link>
        <Link href="#features">
          <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Découvrir
          </Button>
        </Link>
      </motion.div>

      {/* Carte 3D animée (au centre) */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 120 }}
        className="w-full max-w-md"
      >
        <ProfileCard3D />
      </motion.div>

      {/* Section "Fonctionnalités" (ancre #features) */}
      <section id="features" className="mt-32 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-white mb-8">Pourquoi LUVIKA ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'NFC & QR Code', desc: 'Partagez votre profil en un tap ou scan' },
            { title: 'Statistiques', desc: 'Scans, visites, présences — tout est tracé' },
            { title: 'Multi-cartes', desc: 'Professionnel ? Gérez plusieurs cartes NFC' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass-border p-6 text-left"
            >
              <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}