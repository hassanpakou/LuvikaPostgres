// src/components/profile/PublicProfileClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // ✅ importé
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Phone, Mail, MessageCircle, MapPin,
  Instagram, Globe, Download, QrCode, ExternalLink,
  CheckCircle, UserCheck, ArrowUp, ChevronDown, Send, Link as LinkIcon,
  Cake, Tag, Briefcase, Calendar, Github, Linkedin, Gitlab, FileText
} from 'lucide-react';
import { SiTiktok } from "react-icons/si";
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
import { Folder, Award } from 'lucide-react';
import FollowButton from './FollowButton';
import ActionItem from './ActionItem';
import ProfileActions from './ProfileActions';
import { createClient } from '@/src/lib/supabase/client'; // ✅ importé

// 🔹 Types (inchangé)
type Profile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio_short: string | null;
  bio_long: string | null;
  job_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  likes_count?: number;
  nfc_cards?: { status: string }[];
  tiktok: string | null;
  linkedin: string | null;
  snapchat: string | null;
  telegram: string | null;
  github: string | null;
  gitlab: string | null;
  behance: string | null;
  dribbble: string | null;
  calendly: string | null;
  portfolio_url: string | null;
  cv_url: string | null;
  nickname: string | null;
  pronouns: string | null;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  city: string | null;
  country: string | null;
  timezone: string | null;
  availability: 'available' | 'unavailable' | 'by_appointment' | null;
  skills: string[] | null;
  professional_status: 'student' | 'employed' | 'freelance' | 'open_to_work' | 'other' | null;
  website: string | null;
  address: string | null;
  theme: { primary: string; background: string };
  is_public: boolean;
  sections_visibility: Record<string, boolean>;
  plan: string;
  accepts_contact_requests: boolean;
  hide_birth_year: boolean;
  disable_birthday_icon: boolean;
  verified: boolean;
};

type Props = {
  profile: Profile;
  followers: number;
  following: number;
  isOwner: boolean;
  isInitiallyFollowing: boolean;
  currentUserId: string | null;
  onFollowChange?: (newCount: number, isNowFollowing: boolean) => void;
};

// 🔹 BioToggle (inchangé)
const BioToggle = ({ bio }: { bio: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const contentRef = useRef<HTMLParagraphElement>(null);
  const truncatedRef = useRef<HTMLParagraphElement>(null);

  const words = bio.split(' ');
  const truncated = words.length > 30 
    ? words.slice(0, 30).join(' ') + '…' 
    : bio;

// 🔹 Dans PublicProfileClient.tsx

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

const isBirthdayToday = (profile: Profile) => {
  if (!profile.birth_day || !profile.birth_month || profile.disable_birthday_icon) return false;
  const today = new Date();
  return today.getDate() === profile.birth_day && today.getMonth() + 1 === profile.birth_month;
};

const getMonthName = (month: number): string => {
  const months = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  return months[month - 1] || '';
};

export default function PublicProfileClient({
  profile,
  followers: initialFollowers = 0,
  following: initialFollowing = 0,
  isOwner = false,
  isInitiallyFollowing = false,
  currentUserId = null,
  onFollowChange,
}: Props) {
  const router = useRouter(); // ✅ instancié
  const [showQRModal, setShowQRModal] = useState(false);
  const [hasLostCard, setHasLostCard] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [scansCount, setScansCount] = useState(0);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  // 🔹 ✅ États critiques ajoutés
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowers);
 useEffect(() => {
    setIsFollowing(isInitiallyFollowing);
    setFollowersCount(initialFollowers);
  }, [isInitiallyFollowing, initialFollowers]);

  // 🔹 ✅ Fonction déplacée ici — scope correct
  const handleFollowToggle = async () => {
    if (!currentUserId) return router.push('/auth/sign-in');

    const supabase = createClient(); // ✅ utilisé

    if (isFollowing) {
      // Unfollow
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('followed_id', profile.id);
      onFollowChange?.(followersCount - 1, false);
    } else {
      // Follow
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, followed_id: profile.id });
      onFollowChange?.(followersCount + 1, true);
    }

    setIsFollowing(!isFollowing);
    setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
  };
 // 🔹 Effets inchangés…
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
      : `${baseUrl}/${cleanCoverUrl.replace(/^\/+/, '')}`
    : '/default.png';

  const [bubbles, setBubbles] = useState<Array<{id: number, w: number, h: number, l: number, t: number}>>([]);
  useEffect(() => {
    const generated = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      w: 6 + Math.random() * 20,
      h: 6 + Math.random() * 20,
      l: Math.random() * 100,
      t: Math.random() * 100,
    }));
    setBubbles(generated);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background animé */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-indigo-900/5"></div>
        <div className="absolute inset-0 overflow-hidden">
          {bubbles.map(bubble => (
            <motion.div
              key={bubble.id}
              className="absolute rounded-full bg-white/5"
              style={{
                width: `${bubble.w}px`,
                height: `${bubble.h}px`,
                left: `${bubble.l}%`,
                top: `${bubble.t}%`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, Math.sin(bubble.id) * 30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + bubble.id * 0.7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: bubble.id * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-3xl relative z-10">
        {/* En-tête */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white border-4 border-white/30 shadow-xl mx-auto"
            >
              {profile.full_name?.charAt(0).toUpperCase() || '?'}
            </motion.div>

            {profile.plan && profile.plan !== 'basic' && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQRModal(true)}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg border border-white/20"
              aria-label="Afficher QR Code"
            >
              <QrCode className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-cyan-300 font-mono text-sm flex items-center justify-center gap-1">
              @{profile.username}
              {profile.verified && (
                <img 
                  src="/badge.png" 
                  alt="✅ Vérifié" 
                  className="w-4 h-4 rounded-full"
                  title="Profil vérifié"
                />
              )}
            </p>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 flex items-center justify-center gap-2">
              {profile.full_name}
              {isBirthdayToday(profile) && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  title="Joyeux anniversaire ! 🎉"
                >
                  <Cake className="w-6 h-6 text-pink-400" />
                </motion.div>
              )}
            </h1>
            
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-gray-400 text-sm">
              {profile.nickname && <span className="font-medium">{profile.nickname}</span>}
              {profile.pronouns && <span className="px-2 py-0.5 bg-white/5 rounded">{profile.pronouns}</span>}
              {profile.job_title && (
                <span>
                  {profile.job_title}{profile.company && ` · ${profile.company}`}
                </span>
              )}
              {profile.professional_status && (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-cyan-500/20 text-cyan-400 rounded-full">
                  {profile.professional_status === 'student' && 'Étudiant'}
                  {profile.professional_status === 'employed' && 'En poste'}
                  {profile.professional_status === 'freelance' && 'Freelance'}
                  {profile.professional_status === 'open_to_work' && 'Ouvert'}
                  {profile.professional_status === 'other' && 'Autre'}
                </span>
              )}
            </div>

            {scansCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-3 flex items-center justify-center gap-2"
              >
                <BadgeLevel info={getBadgeInfo(scansCount)} />
                <span className="text-gray-400 text-sm">{scansCount} scan{scansCount > 1 ? 's' : ''}</span>
              </motion.div>
            )}
          </motion.div>
        </motion.header>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="mt-6 flex flex-wrap justify-center gap-4"
        >
          <StatBox label="J’aime">
            <GlacialLikeButton profileId={profile.id} initialLikes={profile.likes_count || 0} />
          </StatBox>
          <StatBox label="Followers">{followersCount}</StatBox>
          {initialFollowing > 0 && <StatBox label="Suivi(e)s">{initialFollowing}</StatBox>}
          <StatBox label="Carte NFC">
            <motion.div
              animate={{ 
                boxShadow: hasLostCard 
                  ? '0 0 0px rgb(250,204,21,0)' 
                  : '0 0 12px rgb(16,185,129,0.35)'
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
                hasLostCard
                  ? 'border-yellow-400/40 text-yellow-400 bg-yellow-400/10'
                  : 'border-emerald-400/40 text-emerald-400 bg-emerald-400/10'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {hasLostCard ? 'Perdue' : 'Active'}
            </motion.div>
          </StatBox>
        </motion.div>

        {/* Bouton Suivre — utilise handleFollowToggle */}
        {!isOwner && currentUserId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex justify-center"
          >
            <Button
              size="sm"
              variant={isFollowing ? "default" : "outline"}
              className={`flex items-center gap-2 ${
                isFollowing 
                  ? 'bg-red-600 hover:bg-red-500' 
                  : 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10'
              }`}
              onClick={handleFollowToggle}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4" /> Déjà abonné
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" /> Suivre
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* ... reste du JSX inchangé ... */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-300 mt-6 text-center max-w-2xl mx-auto leading-relaxed"
        >
          {profile.bio_short}
        </motion.p>

        {/* Sections suivantes inchangées — juste passer followersCount au besoin */}
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
          className="space-y-6"
        >
          {profile.bio_long && isSectionVisible('bio', profile) && (
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <Section title="À propos" icon={<UserCheck className="text-cyan-400 w-5 h-5" />}>
                <BioToggle bio={profile.bio_long} />
              </Section>
            </motion.div>
          )}
          {isSectionVisible('portfolio', profile) && portfolios.length > 0 && (
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <CollapsibleSection
                title="Projets"
                icon={<Folder className="text-cyan-400 w-5 h-5" />}
                itemCount={portfolios.length}
                defaultOpen={false}
              >
                <PortfolioSection items={portfolios} />
              </CollapsibleSection>
            </motion.div>
          )}
          {isSectionVisible('certificates', profile) && certificates.length > 0 && (
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <CollapsibleSection
                title="Certifications"
                icon={<Award className="text-yellow-400 w-5 h-5" />}
                itemCount={certificates.length}
                defaultOpen={false}
              >
                <CertificatesSection items={certificates} />
              </CollapsibleSection>
            </motion.div>
          )}
        </motion.div>

        <ScanTracker profileId={profile.id} />

        <AnimatePresence>
          {showQRModal && (
            <QRModal
              key="qr-modal"
              isOpen={showQRModal}
              onClose={() => setShowQRModal(false)}
              profileUrl={profileUrl}
              username={profile.username}
              shortUrl={shortUrl}
            />
          )}
          {isContactModalOpen && (
            <ContactModal
              key="contact-modal"
              isOpen={isContactModalOpen}
              onClose={() => setIsContactModalOpen(false)}
              profileId={profile.id}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// 🔹 Composants enfants (inchangés)
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