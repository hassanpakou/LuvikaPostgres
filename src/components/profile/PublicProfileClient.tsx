'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Phone, Mail, MessageCircle, MapPin,
  Instagram, Globe, Download, QrCode, ExternalLink,
  CheckCircle, AlertTriangle, UserCheck, ArrowUp, ArrowRight, ChevronDown, Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlacialLikeButton from './GlacialLikeButton';
import ScanTracker from './ScanTracker';
import QRModal from './QRModal';
import { Card } from '@/components/ui/card';
import ContactModal from './ContactModal'; // ✅ Bon nom

// 🔹 Types
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

type Props = {
  profile: Profile;
  followers?: number;
  following?: number;
};

// 🔹 Composant BioToggle — LUVIKA style
// 🔹 BioToggle avec animation fluide (height + opacity)
const BioToggle = ({ bio }: { bio: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const contentRef = useRef<HTMLParagraphElement>(null);
  const truncatedRef = useRef<HTMLParagraphElement>(null);

  const words = bio.split(' ');
  const truncated = words.length > 30 
    ? words.slice(0, 30).join(' ') + '…' 
    : bio;

  // 🔹 Calcule la hauteur cible pour l'animation
  useEffect(() => {
    if (!contentRef.current || !truncatedRef.current) return;

    const fullHeight = contentRef.current.scrollHeight;
    const truncHeight = truncatedRef.current.scrollHeight;

    if (expanded) {
      setHeight(truncHeight);
      // ⏳ Ralenti doux : d'abord fixe la hauteur petite, puis passe à `auto`
      requestAnimationFrame(() => {
        setHeight('auto');
      });
    } else {
      // ⏳ Ralenti doux : d'abord fixe la hauteur grande, puis rétrécit
      setHeight(fullHeight);
      requestAnimationFrame(() => {
        setHeight(truncHeight);
      });
    }
  }, [expanded, bio]);
const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  return (
    <div className="relative overflow-hidden">
      {/* 🔹 Contenu complet (invisible, pour mesure) */}
      <p 
        ref={contentRef}
        className="absolute opacity-0 pointer-events-none whitespace-pre-line"
      >
        {bio}
      </p>

      {/* 🔹 Contenu affiché */}
      <motion.p
        initial={false}
        animate={{ height }}
        transition={{ 
          duration: 0.4, 
          ease: [0.34, 1.56, 0.64, 1], // ⏳ ralenti doux (easeOutCirc-like)
        }}
        className="text-gray-300 text-sm leading-relaxed overflow-hidden"
      >
        <span
          ref={truncatedRef}
          className={`inline-block transition-opacity duration-300 ${
            expanded ? 'opacity-100' : 'opacity-100'
          }`}
        >
          {expanded ? bio : truncated}
        </span>
      </motion.p>

      {words.length > 30 && (
        <motion.button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1.5 group"
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
        >
          {expanded ? (
            <>
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
              Voir moins
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              Voir plus
            </>
          )}
          <motion.span
            initial={{ rotate: 0 }}
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="inline-block"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.span>
        </motion.button>
      )}
    </div>
  );
};
// 🔹 Helpers
const isSectionVisible = (section: string, profile: Profile): boolean => {
  return profile.sections_visibility?.[section] !== false;
};

// 🔹 Composant principal
export default function PublicProfileClient({
  profile,
  followers = 0,
  following = 0,
}: Props) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [hasLostCard, setHasLostCard] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false); // ✅ ICI

  useEffect(() => {
    const activeOrLostCards = (profile.nfc_cards || []).filter(
      (card) => card.status === 'active' || card.status === 'lost'
    );
    setHasLostCard(activeOrLostCards.some((card) => card.status === 'lost'));

    fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: profile.id, scan_type: 'qr_profile' }),
    }).catch(console.warn);
  }, [profile.id]);

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app')
    .replace(/\s+$/, '')
    .replace(/\/+$/, '');
  const profileUrl = `${baseUrl}/${profile.username}`;

  // 🔹 Cover URL sécurisée
  const cleanCoverUrl = (profile.cover_url || '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const coverUrl = cleanCoverUrl && cleanCoverUrl !== 'null' && cleanCoverUrl !== ''
    ? cleanCoverUrl.startsWith('http')
      ? cleanCoverUrl
      : `${baseUrl}/${cleanCoverUrl.replace(/^\/+/, '')}`
    : '/default.png';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = encodeURI(coverUrl);
      img.onload = () => console.log('✅ Cover image loaded');
      img.onerror = () => console.warn('⚠️ Cover image failed');
    }
  }, [coverUrl]);

  return (
    <div className="relative min-h-screen">
      {/* 🔹 Arrière-plan */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${encodeURI(coverUrl)})` }}
      />

      <div className="container mx-auto px-4 pb-12 max-w-3xl relative z-10">
        {/* 🔹 En-tête */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-7"
        >
          <div className="relative inline-block">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white border-4 border-white/30 shadow-xl mx-auto">
              {profile.full_name?.charAt(0).toUpperCase() || '?'}
            </div>

            {/* 🔹 Badge plan */}
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
                  {profile.plan === 'premium' ? '⭐ Premium' : '🚀 Entreprise'}
                </Badge>
              </motion.div>
            )}

            {/* 🔹 Bouton QR */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQRModal(true)}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center shadow border border-white/20"
              aria-label="Afficher QR Code"
            >
              <QrCode className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* 🔹 Identité */}
          <motion.div className="mt-4">
            <p className="text-cyan-300 font-mono text-sm">@{profile.username}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1.5">{profile.full_name}</h1>
            {profile.job_title && (
              <p className="text-gray-300 mt-0.5">
                {profile.job_title}{profile.company && ` · ${profile.company}`}
              </p>
            )}
          </motion.div>

          {/* 🔹 Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 flex justify-center gap-5 text-center flex-wrap sm:flex-nowrap"
          >
            <StatBox label="J’aime">
              <GlacialLikeButton
                profileId={profile.id}
                initialLikes={profile.likes_count || 0}
              />
            </StatBox>

            <StatBox label="Followers">{followers}</StatBox>
            <StatBox label="Suivi(e)s">{following}</StatBox>

            <StatBox label="Carte NFC">
              <motion.div
                animate={{
                  boxShadow: hasLostCard
                    ? '0 0 0px rgba(250,204,21,0)'
                    : '0 0 12px rgba(16,185,129,0.35)',
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'mirror',
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  hasLostCard
                    ? 'border-yellow-400/40 text-yellow-400 bg-yellow-400/10'
                    : 'border-emerald-400/40 text-emerald-400 bg-emerald-400/10'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {hasLostCard ? 'Perdue' : 'Active'}
              </motion.div>
            </StatBox>
          </motion.div>

          {/* 🔹 Bio courte */}
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
        </motion.header>

        {/* 🔹 Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-flow-col auto-cols-max gap-2 justify-center mb-6"
        >
          {isSectionVisible('contact', profile) && profile.email && (
            <ActionItem
              icon={<Mail className="w-5 h-5 text-cyan-400" />}
              label="Email"
              href={`mailto:${profile.email}`}
            />
          )}
          {isSectionVisible('contact', profile) && profile.phone && (
            <ActionItem
              icon={<Phone className="w-5 h-5 text-green-400" />}
              label="Appeler"
              href={`tel:${profile.phone}`}
            />
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
            <ActionItem
              icon={<Globe className="w-5 h-5 text-blue-400" />}
              label="Site"
              href={profile.website}
            />
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
          {/* 🔹 Section À propos — version compacte animée */}
            {profile.bio_long && isSectionVisible('bio', profile) && (
              <Section title="À propos" icon={<UserCheck className="text-cyan-400 w-5 h-5" />}>
                <BioToggle bio={profile.bio_long} />
              </Section>
            )}

          {/* 🔹 ✅ Bouton contact → modal */}
{profile.accepts_contact_requests && isSectionVisible('contact', profile) && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    className="text-center"
  >
    <button
      onClick={() => setIsContactModalOpen(true)}
      className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30 hover:shadow-lg transition-all group"
    >
      <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="font-medium">Laissez-moi vos contacts</span>
      <Send className="w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
  </motion.div>
)}
            {/* 🔹 Modal contact */}
            <ContactModal
              isOpen={isContactModalOpen}
              onClose={() => setIsContactModalOpen(false)}
              profileId={profile.id}
            />
        </div>

        {/* 🔹 Scan tracker */}
        <ScanTracker profileId={profile.id} />

        {/* 🔹 Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 text-center text-gray-500 text-xs"
        >
          <a
            href="/"
            className="text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1"
          >
            luvika.dev <ExternalLink className="w-3 h-3" />
          </a>
        </motion.footer>
      </div>

      {/* 🔹 QR Modal */}
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

// 🔹 Composants enfants
const StatBox = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-[64px] flex flex-col items-center">
    <div className="text-xl font-semibold text-white leading-tight">{children}</div>
    <div className="text-gray-400 text-[11px] mt-0.5">{label}</div>
  </div>
);

const ActionItem = ({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}) => {
  if (href) {
    return (
      <motion.a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        whileHover={{ y: -2, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center p-2 gap-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10"
      >
        <span className="text-gray-300 hover:text-white transition-colors">{icon}</span>
        <span className="text-[11px] text-gray-400 whitespace-nowrap">{label}</span>
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center p-2 gap-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10"
    >
      <span className="text-gray-300 hover:text-white transition-colors">{icon}</span>
      <span className="text-[11px] text-gray-400 whitespace-nowrap">{label}</span>
    </motion.button>
  );
};

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