// src/components/profile/PublicProfileClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Phone, Mail, MessageCircle, MapPin,
  Instagram, Globe, Download, QrCode, ExternalLink,
  CheckCircle, UserCheck, ArrowUp, ChevronDown, Send, Link as LinkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlacialLikeButton from './GlacialLikeButton';
import ScanTracker from './ScanTracker';
import QRModal from './QRModal';
import { Card } from '@/components/ui/card';
import ContactModal from './ContactModal';
import BadgeLevel from '@/src/components/ui/BadgeLevel';
import { getBadgeInfo } from '@/src/lib/utils/badgeLevel';
import PortfolioSection from './PortfolioSection';
import CertificatesSection from './CertificatesSection';
import CollapsibleSection from './CollapsibleSection';
import { Folder, Award } from 'lucide-react'; // Ajoute ces icônes si absentes
import FollowButton from './FollowButton';
import ActionItem from './ActionItem'; // ✅ Remplace l'ancien composant local
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
  isOwner?: boolean;
  isInitiallyFollowing?: boolean;
  currentUserId?: string | null;
};

// 🔹 BioToggle avec animation fluide
const BioToggle = ({ bio }: { bio: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const contentRef = useRef<HTMLParagraphElement>(null);
  const truncatedRef = useRef<HTMLParagraphElement>(null);


  const words = bio.split(' ');
  const truncated = words.length > 30 
    ? words.slice(0, 30).join(' ') + '…' 
    : bio;

  useEffect(() => {
    if (!contentRef.current || !truncatedRef.current) return;
    const fullHeight = contentRef.current.scrollHeight;
    const truncHeight = truncatedRef.current.scrollHeight;
    if (expanded) {
      setHeight(truncHeight);
      requestAnimationFrame(() => setHeight('auto'));
    } else {
      setHeight(fullHeight);
      requestAnimationFrame(() => setHeight(truncHeight));
    }
  }, [expanded, bio]);


  return (
    <div className="relative overflow-hidden">
      <p ref={contentRef} className="absolute opacity-0 pointer-events-none whitespace-pre-line">
        {bio}
      </p>
      <motion.p
        initial={false}
        animate={{ height }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="text-gray-300 text-sm leading-relaxed overflow-hidden"
      >
        <span ref={truncatedRef} className="inline-block transition-opacity duration-300">
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
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.span>
        </motion.button>
      )}
    </div>
  );
};

const isSectionVisible = (section: string, profile: Profile): boolean => {
  return profile.sections_visibility?.[section] !== false;
};

export default function PublicProfileClient({
  profile,
  followers = 0,
  following = 0,
  isOwner = false,
  isInitiallyFollowing = false,
  currentUserId = null,
}: Props) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [hasLostCard, setHasLostCard] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const [scansCount, setScansCount] = useState(0);

  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

useEffect(() => {
  const fetchPortfolio = async () => {
    const res = await fetch(`/api/portfolio?profile_id=${profile.id}`);
    const { portfolios, certificates } = await res.json();
    setPortfolios(portfolios);
    setCertificates(certificates);
  };
  fetchPortfolio();
}, [profile.id]);

useEffect(() => {
  fetch(`/api/analytics?profile_id=${profile.id}&range=all`)
    .then(res => res.json())
    .then(data => setScansCount(data.total || 0))
    .catch(console.warn);
}, [profile.id]);

  useEffect(() => {
    const activeOrLostCards = (profile.nfc_cards || []).filter(
      card => card.status === 'active' || card.status === 'lost'
    );
    setHasLostCard(activeOrLostCards.some(card => card.status === 'lost'));

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
  const shortId = profile.id.substring(0, 6).replace(/[+/]/g, 'x').toLowerCase();
  const shortUrl = `https://luvika.me/u/${shortId}`;

  const cleanCoverUrl = (profile.cover_url || '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const coverUrl = cleanCoverUrl && cleanCoverUrl !== 'null' && cleanCoverUrl !== ''
  ? cleanCoverUrl.startsWith('http')
    ? cleanCoverUrl
    : `https://${baseUrl.replace('https://', '').split('/')[0]}/${cleanCoverUrl.replace(/^\/+/, '')}`
  : '/default.png'; // ✅ reste absolu

  return (
    <div className="relative min-h-screen">
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

          <motion.div className="mt-4">
  <p className="text-cyan-300 font-mono text-sm">@{profile.username}</p>
  <h1 className="text-2xl md:text-3xl font-bold text-white mt-1.5">{profile.full_name}</h1>
  
  {/* 🔹 ✅ Badge gamification — une seule fois */}
  {scansCount > 0 && (
    <div className="mt-2 flex items-center gap-2">
      <BadgeLevel info={getBadgeInfo(scansCount)} />
      <span className="text-gray-400 text-xs">{scansCount} scan{scansCount > 1 ? 's' : ''}</span>
    </div>
  )}

  {profile.job_title && (
    <p className="text-gray-300 mt-0.5">
      {profile.job_title}{profile.company && ` · ${profile.company}`}
    </p>
  )}
</motion.div>

<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.25 }}
  className="mt-6 flex justify-center gap-5 text-center flex-wrap sm:flex-nowrap"
>
  <StatBox label="J’aime">
    <GlacialLikeButton profileId={profile.id} initialLikes={profile.likes_count || 0} />
  </StatBox>
 <StatBox label="Followers">{followers}</StatBox>
  
  {/* 🔹 ✅ Masque "Suivi(e)s" si suivis = 0 ET pas de session */}
  {following > 0 && (
    <StatBox label="Suivi(e)s">{following}</StatBox>
  )}
            <StatBox label="Carte NFC">
              <motion.div
                animate={{ boxShadow: hasLostCard ? '0 0 0px rgba(250,204,21,0)' : '0 0 12px rgba(16,185,129,0.35)' }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}
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
{/* 🔹 ✅ ICI — après les stats, AVANT les actions */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.35 }}
  className="mt-4 flex justify-center"
>
  {!isOwner && currentUserId && (
    <FollowButton
      targetId={profile.id}
      isInitiallyFollowing={isInitiallyFollowing}
    />
  )}
  {!isOwner && !currentUserId && (
    <Button
      size="sm"
      variant="outline"
      className="flex items-center gap-2 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
      onClick={() => window.location.href = '/auth/sign-in'}
    >
      <UserCheck className="w-4 h-4" />
      Suivre
    </Button>
  )}
</motion.div>
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
        </motion.header>

{/* 🔹 Actions — ✅ Centrées, responsive, sans débordement */}
{/* 🔹 Actions — ✅ Centrées, tooltip-friendly */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.5 }}
  className="w-full px-2"
>
  <div className="max-w-5xl mx-auto">
    {/* 🔹 ✅ Flex + wrap + center → centrage parfait */}
    <div className="flex flex-wrap justify-center gap-2 md:gap-3 py-3">
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
      {/* 🔹 vCard classique */}
      <ActionItem
        icon={<Download className="w-5 h-5 text-purple-400" />}
        label="vCard"
        onClick={() => {
          const vCard = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${profile.full_name}\r\nORG:${profile.company || ''}\r\nTITLE:${profile.job_title || ''}\r\nTEL;TYPE=WORK,VOICE:${profile.phone || ''}\r\nTEL;TYPE=CELL,VOICE:${profile.whatsapp || ''}\r\nEMAIL:${profile.email || ''}\r\nADR;TYPE=WORK:;;${profile.address || ''};;;;\r\nURL:${profile.website || ''}\r\nNOTE:Contact via LUVIKA — ${shortUrl}\r\nEND:VCARD`;
          const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${profile.username}.vcf`;
          a.click();
          URL.revokeObjectURL(url);
        }}
      />
      {/* 🔹 vCard Pro+ */}
      {profile.bio_long && isSectionVisible('contact', profile) && (
        <ActionItem
          icon={<QrCode className="w-5 h-5 text-indigo-400" />}
          label="Pro+"
          onClick={async () => {
            const url = `/api/vcard?username=${profile.username}`;
            const res = await fetch(url);
            if (res.ok) {
              const blob = await res.blob();
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = `${profile.username}_luvika_pro.vcf`;
              a.click();
              URL.revokeObjectURL(a.href);
            } else {
              alert('❌ Échec vCard Pro+');
            }
          }}
        />
      )}
    </div>
  </div>
</motion.div>
{/* 🔹 ✅ Espace vertical après les actions */}
<div className="h-6"></div>
        {/* 🔹 Sections */}
<div className="space-y-3">
{profile.accepts_contact_requests && isSectionVisible('contact', profile) && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="text-center -mt-2" /* 🔹 ✅ -mt-2 annule l’espacement excessif */
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
  <ContactModal
    isOpen={isContactModalOpen}
    onClose={() => setIsContactModalOpen(false)}
    profileId={profile.id}
  />
        {/* 🔹 Sections */}
<div className="space-y-1">
  {profile.bio_long && isSectionVisible('bio', profile) && (
    <Section title="À propos" icon={<UserCheck className="text-cyan-400 w-5 h-5" />}>
      <BioToggle bio={profile.bio_long} />
    </Section>
  )}

  {/* 🔹 Section Portfolio — collapsible */}
  {isSectionVisible('portfolio', profile) && portfolios.length > 0 && (
    <CollapsibleSection
      title="Projets"
      icon={<Folder className="text-cyan-400 w-5 h-5" />}
      itemCount={portfolios.length}
      defaultOpen={false}
    >
      <PortfolioSection items={portfolios} />
    </CollapsibleSection>
  )}

  {/* 🔹 Section Certificates — collapsible */}
  {isSectionVisible('certificates', profile) && certificates.length > 0 && (
    <CollapsibleSection
      title="Certifications"
      icon={<Award className="text-yellow-400 w-5 h-5" />}
      itemCount={certificates.length}
      defaultOpen={false}
    >
      <CertificatesSection items={certificates} />
    </CollapsibleSection>
  )}
</div>
  
</div>

        <ScanTracker profileId={profile.id} />

             </div>

      <AnimatePresence>
        {showQRModal && (
          <QRModal
            key="qr-modal"
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            profileUrl={profileUrl}
            username={profile.username}
            shortUrl={shortUrl} // ✅ Passé ici
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