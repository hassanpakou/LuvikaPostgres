'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Phone, Mail, MessageCircle, MapPin,
  Instagram, Globe, Download, QrCode, ExternalLink,
  CheckCircle, AlertTriangle, UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlacialLikeButton from './GlacialLikeButton';
import ScanTracker from './ScanTracker';
import QRModal from './QRModal';
import ContactForm from './ContactForm';
import { Card } from '@/components/ui/card';

const isSectionVisible = (section: string, profile: Profile): boolean => {
  return profile.sections_visibility?.[section] !== false;
};

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
  plan?: string | null;
  nfc_cards?: { status: string }[];
  accepts_contact_requests?: boolean;
  sections_visibility?: Record<string, boolean>;
  cover_url?: string | null;
};

export default function PublicProfileClient({ profile }: { profile: Profile }) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [hasLostCard, setHasLostCard] = useState(false);

  useEffect(() => {
    const activeOrLostCards = (profile.nfc_cards || []).filter(
      (card: any) => card.status === 'active' || card.status === 'lost'
    );
    setHasLostCard(activeOrLostCards.some((card: any) => card.status === 'lost'));

    fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profile.id, scan_type: 'qr_profile' }),
    }).catch(console.warn);
  }, [profile.id]);

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app').replace(/\/+$/, '');
  const profileUrl = `${baseUrl}/${profile.username}`;

  // 🔹 ✅ Nettoyage robuste + LOGS
  const rawCoverUrl = profile.cover_url;
const cleanCoverUrl = (rawCoverUrl || '')
  .replace(/\u00A0/g, ' ') // Remplace espaces insécables par espaces normaux
  .replace(/\s+/g, ' ')    // Réduit plusieurs espaces à un seul
  .trim();                 // Supprime espaces début/fin  
  const coverUrl = cleanCoverUrl && cleanCoverUrl !== 'null' && cleanCoverUrl !== ''
    ? cleanCoverUrl.startsWith('http')
      ? cleanCoverUrl
: cleanCoverUrl.startsWith('http')
  ? cleanCoverUrl
  : `${baseUrl}/${cleanCoverUrl.replace(/^\/+/, '')}`
      : '/cover-default.png';

  // 🔹 ✅ LOGS DÉTAILLÉS AU MONTAGE
  useEffect(() => {
    console.group('🔍 Cover URL Debug');
    console.log('• profile.cover_url (brut) =', JSON.stringify(rawCoverUrl));
    console.log('• Après trim + clean =', JSON.stringify(cleanCoverUrl));
    console.log('• URL finale utilisée =', coverUrl);

    // 🔹 Test réseau asynchrone
    const img = new Image();
    img.onload = () => console.log('✅ Image chargée avec succès');
    img.onerror = (e) => console.warn('❌ Échec du chargement de l’image', e);
    img.src = coverUrl;
    
    console.groupEnd();
  }, [profile.cover_url]);

  return (
    <div className="relative min-h-screen">
      {/* 🔹 Photo de couverture */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `url(${encodeURI(coverUrl)})`,
          backgroundColor: '',
        }}
      />

      <div className="container mx-auto px-4 pb-12 max-w-3xl relative z-10">
        {/* 🔹 En-tête — photo + badge intégré */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-7"
        >
          <div className="relative inline-block">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white border-4 border-white/30 shadow-xl mx-auto">
              {profile.full_name?.charAt(0).toUpperCase() || '?'}
            </div>

            {/* 🔹 BADGE PLAN — croché, texte complet */}
            {profile.plan && profile.plan !== 'basic' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -top-2 -right-2"
              >
                <Badge className={`px-2 py-0.5 text-xs font-medium rounded-full border border-white/20 shadow ${
                  profile.plan === 'premium'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
                }`}>
                  {profile.plan === 'premium' ? 'Premium' : 'Entreprise'}
                </Badge>
              </motion.div>
            )}

            {/* 🔹 Bouton QR */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQRModal(true)}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center shadow border border-white/20"
              aria-label="QR Code"
            >
              <QrCode className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          <motion.div className="mt-4">
            <p className="text-cyan-300 font-mono text-sm">@{profile.username}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1.5">{profile.full_name}</h1>
            {profile.job_title && (
              <p className="text-gray-300 mt-0.5">{profile.job_title}{profile.company && ` · ${profile.company}`}</p>
            )}
          </motion.div>

          {/* 🔹 Like & statut NFC */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 flex justify-center gap-5"
          >
            <div className="text-center">
              <GlacialLikeButton profileId={profile.id} initialLikes={profile.likes_count || 0} />
              <p className="text-gray-400 text-xs mt-1">J’aime</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5">
                {hasLostCard ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                )}
                <span className={`text-xs font-medium ${
                  hasLostCard ? 'text-yellow-300' : 'text-emerald-300'
                }`}>
                  {hasLostCard ? 'Perdue' : 'Active'}
                </span>
              </div>
            </div>
          </motion.div>

          {profile.bio_short && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-300 mt-4 text-sm max-w-xl mx-auto leading-relaxed"
            >
              {profile.bio_short}
            </motion.p>
          )}
        </motion.div>

        {/* 🔹 Grille compacte — icônes 20px, gap-1.5, SANS fond */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 md:grid-cols-4 gap-1.5 mb-6"
        >
          {isSectionVisible('contact', profile) && profile.email && (
            <ActionItem icon={<Mail className="w-5 h-5 text-cyan-400" />} label="Email" href={`mailto:${profile.email}`} />
          )}
          {isSectionVisible('contact', profile) && profile.phone && (
            <ActionItem icon={<Phone className="w-5 h-5 text-green-400" />} label="Appeler" href={`tel:${profile.phone}`} />
          )}
          {isSectionVisible('contact', profile) && profile.whatsapp && (
            <ActionItem 
              icon={<MessageCircle className="w-5 h-5 text-emerald-400" />} 
              label="WhatsApp" 
              href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`} 
            />
          )}
          {profile.address && (
            <ActionItem 
              icon={<MapPin className="w-5 h-5 text-amber-400" />} 
              label="Carte" 
              href={`https://maps.google.com/?q=${encodeURIComponent(profile.address)}`} 
            />
          )}
          {profile.website && (
            <ActionItem icon={<Globe className="w-5 h-5 text-blue-400" />} label="Site" href={profile.website} />
          )}
          {profile.instagram && (
            <ActionItem 
              icon={<Instagram className="w-5 h-5 text-pink-400" />} 
              label="IG" 
              href={`https://instagram.com/${profile.instagram.trim()}`} 
            />
          )}
          <ActionItem
            icon={<Download className="w-5 h-5 text-purple-400" />}
            label="vCard"
            onClick={() => {
              const vCard = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${profile.full_name}\r\nORG:${profile.company || ''}\r\nTITLE:${profile.job_title || ''}\r\nTEL;TYPE=WORK,VOICE:${profile.phone || ''}\r\nTEL;TYPE=CELL,VOICE:${profile.whatsapp || ''}\r\nEMAIL:${profile.email || ''}\r\nADR;TYPE=WORK:;;${profile.address || ''};;;;\r\nURL:${profile.website || ''}\r\nNOTE:Contact via LUVIKA — luvika.me/${profile.username}\r\nEND:VCARD`;
              const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${profile.username}.vcf`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          />
        </motion.div>

        {/* 🔹 Sections */}
        <div className="space-y-5">
          {profile.bio_long && isSectionVisible('bio', profile) && (
            <Section title="À propos" icon={<UserCheck className="text-cyan-400 w-5 h-5" />}>
              <p className="text-gray-300 text-sm leading-relaxed">
                {profile.bio_long}
              </p>
            </Section>
          )}

          {profile.accepts_contact_requests && isSectionVisible('contact', profile) && (
            <Section title="Message" icon={<Mail className="text-cyan-400 w-5 h-5" />}>
              <ContactForm profileId={profile.id} />
            </Section>
          )}
        </div>

        <ScanTracker profileId={profile.id} />

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 text-center text-gray-500 text-xs"
        >
          <a href="/" className="text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1">
            luvika.dev <ExternalLink className="w-3 h-3" />
          </a>
        </motion.footer>
      </div>

      <AnimatePresence>
        {showQRModal && (
          <QRModal
            key="qr-modal"
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            profileUrl={profileUrl}
            username={profile.username}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const ActionItem = ({ icon, label, href, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  href?: string; 
  onClick?: () => void; 
}) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={(e) => { if (onClick) { e.preventDefault(); onClick(); } }}
    className="flex flex-col items-center p-2.5 rounded-lg hover:bg-white/5 transition-colors"
  >
    {icon}
    <span className="text-[11px] text-gray-300 mt-1">{label}</span>
  </motion.button>
);

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Card className="border border-white/10 bg-transparent">
    <div className="px-4 pt-3 pb-2 border-b border-white/5">
      <h2 className="text-base font-semibold text-white flex items-center gap-2">
        {icon} {title}
      </h2>
    </div>
    <div className="px-4 pb-4">{children}</div>
  </Card>
);