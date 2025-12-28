// src/components/profile/PublicProfileClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, UserCheck, QrCode, ExternalLink } from 'lucide-react';
import GlacialLikeButton from './GlacialLikeButton';
import ScanTracker from './ScanTracker';
import ProfileActions from './ProfileActions';
import QRModal from './QRModal';
import { Card } from '@/components/ui/card';

type Profile = {
  id: string;
  full_name: string;
  username: string;
  job_title?: string;
  bio_short?: string;
  bio_long?: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  website?: string | null;
  instagram?: string | null;
  company?: string | null;
  likes_count?: number;
  subscriptions?: { plan: string; active: boolean }[];
  nfc_cards?: { status: string }[];
};

export default function PublicProfileClient({ profile }: { profile: Profile }) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [hasLostCard, setHasLostCard] = useState(false);

  useEffect(() => {
    const activeOrLostCards = (profile.nfc_cards || []).filter(
      (card: any) => card.status === 'active' || card.status === 'lost'
    );
    setHasLostCard(activeOrLostCards.some((card: any) => card.status === 'lost'));
    
    // 🔹 Enregistre le scan
    fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profile.id, scan_type: 'qr_profile' }),
    }).catch(console.warn);
  }, [profile.id]);

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.dev').replace(/\/$/, '');
  const profileUrl = `${baseUrl}/${profile.username}`;

  return (
    <>
      {/* 🔹 En-tête — photo en premier */}
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center pb-6"
      >
        {/* Photo de profil */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="relative inline-block mb-6"
        >
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 flex items-center justify-center text-3xl md:text-4xl font-bold text-white border-4 border-white/30 shadow-2xl mx-auto">
            {profile.full_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQRModal(true)}
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg border border-white/20"
            aria-label="Afficher QR Code"
          >
            <QrCode className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </motion.button>
        </motion.div>

        {/* 🔹 Nom d'utilisateur + Nom complet + Like/Statut */}
        <div className="max-w-2xl mx-auto px-4">
          {/* Username (petit) */}
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-cyan-300 text-sm font-mono tracking-wider"
          >
            @{profile.username}
          </motion.p>

          {/* Nom complet (grand) + Job */}
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-white mt-1"
          >
            {profile.full_name}
          </motion.h1>
          
          {profile.job_title && (
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-gray-300 mt-1"
            >
              {profile.job_title}
            </motion.p>
          )}

          {/* Like à gauche / Statut carte à droite */}
          <motion.div 
            initial={{ y: 14, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
  className="
    mt-6
    flex items-center justify-between
    px-4 py-3
    rounded-2xl
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    shadow-[0_0_40px_rgba(56,189,248,0.08)]
  "
>
            {/* 🔹 Like Button — gauche */}
            <div>
              <GlacialLikeButton 
                profileId={profile.id} 
                initialLikes={profile.likes_count || 0} 
              />
            </div>

            {/* 🔹 Statut carte — droite */}
  <div className="flex items-center gap-2 text-xs">
    <span className="relative flex h-2.5 w-2.5">
      {!hasLostCard && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          hasLostCard ? 'bg-yellow-500' : 'bg-emerald-500'
        }`}
      />
    </span>
    <span
      className={`font-medium ${
        hasLostCard ? 'text-yellow-300' : 'text-emerald-300'
      }`}
    >
      {hasLostCard ? 'Carte déclarée perdue' : 'Carte active'}
    </span>
  </div>
</motion.div>
          {/* 🔹 Badge abonnement */}
          {profile.subscriptions?.[0]?.active && (
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-3"
            >
              <Badge className="bg-gradient-to-r from-cyan-600 to-blue-500 text-white px-3 py-1 text-sm">
                {profile.subscriptions[0].plan === 'premium' ? 'Premium' : 'Entreprise'}
              </Badge>
            </motion.div>
          )}

          {/* 🔹 Bio courte */}
          {profile.bio_short && (
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-300 mt-4 text-base leading-relaxed"
            >
              {profile.bio_short}
            </motion.p>
          )}

          <ScanTracker profileId={profile.id} />
        </div>
      </motion.header>

      {/* 🔹 Sections glacées */}
      <div className="space-y-7">
        <GlacialSection title="📬 Me contacter">
          <ProfileActions profile={profile} />
        </GlacialSection>

        {profile.bio_long && (
          <GlacialSection title="📖 À propos">
            <p className="text-gray-300 whitespace-pre-line leading-relaxed text-lg">
              {profile.bio_long}
            </p>
          </GlacialSection>
        )}

        {(profile.website || profile.instagram) && (
          <GlacialSection title="🔗 Liens">
            <div className="space-y-3">
              {profile.website && (
                <LinkItem href={profile.website} label="Site web" />
              )}
              {profile.instagram && (
                <LinkItem 
                  href={`https://instagram.com/${profile.instagram}`} 
                  label={`Instagram: @${profile.instagram}`} 
                />
              )}
            </div>
          </GlacialSection>
        )}

        <GlacialSection>
          <Button
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-4 text-lg font-medium"
            onClick={() => {
              const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name}
ORG:${profile.company || ''}
TITLE:${profile.job_title || ''}
TEL;TYPE=WORK,VOICE:${profile.phone || ''}
TEL;TYPE=CELL,VOICE:${profile.whatsapp || ''}
EMAIL:${profile.email || ''}
ADR;TYPE=WORK:;;${profile.address || ''};;;;
URL:${profile.website || ''}
NOTE:Contact via LUVIKA — luvika.me/${profile.username}
END:VCARD`.trim().replace(/\n/g, '\r\n');

              const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${profile.username}.vcf`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="mr-2 h-5 w-5" />
            Sauvegarder le contact (.vcf)
          </Button>
        </GlacialSection>
      </div>

      {/* 🔹 Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center text-gray-500 text-sm"
      >
        <p className="mb-1">Partagé via <span className="text-cyan-300 font-semibold">LUVIKA</span></p>
        <p className="flex items-center justify-center gap-1 mx-auto w-fit">
          <span>✨ Révèle qui tu es.</span>
          <ExternalLink className="w-4 h-4 ml-1" />
        </p>
        <p className="mt-3">
          <a 
            href="/" 
            className="hover:text-cyan-300 flex items-center justify-center gap-1 mx-auto w-fit"
          >
            luvika.dev <ExternalLink size={14} className="ml-1" />
          </a>
        </p>
      </motion.footer>

    {/* 🔹 Un seul QRModal — à la racine */}
<AnimatePresence>
  {showQRModal && (
    <QRModal
      key="qr-modal" // ✅ Clé explicite (optionnel mais sûr)
      isOpen={showQRModal}
      onClose={() => setShowQRModal(false)}
      profileUrl={profileUrl}
      username={profile.username}
    />
  )}
</AnimatePresence>
    </>
  );
}

// 🔹 Section glacial animée — inchangée
const GlacialSection = ({ 
  title, 
  children 
}: { 
  title?: string; 
  children: React.ReactNode; 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    className="relative overflow-hidden rounded-2xl"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-blue-900/15"></div>
    <Card className="glass-border relative z-10 bg-white/5 backdrop-blur-xl border border-white/15">
      {title && (
        <div className="px-6 pt-6 pb-3">
          <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
            <UserCheck className="text-cyan-300" /> {title}
          </h2>
        </div>
      )}
      <div className="px-6 pb-6">{children}</div>
    </Card>
  </motion.div>
);

// 🔹 Lien élégant — inchangé
const LinkItem = ({ href, label }: { href: string; label: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="block group">
    <Button 
      variant="outline" 
      className="w-full justify-start border-white/15 text-cyan-200 hover:bg-white/10 transition-all group-hover:scale-[1.02]"
    >
      <ExternalLink size={16} className="mr-2 group-hover:rotate-12 transition-transform" />
      {label}
    </Button>
  </a>
);