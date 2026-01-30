// src/components/profile/PublicProfileClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Phone, Mail, MessageCircle, MapPin,
  Instagram, Globe, Download, QrCode, ExternalLink, Crown,
  CheckCircle, UserCheck, ArrowUp, ChevronDown, Send, Link as LinkIcon,
  Cake, Tag, Briefcase, Calendar, Github, Linkedin, Gitlab, FileText, Share as ShareIcon,
  X, MoreVertical
} from 'lucide-react';
import { SiTiktok } from "react-icons/si";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlacialLikeButton from './GlacialLikeButton';
import ScanTracker from './ScanTracker';
import QRModal from './QRModal';
import { Card } from '@/components/ui/card';
import ContactModal from './ContactModal';
import BadgeLevel from '../../components/ui/BadgeLevel';
import { getBadgeInfo } from '../../lib/utils/badgeLevel';
import PortfolioSection from './PortfolioSection';
import CertificatesSection from './CertificatesSection';
import ProfileModal from './ProfileModal';
import { Folder, Award } from 'lucide-react';
import ActionItem from './ActionItem';
import FloatingButtons from './ProfileActions';
import ContactForm from './ContactForm';
import { createClient } from '../../lib/supabase/client';
import FollowersList from './FollowersList';
import FollowingList from './FollowersList';
import { PublicProfile } from '../../types/profile';

// 🔹 Types
type Profile = {
  created_at: any;
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

// 🔹 BioToggle
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
    <div className="relative">
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

const isSectionVisible = (section: string, localProfile: Profile): boolean => {
  return localProfile.sections_visibility?.[section] !== false;
};

const isBirthdayToday = (localProfile: Profile) => {
  if (!localProfile.birth_day || !localProfile.birth_month || localProfile.disable_birthday_icon) return false;
  const today = new Date();
  return today.getDate() === localProfile.birth_day && today.getMonth() + 1 === localProfile.birth_month;
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
  const router = useRouter();
  const [showQRModal, setShowQRModal] = useState(false);
  const [hasLostCard, setHasLostCard] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [scansCount, setScansCount] = useState(0);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowers);
  const [localProfile, setLocalProfile] = useState<Profile>(profile);

  // 🔹 Applique le thème dynamiquement
  useEffect(() => {
    const root = document.documentElement;
    const { primary = '#2563eb', background = '#0f172a' } = localProfile.theme || {};
    root.style.setProperty('--profile-primary', primary);
    root.style.setProperty('--profile-background', background);
  }, [localProfile.theme]);

  useEffect(() => {
    setIsFollowing(isInitiallyFollowing);
    setFollowersCount(initialFollowers);
  }, [isInitiallyFollowing, initialFollowers]);

  const handleFollowToggle = async () => {
    if (!currentUserId) return router.push('/auth/sign-in');

    const supabase = createClient();

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('followed_id', localProfile.id);
      onFollowChange?.(followersCount - 1, false);
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, followed_id: localProfile.id });
      onFollowChange?.(followersCount + 1, true);
    }

    setIsFollowing(!isFollowing);
    setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      const res = await fetch(`/api/portfolio?profile_id=${localProfile.id}`);
      const { portfolios, certificates } = await res.json();
      setPortfolios(portfolios);
      setCertificates(certificates);
    };
    fetchPortfolio();
  }, [localProfile.id]);

  useEffect(() => {
    fetch(`/api/analytics?profile_id=${localProfile.id}&range=all`)
      .then(res => res.json())
      .then(data => setScansCount(data.total || 0))
      .catch(console.warn);
  }, [localProfile.id]);

  useEffect(() => {
    const activeOrLostCards = (localProfile.nfc_cards || []).filter(
      card => card.status === 'active' || card.status === 'lost'
    );
    setHasLostCard(activeOrLostCards.some(card => card.status === 'lost'));

    fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id: localProfile.id, scan_type: 'qr_profile' }),
    }).catch(console.warn);
  }, [localProfile.id]);

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app')
    .replace(/\s+$/, '')
    .replace(/\/+$/, '');
  const profileUrl = `${baseUrl}/${profile.username}`;
  const shortId = localProfile.id.substring(0, 6).replace(/[+/]/g, 'x').toLowerCase();
  const shortUrl = `https://luvika.me/u/${shortId}`;

  const cleanCoverUrl = (localProfile.cover_url || '')
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

  // 🔹 Realtime updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`profile-${localProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`
        },
        (payload) => {
          setLocalProfile(prev => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [localProfile.id]);

  const [showContactModal, setShowContactModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showAvatarFullscreen, setShowAvatarFullscreen] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  return (
    <div className="relative min-h-screen dynamic-bg">
      {/* Styles dynamiques */}
      <style jsx global>{`
        :root {
          --profile-primary: #2563eb;
          --profile-background: ;
        }
        .dynamic-bg {
  background-color: transparent !important;
}

        .dynamic-border {
          border-color: var(--profile-primary) !important;
        }
        .dynamic-text {
          color: var(--profile-primary) !important;
        }
        .dynamic-gradient {
          background: linear-gradient(90deg, var(--profile-primary), #0ea5e9) !important;
        }
        .dynamic-button {
          background-color: var(--profile-primary) !important;
          border-color: var(--profile-primary) !important;
        }
        .dynamic-button:hover {
          opacity: 0.9;
        }
        .dynamic-badge {
          background-color: var(--profile-primary) !important;
          color: white !important;
        }
      `}</style>

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

<div className="relative w-full overflow-hidden">

          <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8 relative"
        >
          {/* Bannière de couverture */}
          {localProfile.cover_url && (
            <div className="absolute inset-x-0 top-0 h-48 overflow-hidden rounded-t-2xl">
              <img
                src={localProfile.cover_url}
                alt="Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
<div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-blue-900/40 to-transparent"></div>
            </div>
          )}

          <div className="relative inline-block mt-24">
            {localProfile.avatar_url ? (
              <motion.div className="relative">
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  src={localProfile.avatar_url}
                  alt={`${localProfile.full_name} avatar`}
                  onClick={() => setShowAvatarFullscreen(true)}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/30 shadow-xl mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                  }}
                />
                <motion.button
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                  className="absolute top-0 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MoreVertical className="w-4 h-4 text-white" />
                </motion.button>
                
                {showAvatarMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-12 right-0 bg-slate-900 border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = localProfile.avatar_url;
                        link.download = `${localProfile.username}-avatar.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setShowAvatarMenu(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-cyan-300 hover:bg-white/10 flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white border-4 border-white/30 shadow-xl mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowAvatarFullscreen(true)}
              >
                {localProfile.full_name?.charAt(0).toUpperCase() || '?'}
              </motion.div>
            )}

            {localProfile.plan && localProfile.plan !== 'basic' && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="absolute -top-2 -right-2"
              >
                <Badge className={`px-2 py-0.5 text-xs font-medium rounded-full border border-white/20 shadow ${
                  localProfile.plan === 'premium'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
                }`}>
                  {localProfile.plan === 'premium' ? <Crown className="w-4 h-4 inline mr-1" /> : <Briefcase className="w-4 h-4 inline mr-1" />} 
                  {localProfile.plan === 'premium' ? 'Premium' : 'Entreprise'}
                </Badge>
              </motion.div>
            )}
          </div>

          <motion.div 
            className="mt-6 px-4 md:px-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-cyan-300 font-mono text-sm flex items-center justify-center gap-1">
              @{localProfile.username}
              {localProfile.verified && (
                <img 
                  src="/badge.png" 
                  alt="✅ Vérifié" 
                  className="w-4 h-4 rounded-full"
                  title="Profil vérifié"
                />
              )}
            </p>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-6 md:mb-0 flex items-center justify-center gap-2">
              {localProfile.full_name}
              {isBirthdayToday(localProfile) && (
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
              {localProfile.nickname && <span className="font-medium">{localProfile.nickname}</span>}
              {localProfile.pronouns && <span className="px-2 py-0.5 bg-white/5 rounded">{localProfile.pronouns}</span>}
              {localProfile.job_title && (
                <span>
                  {localProfile.job_title}{localProfile.company && ` · ${localProfile.company}`}
                </span>
              )}
              {localProfile.professional_status && (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-cyan-500/20 text-cyan-400 rounded-full">
                  {localProfile.professional_status === 'student' && 'Étudiant'}
                  {localProfile.professional_status === 'employed' && 'En poste'}
                  {localProfile.professional_status === 'freelance' && 'Freelance'}
                  {localProfile.professional_status === 'open_to_work' && 'Ouvert'}
                  {localProfile.professional_status === 'other' && 'Autre'}
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

        {/* ================= STATS SECTION ================= */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } }
          }}
          className="mt-4 flex justify-center gap-5 text-center px-4 md:px-0"
        >
          {/* Likes */}
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            className="flex flex-col items-center"
          >
            <span className="text-[10px] uppercase tracking-wide text-gray-500">
              J’aime
            </span>
            <div className="mt-0.5 scale-75 origin-top">
              <GlacialLikeButton 
                profileId={localProfile.id}
                initialLikes={localProfile.likes_count || 0}
              />
            </div>
          </motion.div>
          {/* Followers */}
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            className="flex flex-col items-center"
          >
            <span className="text-[10px] uppercase tracking-wide text-gray-500">
              Followers
            </span>
            <span className="text-sm font-semibold text-white leading-none mt-0.5">
              {followersCount}
            </span>
          </motion.div>

          {/* Following */}
          {initialFollowing > 0 && (
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              className="flex flex-col items-center"
            >
              <span className="text-[10px] uppercase tracking-wide text-gray-500">
                Suivi(e)s
              </span>
              <span className="text-sm font-semibold text-white leading-none mt-0.5">
                {initialFollowing}
              </span>
            </motion.div>
          )}

          {/* NFC */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center">
            <span className="text-[11px] uppercase text-gray-400">Carte NFC</span>
            <motion.div
              animate={{
                boxShadow: hasLostCard
                  ? "0 0 0px rgba(250,204,21,0)"
                  : "0 0 10px rgba(16,185,129,0.35)"
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
              className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                hasLostCard
                  ? "border-yellow-400/50 text-yellow-400"
                  : "border-emerald-400/50 text-emerald-400"
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              {hasLostCard ? "Perdue" : "Active"}
            </motion.div>
          </motion.div>
        </motion.div>

        {localProfile.bio_short && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-300 mt-6 text-center max-w-2xl mx-auto leading-relaxed px-4 md:px-0"
          >
            {localProfile.bio_short}
          </motion.p>
        )}

        {(localProfile.birth_day || localProfile.city || localProfile.country || localProfile.availability) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 flex flex-wrap justify-center gap-4 text-gray-400 text-sm px-4 md:px-0"
          >
            {localProfile.birth_day && localProfile.birth_month && (
              <div className="flex items-center gap-1">
                <Cake className="w-4 h-4" />
                <span>
                  {localProfile.birth_day} {getMonthName(localProfile.birth_month)}
                  {!localProfile.hide_birth_year && localProfile.birth_year && ` ${localProfile.birth_year}`}
                </span>
              </div>
            )}
            {(localProfile.city || localProfile.country) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{[localProfile.city, localProfile.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {localProfile.availability && (
              <div className="flex items-center gap-1">
                <CheckCircle className={`w-4 h-4 ${
                  localProfile.availability === 'available' ? 'text-emerald-400' :
                  localProfile.availability === 'unavailable' ? 'text-red-400' : 'text-cyan-400'
                }`} />
                <span>
                  {localProfile.availability === 'available' && 'Disponible'}
                  {localProfile.availability === 'unavailable' && 'Indisponible'}
                  {localProfile.availability === 'by_appointment' && 'Sur RDV'}
                </span>
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full px-4 mt-8"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 py-4">
              {isSectionVisible('contact', localProfile) && localProfile.email && (
                <ActionItem
                  icon={<Mail className="w-5 h-5 text-cyan-400" />}
                  label="Email"
                  href={`mailto:${localProfile.email}`}
                  className="bg-gradient-to-tr from-cyan-800/20 to-cyan-500/20 hover:from-cyan-800/40 hover:to-cyan-500/40"
                />
              )}
              {isSectionVisible('contact', localProfile) && localProfile.phone && (
                <ActionItem
                  icon={<Phone className="w-5 h-5 text-green-400" />}
                  label="Appeler"
                  href={`tel:${localProfile.phone}`}
                  className="bg-gradient-to-tr from-green-800/20 to-green-400/20 hover:from-green-800/40 hover:to-green-400/40"
                />
              )}
              {isSectionVisible('contact', localProfile) && localProfile.whatsapp && (
                <ActionItem
                  icon={<MessageCircle className="w-5 h-5 text-emerald-400" />}
                  label="WhatsApp"
                  href={`https://wa.me/${localProfile.whatsapp.replace(/\D/g, '')}`}
                  className="bg-gradient-to-tr from-emerald-800/20 to-emerald-400/20 hover:from-emerald-800/40 hover:to-emerald-400/40"
                />
              )}
              {isSectionVisible('contact', localProfile) && localProfile.address && (
                <ActionItem
                  icon={<MapPin className="w-5 h-5 text-amber-400" />}
                  label="Carte"
                  href={`https://maps.google.com/?q=${encodeURIComponent(localProfile.address)}`}
                  className="bg-gradient-to-tr from-amber-800/20 to-amber-400/20 hover:from-amber-800/40 hover:to-amber-400/40"
                />
              )}
              {isSectionVisible('contact', localProfile) && localProfile.website && (
                <ActionItem
                  icon={<Globe className="w-5 h-5 text-blue-400" />}
                  label="Site"
                  href={localProfile.website}
                  className="bg-gradient-to-tr from-blue-800/20 to-blue-400/20 hover:from-blue-800/40 hover:to-blue-400/40"
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* 🔹 Boutons Portfolio, Certificats & Compétences */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="mt-6 flex flex-wrap justify-center gap-3 px-4 md:px-0"
        >
          {isSectionVisible('portfolio', localProfile) && portfolios.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPortfolioModal(true)}
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              <Folder className="w-4 h-4 mr-1.5" />
              Voir portfolio ({portfolios.length})
            </Button>
          )}

          {isSectionVisible('certificates', localProfile) && certificates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCertificatesModal(true)}
              className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
            >
              <Award className="w-4 h-4 mr-1.5" />
              Voir certifications ({certificates.length})
            </Button>
          )}

          {/* 🔹 Bouton Compétences */}
          {localProfile.skills && localProfile.skills.length > 0 && isSectionVisible('skills', localProfile) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSkillsModal(true)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              <Tag className="w-4 h-4 mr-1.5" />
              Voir compétences ({localProfile.skills.length})
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-6 px-4 md:px-0"
        >
          <FloatingButtons 
            profile={localProfile} 
            setShowQRModal={setShowQRModal}
            onContactClick={() => setShowContactModal(true)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="w-full px-4 mt-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 py-4">
              {isSectionVisible('social', localProfile) && localProfile.instagram && (
                <ActionItem
                  icon={<Instagram className="w-5 h-5 text-pink-400" />}
                  label="IG"
                  href={`https://instagram.com/${localProfile.instagram.trim()}`}
                  className="bg-gradient-to-tr from-pink-800/20 to-pink-400/20 hover:from-pink-800/40 hover:to-pink-400/40"
                />
              )}
              {isSectionVisible('social', localProfile) && localProfile.linkedin && (
                <ActionItem
                  icon={<Linkedin className="w-5 h-5 text-blue-500" />}
                  label="LinkedIn"
                  href={`https://linkedin.com/in/${localProfile.linkedin.replace(/^https?:\/\//, '').replace(/\/$/, '')}`}
                  className="bg-gradient-to-tr from-blue-800/20 to-blue-500/20 hover:from-blue-800/40 hover:to-blue-500/40"
                />
              )}
              {isSectionVisible('social', localProfile) && localProfile.github && (
                <ActionItem
                  icon={<Github className="w-5 h-5 text-gray-400" />}
                  label="GitHub"
                  href={`https://github.com/${localProfile.github.replace(/^https?:\/\//, '')}`}
                  className="bg-gradient-to-tr from-gray-800/20 to-gray-400/20 hover:from-gray-800/40 hover:to-gray-400/40"
                />
              )}
              {isSectionVisible('social', localProfile) && localProfile.gitlab && (
                <ActionItem
                  icon={<Gitlab className="w-5 h-5 text-orange-500" />}
                  label="GitLab"
                  href={`https://gitlab.com/${localProfile.gitlab.replace(/^https?:\/\//, '')}`}
                  className="bg-gradient-to-tr from-orange-800/20 to-orange-500/20 hover:from-orange-800/40 hover:to-orange-500/40"
                />
              )}
              {isSectionVisible('social', localProfile) && localProfile.tiktok && (
                <ActionItem
                  icon={<SiTiktok className="w-5 h-5 text-black" />}
                  label="TikTok"
                  href={`https://tiktok.com/@${localProfile.tiktok.replace(/^@/, '')}`}
                  className="bg-gradient-to-tr from-black/20 to-gray-600/20 hover:from-black/40 hover:to-gray-600/40"
                />
              )}
              {isSectionVisible('social', localProfile) && localProfile.snapchat && (
                <ActionItem
                  icon={<SnapchatIcon className="w-5 h-5 text-yellow-400" />}
                  label="Snapchat"
                  href={`https://snapchat.com/add/${localProfile.snapchat.replace(/^@/, '')}`}
                  className="bg-gradient-to-tr from-yellow-800/20 to-yellow-400/20 hover:from-yellow-800/40 hover:to-yellow-400/40"
                />
              )}
              {isSectionVisible('social', localProfile) && localProfile.telegram && (
                <ActionItem
                  icon={<TelegramIcon className="w-5 h-5 text-blue-400" />}
                  label="Telegram"
                  href={`https://t.me/${localProfile.telegram.replace(/^@/, '')}`}
                  className="bg-gradient-to-tr from-blue-800/20 to-blue-400/20 hover:from-blue-800/40 hover:to-blue-400/40"
                />
              )}
              {isSectionVisible('social', localProfile) && localProfile.behance && (
                <ActionItem
                  icon={<BehanceIcon className="w-5 h-5 text-blue-400" />}
                  label="Behance"
                  href={`https://${localProfile.behance.replace(/^https?:\/\//, '')}`}
                  className="bg-gradient-to-tr from-blue-800/20 to-blue-400/20 hover:from-blue-800/40 hover:to-blue-400/40"
                />
              )}
              {isSectionVisible('social', localProfile) && localProfile.dribbble && (
                <ActionItem
                  icon={<DribbbleIcon className="w-5 h-5 text-pink-400" />}
                  label="Dribbble"
                  href={`https://${localProfile.dribbble.replace(/^https?:\/\//, '')}`}
                  className="bg-gradient-to-tr from-pink-800/20 to-pink-400/20 hover:from-pink-800/40 hover:to-pink-400/40"
                />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="w-full px-4 mt-6"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 py-4">
              {/* 🔹 Utilisez 'links' au lieu de 'social' */}
              {isSectionVisible('links', localProfile) && (
                <>
                  <ActionItem
                    icon={<Download className="w-5 h-5 text-purple-400" />}
                    label="vCard"
                    onClick={() => {
                      const vCard = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${localProfile.full_name}\r\nORG:${localProfile.company || ''}\r\nTITLE:${localProfile.job_title || ''}\r\nTEL;TYPE=WORK,VOICE:${localProfile.phone || ''}\r\nTEL;TYPE=CELL,VOICE:${localProfile.whatsapp || ''}\r\nEMAIL:${localProfile.email || ''}\r\nADR;TYPE=WORK:;;${localProfile.address || ''};;;;\r\nURL:${localProfile.website || ''}\r\nNOTE:Contact via LUVIKA — ${shortUrl}\r\nEND:VCARD`;
                      const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${localProfile.username}.vcf`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-gradient-to-tr from-purple-800/20 to-purple-400/20 hover:from-purple-800/40 hover:to-purple-400/40"
                  />
                  {localProfile.cv_url && (
                    <ActionItem
                      icon={<FileText className="w-5 h-5 text-gray-400" />}
                      label="CV"
                      href={localProfile.cv_url.startsWith('http') ? localProfile.cv_url : `https://${localProfile.cv_url}`}
                      className="bg-gradient-to-tr from-gray-800/20 to-gray-400/20 hover:from-gray-800/40 hover:to-gray-400/40"
                    />
                  )}
                  {localProfile.calendly && (
                    <ActionItem
                      icon={<Calendar className="w-5 h-5 text-cyan-400" />}
                      label="RDV"
                      href={localProfile.calendly.startsWith('http') ? localProfile.calendly : `https://${localProfile.calendly}`}
                      className="bg-gradient-to-tr from-cyan-800/20 to-cyan-400/20 hover:from-cyan-800/40 hover:to-cyan-400/40"
                    />
                  )}
                  {localProfile.portfolio_url && (
                    <ActionItem
                      icon={<Folder className="w-5 h-5 text-cyan-400" />}
                      label="Portfolio"
                      href={localProfile.portfolio_url.startsWith('http') ? localProfile.portfolio_url : `https://${localProfile.portfolio_url}`}
                      className="bg-gradient-to-tr from-cyan-800/20 to-cyan-400/20 hover:from-cyan-800/40 hover:to-cyan-400/40"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        <ScanTracker profileId={localProfile.id} />

        <AnimatePresence>
          {showQRModal && (
            <QRModal
              key="qr-modal"
              isOpen={showQRModal}
              onClose={() => setShowQRModal(false)}
              profileUrl={profileUrl}
              username={localProfile.username}
              shortUrl={shortUrl}
            />
          )}
          {isContactModalOpen && (
            <ContactModal
              key="contact-modal"
              isOpen={isContactModalOpen}
              onClose={() => setIsContactModalOpen(false)}
              profileId={localProfile.id}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={showPortfolioModal}
        onClose={() => setShowPortfolioModal(false)}
        title="Portfolio"
      >
        <PortfolioSection items={portfolios} />
      </ProfileModal>

      <ProfileModal
        isOpen={showCertificatesModal}
        onClose={() => setShowCertificatesModal(false)}
        title="Certifications"
      >
        <CertificatesSection items={certificates} />
      </ProfileModal>

      <ProfileModal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        title="Compétences"
        skills={localProfile.skills || []} children={undefined}      >
      </ProfileModal>

      {/* 🔹 Modal de contact — UTILISER ContactModal */}
      <ContactModal
        key="contact-modal-float"
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        profileId={localProfile.id}
      />

      {/* 🔹 Fullscreen Avatar Modal */}
      <AnimatePresence>
        {showAvatarFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAvatarFullscreen(false)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full"
            >
              <motion.button
                onClick={() => setShowAvatarFullscreen(false)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 transition-colors z-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-6 h-6 text-white" />
              </motion.button>

              <img
                src={localProfile.avatar_url || ''}
                alt={`${localProfile.full_name} avatar`}
                className="w-full rounded-lg object-cover shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />

              <motion.button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = localProfile.avatar_url;
                  link.download = `${localProfile.username}-avatar.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/50 text-cyan-300 flex items-center gap-2 transition-colors backdrop-blur"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                Télécharger
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 🔹 Composants enfants
const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M21.927 9.208l-.863-.527A5.486 5.486 0 0 0 12 7a5.486 5.486 0 0 0-9.064 1.681l-.863.527a1 1 0 0 0-.066 1.72l.902.55a3.489 3.489 0 0 1 0 5.643l-.902.55a1 1 0 0 0 .066 1.72l.863.527A5.486 5.486 0 0 0 12 23a5.486 5.486 0 0 0 9.064-1.681l.863-.527a1 1 0 0 0 .066-1.72l-.902-.55a3.489 3.489 0 0 1 0-5.643l.902-.55a1 1 0 0 0-.066-1.72z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2zm4.333 13.5l-1.45 4.35c-.15.45-.6.6-1 .45L12 19l-6.5 3.5c-.4.2-.8-.1-.6-.5l1.5-6.5L3.5 12c-.2-.4 0-.8.4-.8l17-7c.4-.2.8.1.6.5l-2.5 12.5c-.1.5-.5.8-.9.6l-2.767-1.167z"/>
  </svg>
);

const BehanceIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M0 0v24h24V0H0zm8.4 18.4H4.8V5.6h3.6c1.6 0 2.8.4 3.6 1.2s1.2 2 1.2 3.6s-.4 2.8-1.2 3.6s-2 1.2-3.6 1.2zm-1.2-1.6h2c1.2 0 2-.4 2.4-1.2s.6-2 .6-3.6s-.2-2.8-.6-3.6s-1.2-1.2-2.4-1.2H7.2v9.6zm5.6-10.4v1.6h-3.2v3.2h2.8v1.6h-2.8v3.2h3.2v1.6h-4.8V5.6h4.8v1.6z"/>
  </svg>
);

const DribbbleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m-1.1 17.2c-4.8 0-7.1-4.7-7.4-8.2c.3-3.5 2.7-8.2 7.4-8.2c1.1 0 2.1.2 3.1.7c.9-.5 2-.8 3.2-.8c4.6 0 7 4.7 7.3 8.3c-.3 3.6-2.7 8.2-7.3 8.2c-1.1 0-2.2-.3-3.2-.7c-.9.5-1.9.7-2.9.7m-.7-13.3c-3.6 0-5.4 4-5.6 7c.2 3 2 7 5.6 7c3.7 0 5.5-4 5.7-7c-.2-3.1-2-7.1-5.7-7m-4.2 5.5c.2.2.2.5.1.7c-.1.2-.3.3-.6.2c-2.2-.9-3.8-3.2-3.9-3.4c-.1-.2-.1-.4.1-.6c.2-.2.5-.2.7-.1c.1.1 1.7 2.2 3.7 3.2m10.2 0c1.9-1 3.4-3 3.6-3.2c.2-.2.4-.2.6-.1c.2.2.2.4.1.6c-.2.2-1.8 2.6-4 3.5c-.2.1-.5 0-.7-.2c-.2-.2-.1-.5.1-.8m-9.7-3.7c.2.2.2.5.1.7c-.1.2-.3.3-.6.2c-1.3-.5-2.2-2.2-2.3-3.4c.2-2.5 2.1-4.1 2.8-4.6c.2-.1.4-.1.6.1c.2.2.2.4.1.6c-.3.5-1.7 2-1.9 4.4m9.2 0c.1-.6.2-1.1.2-1.8c-.1-2.1-1.1-3.5-1.8-4.1c-.2-.1-.2-.4-.1-.6c.2-.2.4-.2.6-.1c.7.5 2.3 2 2.5 4.3c0 .7.1 1.2.2 1.8c0 .2.1.4-.1.5c-.1.1-.3.1-.4-.1c-.2-.2-.3-.3-.5-.5c-.2-.3-.6-.4-.9-.2c-.3.2-.4.6-.2.9c.3.6 1.2 2.4 2.5 3.4c.2.1.2.4.1.6c-.2.2-.4.2-.6.1c-1.4-1-2.3-2.8-2.5-3.4c-.2-.3-.2-.7.1-.9c.2-.2.6-.4.9-.2c.3.2.4.6.2.9c-.2.3-.2.3-.3.5c-.1.1-.3.2-.5.1c-.2-.1-.3-.4-.1-.7m-4.8 1.8c.9-.1 2.8-1.1 3.9-2.7c.2-.2.5-.2.7-.1c.2.2.2.5.1.7c-.8 1.6-2.6 2.7-4.1 2.9c-.3 0-.5-.2-.5-.4c-.1-.1 0-.2.1-.4z"/>
  </svg>
);

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