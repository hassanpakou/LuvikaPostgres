// src/components/dashboard/DashboardContent.tsx
'use client';

import { useState, useEffect, useMemo, useRef, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import {
  Heart, Download, X, Mail, Check,
  Settings, AlertTriangle, MessageSquare, Send,
  Eye, Award, Bell, Folder, Building, Plus, Calendar, ArrowRight, Contact, QrCode, Package, ArrowUp, Search, Users, ChevronRight,
  ShoppingBag,
  Moon, UserPlus, UserMinus,
  Sun,CreditCard,XCircle ,
  User,
  Globe,
  Smartphone,
  Instagram,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Calendar as CalendarIcon,
  Briefcase,
  MapPin,
  Cake,
  Tag,
  Link as LinkIcon,
  FileText,
  Shield,
  Lock,
  EyeOff,
  ShieldCheck,
  LogOut,
  ShieldAlert,
  Snowflake,
  Star,
  Crown,
  BellRing,
  Search as SearchIcon,
  CheckCircle,
  BarChart3,
  Leaf
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import SimulateNFCTap from '../../../components/nfc/SimulateNFCTap';
import { generateQRBase64 } from '../../../lib/qr';
import SearchModal from '../../../src/components/dashboard/SearchModal';
import FollowersModal from '../../../src/components/dashboard/FollowersModal';
import ContactRequestsSection from '../../../src/components/dashboard/ContactRequestsSection';
import AnalyticsTrends from '../../../src/components/dashboard/AnalyticsTrends';
import EventAttendeesSection from '../../../src/components/dashboard/EventAttendeesSection';
import DashboardQuickMenu from '../../../src/components/dashboard/DashboardQuickMenu';
import PortfolioModal from '../../../src/components/dashboard/PortfolioModal';
import CertificatesModal from '../../../src/components/dashboard/CertificatesModal';
import CreateEventForm from '../events/CreateEventForm';
import { createClient } from '../../../src/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import NFCManagementModal from './Modals/NFCManagementModal';
import NFCModal from './Modals/NFCModal';
import { NFCCard } from '../../types/nfc';
import { normalizeNfcCard } from '@/src/lib/utils/nfc';
const formatDistance = (dateString: string, t: any): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays > 0) return `${diffDays} ${t('time.days', { count: diffDays })}`;
  if (diffHrs > 0) return `${diffHrs} ${t('time.hours', { count: diffHrs })}`;
  if (diffMin > 0) return `${diffMin} ${t('time.minutes', { count: diffMin })}`;
  return `${diffSec} ${t('time.seconds', { count: diffSec })}`;
};

// 🔹 Modal de succès
const SuccessModal = ({
  isOpen,
  onClose,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
        onClick={onClose}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-cyan-300/30"
              style={{
                left: `${10 + i * 15}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ['-80px', '100vh'],
                scale: [0, 1.2, 0],
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 40 }}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative backdrop-blur-2xl bg-white/10 dark:bg-black/20 rounded-2xl border border-white/15 shadow-xl w-full max-w-sm overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: 0 }}
            transition={{ duration: 4, ease: 'easeOut' }}
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-300 hover:text-white z-10"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="px-6 py-8 text-center relative z-10">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow">
              {title}
            </h3>
            <p className="text-gray-200 text-sm drop-shadow-sm">
              {message}
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// 🔹 ✅ Modal : Message personnalisé
const CustomMessageModal = ({
  value,
  onChange,
  onSubmit,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) => {
  const t = useTranslations('dashboard.other_features');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-md p-6 border border-white/15"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={20} className="text-cyan-400" />
            {t('custom_message')}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={t('custom_message_placeholder')}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 mb-4"
          rows={4}
        />
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-500"
            disabled={!value.trim()}
            onClick={onSubmit}
          >
            <Send className="w-4 h-4 mr-2" />
            {t('send_message')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 🔹 ✅ Modal : Upgrade
const UpgradeModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}) => {
  const t = useTranslations('dashboard.subscription');
  if (!isOpen) return null;
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-6"
      >
        <Card className="glass-border bg-gradient-to-b relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-blue-500/20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: ['-100px', '100vh'],
                  x: [0, Math.sin(i) * 100],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 8 + i,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <CardContent className="relative z-10 pt-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {t('request_upgrade')}
              </h2>
              <p className="text-gray-300">
                Un administrateur vous contactera sous 24h pour finaliser votre passage à Pro ou Bussness.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
                onClick={onConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi...' : '✅ Envoyer la demande'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

// 🔹 ✅ Modal : QR Code
const QRModal = ({
  isOpen,
  onClose,
  profileUrl,
  username,
}: {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  username: string;
}) => {
  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const downloadQR = () => {
    const canvas = document.querySelector('#qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${username}_luvika_qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  useEffect(() => {
    if (isOpen) {
      import('qrcode').then(QRCode => {
        QRCode.default.toCanvas(
          document.getElementById('qr-canvas') as HTMLCanvasElement,
          profileUrl,
          { width: 256, color: { dark: '#2563eb', light: '#ffffff' } }
        );
      });
    }
  }, [isOpen, profileUrl]);
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-md p-6 border border-white/15"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">QR Code</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-white rounded-xl">
              <canvas id="qr-canvas" width="256" height="256" className="mx-auto" />
            </div>
            <p className="text-gray-300 mt-3">
              Scannez pour accéder à votre profil LUVIKA
            </p>
          </div>
          <p className="text-sm text-gray-400 bg-black/20 p-3 rounded-lg mb-4 break-all">
            {profileUrl}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={copyLink}
            >
              {copied ? '✅ Copié !' : '📋 Copier'}
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-600 to-blue-500"
              onClick={downloadQR}
            >
              <Download className="w-4 h-4 mr-1" />
              Télécharger
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


// 🔹 ✅ Modal : Déconnexion - Confirmation
const SignOutConfirmSheet = ({
  isOpen,
  onClose,
  onConfirm,
  t,
  tNavbar,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string) => string;
  tNavbar: (key: string) => string;
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const startYRef = useRef(0);

  const handleStart = (clientY: number) => {
    setIsDragging(true);
    startYRef.current = clientY;
  };

  const handleMove = (clientY: number) => {
    if (!isDragging) return;
    const deltaY = clientY - startYRef.current;
    if (deltaY > 0) setDragOffset(Math.min(deltaY, 300));
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 120) {
      onClose();
    }
    setDragOffset(0);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientY);
    const handleMouseUp = () => handleEnd();
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    setShowFarewell(true);
    setTimeout(onClose, 300);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100]"
              onClick={handleBackdropClick}
            >
              <IceBubbles />
            </motion.div>

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{
                y: isDragging ? dragOffset : 0,
                opacity: 1,
                transition: isDragging
                  ? { type: 'tween' }
                  : { type: 'spring', damping: 26, stiffness: 280 },
              }}
              exit={{ y: '100%', opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 z-[101]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-4 sm:mx-6 md:mx-10 lg:mx-16 xl:mx-28">
                <div className="relative rounded-t-[36px] border border-white/15 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.35)] overflow-hidden">

                  <IceBubbles />

                  {/* Handle */}
                  <div
                    className="flex justify-center pt-4 pb-3 touch-none cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => handleStart(e.clientY)}
                    onTouchStart={(e) => handleStart(e.touches[0].clientY)}
                  >
                    <div className="w-16 h-1.5 rounded-full bg-white/30" />
                  </div>

                  {/* Header */}
                  <div className="text-center px-6 pt-2">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shadow-inner">
                      <ShieldAlert className="w-8 h-8 text-red-400" />
                    </div>

                      <h3 className="text-xl font-bold text-white tracking-wide">
                        {t('navbar.sign_out_confirm_title')}
                      </h3>

                      <p className="text-gray-200 text-sm mt-2 max-w-xs mx-auto">
                        {t('navbar.sign_out_confirm_message')}
                      </p>
                  </div>

                  {/* Actions */}
                  <div className="px-6 pt-6 pb-8 space-y-4 relative z-10">

                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleConfirm}
                      className="w-full h-14 rounded-xl font-semibold text-base 
                               bg-gradient-to-r from-red-500/80 to-red-600/80 
                               hover:from-red-500 hover:to-red-600 
                               border border-red-400/40 shadow-lg shadow-red-500/30"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      {t('navbar.sign_out_confirm_yes')}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={onClose}
                      className="w-full h-14 rounded-xl text-white border-white/20 
                               hover:bg-white/10 backdrop-blur-md"
                    >
                      <X className="mr-2 h-5 w-5" />
                      {t('navbar.sign_out_confirm_no')}
                    </Button>

                  </div>

                  {/* Footer signature */}
                  <div className="pb-6 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
                                   bg-white/5 border border-white/10 text-xs text-gray-300">
                      <Snowflake className="w-3 h-3 text-cyan-300" />
                      Luyenga na yo — Votre paix est scellée
                    </span>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FarewellModal
        isOpen={showFarewell}
        onClose={() => setShowFarewell(false)}
        t={t}
      />
    </>
  );
};

// 🔹 ✅ Modal : Déconnexion - Au revoir
const FarewellModal = ({
  isOpen,
  onClose,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200]"
        onClick={onClose}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-cyan-300/30"
              style={{
                left: `${10 + i * 15}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: ['-80px', '100vh'],
                scale: [0, 1.2, 0],
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      </motion.div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 40 }}
        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative backdrop-blur-2xl bg-white/10 dark:bg-black/20 rounded-2xl border border-white/15 shadow-xl w-full max-w-sm overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: 0 }}
            transition={{ duration: 4, ease: 'easeOut' }}
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-300 hover:text-white z-10"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="px-6 py-8 text-center relative z-10">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-2xl">😢</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow">
              {t('navbar.farewell_title')}
            </h3>
            <p className="text-gray-200 mb-5 drop-shadow-sm">
              {t('navbar.farewell_message')}
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// 🔹 ✅ Composant bulles (réutilisable partout)
const IceBubbles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="bubble bubble-1" />
    <div className="bubble bubble-2" />
    <div className="bubble bubble-3" />
    <div className="bubble bubble-4" />
    <div className="bubble bubble-5" />
  </div>
);

// 🔹 Types
type Profile = {
  verified: import("react/jsx-runtime").JSX.Element;
  id: string;
  full_name: string;
  username: string;
  job_title?: string;
  is_public?: boolean;
  bio_short?: string;
  sections_visibility?: Record<string, boolean>;
  accepts_contact_requests?: boolean;
  plan?: string | null;
  likes_count?: number;
  // 🔹 Ajouter avatar_url
  avatar_url?: string;
};
type Action = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  disabled?: boolean;
};
type Card = {
  matricule: string;
  id: string;
  card_id: string;
  status: 'active' | 'lost' | 'blocked' | 'inactive';
  created_at: string;
};

type Scan = {
  id: string;
  scan_type: string;
  created_at: string;
  profiles?: { full_name?: string; username?: string };
};
type Props = {
  user: { id: string };
  profile: Profile;
  cards: Card[];
  recentScans: Scan[];
  totalScans: number;
  qrBase64: string;
  profileUrl: string;
  planColors: Record<string, string>;
  isAdmin: boolean;
  totalFollowers: number;
};
type EventData = {
  title: string;
  description?: string;
  location?: string;
  starts_at: string; // ISO 8601
  ends_at?: string;
  is_public: boolean;
  max_participants?: number;
};

export default function DashboardContent({
  user, profile, cards, recentScans,
  totalScans, qrBase64, profileUrl, planColors, isAdmin, totalFollowers,
}: Props) {
  const t = useTranslations('dashboard');
  const tNavbar = useTranslations('navbar');
  const locale = useLocale();
  const router = useRouter();
  const [hasLiked, setHasLiked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [scansCount, setScansCount] = useState(0);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isCertificatesModalOpen, setIsCertificatesModalOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState<any[]>([]);
const [isSearching, setIsSearching] = useState(false);
const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
const [isNFCModalOpen, setIsNFCModalOpen] = useState(false);
const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
const [selectedCardForManagement, setSelectedCardForManagement] = useState<NFCCard | null>(null);
const [nfcCards, setNfcCards] = useState<NFCCard[]>([]);

  const [sectionsVisibility, setSectionsVisibility] = useState<Record<string, boolean>>(
    profile.sections_visibility || {
      bio: true,
      contact: true,
      social: true,
      portfolio: true,
      certificates: true,
    }
  );
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [acceptsContactRequests, setAcceptsContactRequests] = useState(
    profile.accepts_contact_requests ?? true
  );
  const [reportReason, setReportReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
const [activeCardStats, setActiveCardStats] = useState<{ scans: number; unique_visitors: number } | null>(null);
const [loadingCards, setLoadingCards] = useState(true);
const [loadingMessagesCount, setLoadingMessagesCount] = useState(true);
  
  // 🔹 Références pour les canaux realtime
  const channelsRef = useRef<any>({});
  const subscription = useMemo(() => {
    const plan = (profile.plan || 'basic').toLowerCase() as 'basic' | 'premium' | 'entreprise';
    return { plan, active: plan === 'premium' || plan === 'entreprise', expires_at: undefined };
  }, [profile.plan]);
  
  const handleLike = () => setHasLiked(!hasLiked);
  
  // 🔹 Nouveaux gestionnaires d'actions
  const handleQuickAction = (actionId: string) => {
    // 🔹 Rediriger vers les nouvelles pages
    switch (actionId) {
      case 'statistics':
        router.push('/dashboard/statistics');
        break;
      case 'messages':
        router.push('/dashboard/messages');
        break;
      case 'subscribers':
        router.push('/dashboard/subscribers');
        break;
      case 'card-config':
        router.push('/dashboard/card-config');
        break;
      case 'parameters':
        router.push('/dashboard/parameters');
        break;
      case 'profile':
        router.push(`/${locale}/${profile.username}`);
        break;
      case 'event':
        setIsEventModalOpen(true);
        break;
      case 'event-create':
        setIsEventFormOpen(true);
        break;
      case 'portfolio':
        setIsPortfolioModalOpen(true);
        break;
      case 'certificates':
        setIsCertificatesModalOpen(true);
        break;
      case 'logout':
        setShowSignOutConfirm(true);
        break;
      default:
        setActiveModal(actionId);
    }
  };
  // 🔹 Rediriger vers la page de gestion des cartes
const handleManageCards = () => {
  router.push('/dashboard/nfc');
};

useEffect(() => {
  console.log('🔍 Modaux actifs:', {
    activeModal,
    isPortfolioModalOpen,
    isCertificatesModalOpen,
    isContactModalOpen,
    showSignOutConfirm
  });
}, [activeModal, isPortfolioModalOpen, isCertificatesModalOpen, isContactModalOpen, showSignOutConfirm]);
// 🔹 Rediriger vers la page de commande de carte
const handleOrderCard = () => {
  router.push('/dashboard/orders');
};

// 🔹 Vérifier si l'utilisateur a au moins une carte commandée
const hasOrderedCard = cards.length > 0;

// 🔹 Obtenir la carte active (la plus récente)
const activeCard = cards[0];
  const updateVisibility = (section: string, checked: boolean) => {
    const newVisibility = { ...sectionsVisibility, [section]: checked };
    setSectionsVisibility(newVisibility);
    saveSectionsVisibility(newVisibility);
  };
  
  const handleExport = async () => {
    try {
      const res = await fetch('/api/scans/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luvika-scans-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('❌ Échec de l’export');
    }
  };
  const fetchUnreadMessagesCount = async () => {
  try {
    setLoadingMessagesCount(true);
    const res = await fetch('/api/contact-requests/count?status=unread');
    if (res.ok) {
      const data = await res.json();
      setUnreadMessagesCount(data.count || 0);
    }
  } catch (err) {
    console.error('❌ Erreur chargement compteur messages:', err);
  } finally {
    setLoadingMessagesCount(false);
  }
};
  const handleUpgradeRequest = async () => {
    if (!user || !profile) return;
    setIsSubmitting(true);
    try {
      let targetPlan = 'premium';
      if (profile.plan === 'premium') {
        targetPlan = 'entreprise';
      }
      const res = await fetch('/api/upgrade-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          profile_id: profile.id,
          target_plan: targetPlan
        }),
      });
      if (res.ok) {
        closeModal();
        alert(
          targetPlan === 'entreprise'
            ? '✅ Demande de conversion en Business envoyée.'
            : '✅ Demande de passage à Pro envoyée.'
        );
        window.location.reload();
      } else {
        throw new Error();
      }
    } catch {
      alert('❌ Échec. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

const loadNfcCards = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  const { data, error } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (!error && data) {
    setNfcCards(data.map(normalizeNfcCard)); // ✅ Normalisation propre
  }
};

// Dans le useEffect initial
useEffect(() => {
  loadNfcCards();
}, []);
// 🔹 Charger les cartes NFC AVEC statistiques depuis la table scans existante
const fetchCards = async () => {
  try {
    setLoadingCards(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // 🔹 Récupérer les cartes NFC
    const { data: cardsData, error: cardsError } = await supabase
      .from('nfc_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (cardsError) throw cardsError;
    setNfcCards(cardsData || []); // ✅ Utilise setNfcCards au lieu de setCards

    // 🔹 Récupérer les stats depuis la table scans EXISTANTE
    const { data: scansData, error: scansError } = await supabase
      .from('scans')
      .select('scanner_id')
      .eq('profile_id', user.id)
      .eq('scan_type', 'nfc');

    if (scansError) throw scansError;

    // 🔹 Calculer les statistiques
    const totalScans = scansData?.length || 0;
    const uniqueVisitors = new Set(
      scansData?.map(scan => scan.scanner_id).filter(Boolean) || []
    ).size;

    setActiveCardStats({
      scans: totalScans,
      unique_visitors: uniqueVisitors
    });
  } catch (err) {
    console.error('❌ Erreur chargement cartes:', err);
  } finally {
    setLoadingCards(false);
  }
};
// 🔹 Dans useEffect existant, ajouter le chargement des cartes
useEffect(() => {
  if (profile) {
    fetchCards();
    // ... autres fetch existants
  }
}, [profile]);
  const saveSectionsVisibility = async (newVisibility: Record<string, boolean>) => {
    try {
      const res = await fetch('/api/profile/sections-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, sections_visibility: newVisibility }),
      });
      if (!res.ok) throw new Error('Échec sauvegarde');
    } catch (err) {
      console.error('❌ Sauvegarde sections échouée:', err);
    }
  };
  
  const toggleContactRequests = async () => {
    try {
      const res = await fetch('/api/profile/contact-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, enabled: !acceptsContactRequests }),
      });
      if (res.ok) {
        setAcceptsContactRequests(!acceptsContactRequests);
      } else {
        throw new Error();
      }
    } catch {
      alert('❌ Échec. Veuillez réessayer.');
    }
  };
  
  const handleReportCard = async () => {
    if (!reportReason) return;
    const reason = reportReason === 'other' ? customReason : reportReason;
    try {
      const res = await fetch('/api/profile/report-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, reason, profile_id: profile.id }),
      });
      if (res.ok) {
        alert('✅ Carte signalée.');
        closeModal();
      } else {
        throw new Error();
      }
    } catch {
      alert('❌ Échec.');
    }
  };
  
  const handleSendCustomMessage = async () => {
    if (!customMessage.trim()) return;
    try {
      const res = await fetch('/api/profile/custom-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, message: customMessage }),
      });
      if (res.ok) {
        setCustomMessage('');
        alert('✅ Message envoyé.');
        closeModal();
      } else {
        throw new Error();
      }
    } catch {
      alert('❌ Échec.');
    }
  };
  
  const handleCreateEvent = async (data: any) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setShowEventForm(false);
        setIsEventFormOpen(false);
        setIsEventModalOpen(true);
      } else {
        const errorData = await res.json();
        console.error('❌ Création échouée:', errorData.error || 'Erreur inconnue');
      }
    } catch (err) {
      console.error('❌ Erreur réseau lors de la création:', err);
    }
  };

  // 🔹 ✅ Nouveau gestionnaire de déconnexion
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        setShowFarewell(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        throw new Error();
      }
    } catch {
      alert('❌ Échec de la déconnexion. Veuillez réessayer.');
    }
  };
  
  const [hasCompany, setHasCompany] = useState(false);
  useEffect(() => {
    const checkCompany = async () => {
      if (user?.id && subscription.plan === 'entreprise') {
        const supabase = createClient();
        const { data } = await supabase
          .from('companies')
          .select('id')
          .eq('owner_id', user.id)
          .single();
        setHasCompany(!!data);
      }
    };
    checkCompany();
  }, [user?.id, subscription.plan]);
  useEffect(() => {
  if (unreadMessagesCount > 0 && !loadingMessagesCount) {
    // Jouer un son discret
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }
}, [unreadMessagesCount]);
  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await fetch(`/api/analytics?profile_id=${profile.id}&range=all`);
        const { total } = await res.json();
        setScansCount(total || 0);
      } catch (err) {
        console.warn('⚠️ Failed to load scans count');
      }
    };
    fetchScans();
  }, [profile.id]);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('open') === 'upgrade') {
      setActiveModal('upgrade');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);
  useEffect(() => {
  if (profile.accepts_contact_requests) {
    fetchUnreadMessagesCount();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUnreadMessagesCount, 30000);
    return () => clearInterval(interval);
  }
}, [profile.accepts_contact_requests]);

  // 🔹 Synchronisation en temps réel - Améliorée avec gestion d'erreurs et reconnexion
  useEffect(() => {
    const supabase = createClient();
    
    // Obtenir l'utilisateur de manière asynchrone
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      // 🔹 Canal pour les messages non lus
      const messagesChannel = supabase
        .channel(`messages-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'contact_requests',
            filter: `profile_id=eq.${user.id}`
          },
          async () => {
            // 🔹 Rafraîchir le compteur de messages non lus
            try {
              const res = await fetch('/api/contact-requests/count?status=unread');
              if (res.ok) {
                const data = await res.json();
                setUnreadMessagesCount(data.count || 0);
              }
            } catch (err) {
              console.warn('Erreur mise à jour messages:', err);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Canal messages connecté');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Erreur canal messages');
          }
        });

      // 🔹 Canal pour les cartes NFC
      const nfcChannel = supabase
        .channel(`nfc-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'nfc_cards',
            filter: `user_id=eq.${user.id}`
          },
          async () => {
            // 🔹 Rafraîchir les informations NFC
            try {
              const { data } = await supabase
                .from('nfc_cards')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
              
              setNfcCards(data || []);
              
              // 🔹 Rafraîchir les stats
              const { data: scansData } = await supabase
                .from('scans')
                .select('scanner_id')
                .eq('profile_id', user.id)
                .eq('scan_type', 'nfc');

              const totalScans = scansData?.length || 0;
              const uniqueVisitors = new Set(
                scansData?.map(scan => scan.scanner_id).filter(Boolean) || []
              ).size;

              setActiveCardStats({
                scans: totalScans,
                unique_visitors: uniqueVisitors
              });
            } catch (err) {
              console.warn('Erreur mise à jour NFC:', err);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Canal NFC connecté');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Erreur canal NFC');
          }
        });

      // 🔹 Canal pour les statistiques de scans
      const scansChannel = supabase
        .channel(`scans-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'scans',
            filter: `profile_id=eq.${user.id}`
          },
          async () => {
            // 🔹 Rafraîchir les statistiques en temps réel
            try {
              const res = await fetch(`/api/analytics?profile_id=${user.id}&range=all`);
              const data = await res.json();
              setScansCount(data.total || 0);
            } catch (err) {
              console.warn('Erreur mise à jour scans:', err);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Canal scans connecté');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Erreur canal scans');
          }
        });

      // 🔹 Canal pour les likes
      const likesChannel = supabase
        .channel(`likes-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'likes',
            filter: `profile_id=eq.${user.id}`
          },
          async () => {
            // 🔹 Rafraîchir le compte de likes
            try {
              const { count } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('profile_id', user.id);
              
              // Mettre à jour le profil avec le nouveau compte
              const updatedProfile = { ...profile, likes_count: count };
              // Note: Dans un cas réel, on mettrait à jour l'état global ou le store
            } catch (err) {
              console.warn('Erreur mise à jour likes:', err);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Canal likes connecté');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Erreur canal likes');
          }
        });

      // 🔹 Canal pour les followers
      const followersChannel = supabase
        .channel(`followers-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'follows',
            filter: `followed_id=eq.${user.id}`
          },
          async () => {
            // 🔹 Rafraîchir le compte de followers
            try {
              const { count } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('followed_id', user.id);
              
              // Mettre à jour le totalFollowers
              // Note: Dans un cas réel, on mettrait à jour l'état global ou le store
            } catch (err) {
              console.warn('Erreur mise à jour followers:', err);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Canal followers connecté');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Erreur canal followers');
          }
        });

      // 🔹 Canal pour les portfolios et certifications
      const portfolioChannel = supabase
        .channel(`portfolio-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'portfolios',
            filter: `profile_id=eq.${user.id}`
          },
          async () => {
            // 🔹 Rafraîchir les portfolios via l'API
            try {
              const res = await fetch(`/api/portfolio?profile_id=${user.id}`);
              const { portfolios, certificates } = await res.json();
              
              // Mettre à jour les modals si ouverts
              // Note: Dans un cas réel, on mettrait à jour l'état global ou le store
            } catch (err) {
              console.warn('Erreur mise à jour portfolio:', err);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Canal portfolio connecté');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Erreur canal portfolio');
          }
        });

      // 🔹 Canal pour les informations du profil
      const profileChannel = supabase
        .channel(`profile-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            // 🔹 Mettre à jour les informations du profil
            const updatedProfile = { ...profile, ...payload.new };
            // Note: Dans un cas réel, on mettrait à jour l'état global ou le store
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Canal profile connecté');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Erreur canal profile');
          }
        });

      // 🔹 Gestionnaire de reconnexion
      const handleReconnect = () => {
        console.log('🔄 Tentative de reconnexion aux canaux realtime');
        // Les canaux se reconnectent automatiquement avec Supabase
      };

      // 🔹 Écouteur de connexion réseau
      const handleOnline = () => {
        console.log('🌐 Connexion réseau restaurée');
        handleReconnect();
      };

      window.addEventListener('online', handleOnline);

      // 🔹 Stocker les références pour le cleanup
      channelsRef.current = {
        messages: messagesChannel,
        nfc: nfcChannel,
        scans: scansChannel,
        likes: likesChannel,
        followers: followersChannel,
        portfolio: portfolioChannel,
        profile: profileChannel,
        handleOnline
      };

    }).catch(console.error);

    return () => {
      const channels = channelsRef.current;
      if (channels) {
        if (channels.messages) supabase.removeChannel(channels.messages);
        if (channels.nfc) supabase.removeChannel(channels.nfc);
        if (channels.scans) supabase.removeChannel(channels.scans);
        if (channels.likes) supabase.removeChannel(channels.likes);
        if (channels.followers) supabase.removeChannel(channels.followers);
        if (channels.portfolio) supabase.removeChannel(channels.portfolio);
        if (channels.profile) supabase.removeChannel(channels.profile);
        if (channels.handleOnline) {
          window.removeEventListener('online', channels.handleOnline);
        }
      }
    };
  }, [profile.id]);
  // 🔹 ✅ Nouveaux quickActions - version compacte et glassmorphic
  const quickActions: Action[] = [
    { id: 'profile', label: 'Profil', icon: <User size={18} />, color: 'from-cyan-500 to-blue-500' },
    { id: 'statistics', label: 'Statistiques', icon: <BarChart3 size={18} />, color: 'from-purple-500 to-indigo-500' },
    { id: 'subscribers', label: 'Abonnés', icon: <Users size={18} />, color: 'from-green-400 to-emerald-500' },
    { id: 'card-config', label: 'Carte', icon: <CreditCard size={18} />, color: 'from-amber-400 to-orange-500' },
    //{ id: 'messages', label: 'Messages', icon: <Mail size={18} />, color: 'from-cyan-400 to-blue-500' },
    //{ id: 'qr', label: 'QR Code', icon: <QrCode size={18} />, color: 'from-emerald-400 to-teal-500' },
    //{ id: 'nfc', label: 'Cartes NFC', icon: <Contact size={18} />, color: 'from-amber-400 to-orange-500' },
    //{ id: 'report', label: 'Signaler', icon: <AlertTriangle size={18} />, color: 'from-red-500 to-rose-500' },
    //{ id: 'messages', label: 'Message perso', icon: <MessageSquare size={18} />, color: 'from-indigo-400 to-violet-500' },
    //{ id: 'orders', label: 'Commandes', icon: <Package size={18} />, color: 'from-fuchsia-400 to-pink-500' },
    //{ id: 'search', label: 'Rechercher', icon: <Search size={18} />, color: 'from-yellow-400 to-orange-400' },
    //{ id: 'event', label: 'Voir événements', icon: <Calendar size={14} />, color: 'from-indigo-500 to-violet-500', disabled: profile.plan === 'freemium' || profile.plan === 'basic',},
    //{ id: 'event-create', label: 'Créer événement', icon: <Plus />, color: 'from-green-500 to-emerald-500' },
    { id: 'portfolio', label: 'Portfolio', icon: <Folder size={18} />, color: 'from-cyan-500 to-blue-500' },
    { id: 'certificates', label: 'Certificat', icon: <Award size={18} />, color: 'from-yellow-500 to-amber-500' },
    //{ id: 'upgrade', label: 'Upgrade', icon: <ArrowUp size={18} />, color: 'from-cyan-300 to-blue-400' },
    { id: 'parameters', label: 'Paramètres', icon: <Settings size={18} />, color: 'from-gray-500 to-gray-600' },
    { id: 'logout', label: 'Déconnexion', icon: <LogOut size={18} />, color: 'from-red-500 to-rose-500' },
  ];
  
  useEffect(() => {
    const generateQR = async () => {
      try {
        const qr = await generateQRBase64(profileUrl, { size: 300, color: '#2563eb' });
        setQrImage(qr);
      } catch (err) {
        console.error('❌ QR generation failed:', err);
        setQrError('QR indisponible.');
      }
    };
    if (profileUrl) generateQR();
  }, [profileUrl]);
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        setShowSuccessModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const [profileCompletion, setProfileCompletion] = useState(0);

// 🔹 Calculer le pourcentage de complétion du profil
const calculateProfileCompletion = (profile: any) => {
  let score = 0;
  const totalPoints = 10;

  // Photo de profil (+2 points)
  if (profile.avatar_url) score += 2;

  // Bio (+1 point)
  if (profile.bio_short || profile.bio) score += 1;

  // Email (+1 point)
  if (profile.email) score += 1;

  // Téléphone (+1 point)
  if (profile.phone) score += 1;

  // Adresse (+1 point)
  if (profile.address) score += 1;

  // Compétences (+1 point)
  if (profile.skills && profile.skills.length > 0) score += 1;

  // Liens professionnels (+1 point)
  if (profile.links && profile.links.length > 0) score += 1;

  // Certificats (+1 point)
  if (profile.certificates && profile.certificates.length > 0) score += 1;

  // Portfolio (+1 point)
  if (profile.portfolio && profile.portfolio.length > 0) score += 1;

  return Math.round((score / totalPoints) * 100);
};
// 🔹 ✅ NOUVEAU : Mettre à jour la complétion quand le profil change
useEffect(() => {
  if (profile) {
    const completion = calculateProfileCompletion(profile);
    setProfileCompletion(completion);
  }
}, [profile]);
// 🔹 Hook pour le thème
const { theme, setTheme } = useTheme();

// 🔹 Toggle thème
const toggleTheme = () => {
  setTheme(theme === 'dark' ? 'light' : 'dark');
};

// 🔹 Recherche d'utilisateurs
const handleSearch = async (query: string) => {
  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  try {
    setIsSearching(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        username,
        avatar_url,
        plan
      `)
      .ilike('full_name', `%${query}%`)
      .neq('id', user.id)
      .limit(10);

    if (error) throw error;
    
    setSearchResults(data || []);
    
    // Charger le statut de suivi
    if (data && data.length > 0) {
      const followerIds = data.map(p => p.id);
      const { data: followers } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', user.id)
        .in('follower_id', followerIds);

      const statusMap: Record<string, boolean> = {};
      (followers || []).forEach(f => {
        statusMap[f.follower_id] = true;
      });
      setFollowStatus(statusMap);
    }
  } catch (err) {
    console.error('❌ Erreur recherche:', err);
    setSearchResults([]);
  } finally {
    setIsSearching(false);
  }
};

// 🔹 Toggle follow/unfollow
const handleToggleFollow = async (profileId: string) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const isFollowing = followStatus[profileId];
    
    if (isFollowing) {
      // Unfollow
      await supabase
        .from('followers')
        .delete()
        .eq('follower_id', profileId)
        .eq('following_id', user.id);
      
      setFollowStatus(prev => ({ ...prev, [profileId]: false }));
    } else {
      // Follow
      await supabase
        .from('followers')
        .insert({
          follower_id: profileId,
          following_id: user.id
        });
      
      setFollowStatus(prev => ({ ...prev, [profileId]: true }));
    }
  } catch (err) {
    console.error('❌ Erreur follow/unfollow:', err);
    alert('❌ Échec de l\'opération');
  }
};
  

  return (
    <div className="space-y-6 pb-24">
  {/* 🎨 En-tête - Design Compact et Glassmorphic */}
<div className="mb-4">
  {/* 🔹 Barre d'icônes compacte - DESIGN OPTIMISÉ */}
  <div className="flex items-center justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
    {/* 🔍 Recherche - VIOLET */}
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsSearchModalOpen(true)}
      className={`
        h-11 w-11 sm:h-12 sm:w-12
        rounded-xl sm:rounded-full
        bg-white/8 hover:bg-white/15
        border border-white/15
        transition-all duration-300
        group
        relative
        shadow-md shadow-purple-500/10
        hover:shadow-purple-500/20
      `}
      aria-label="Rechercher des profils"
    >
      <SearchIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300 group-hover:scale-110 transition-transform" />
      <div className="absolute inset-0 rounded-xl sm:rounded-full bg-purple-500/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* 🔹 Badge indicateur subtil */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 hidden sm:block">
        <div className="flex items-center gap-1 bg-purple-500/20 text-purple-200 text-[10px] px-1.5 py-0.5 rounded-full border border-purple-500/30">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>
    </Button>

    {/* 💬 Messages - VERT */}
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        setIsContactModalOpen(true);
        setUnreadMessagesCount(0);
      }}
      className={`
        h-11 w-11 sm:h-12 sm:w-12
        rounded-xl sm:rounded-full
        bg-white/8 hover:bg-white/15
        border border-white/15
        transition-all duration-300
        group
        relative
        shadow-md shadow-green-500/10
        hover:shadow-green-500/20
      `}
      aria-label={`Messages${unreadMessagesCount > 0 ? `: ${unreadMessagesCount} non lus` : ''}`}
    >
      <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-green-300 group-hover:scale-110 transition-transform" />
      
      {/* 🔹 Badge messages non lus - TOUJOURS VISIBLE */}
      {unreadMessagesCount > 0 && (
        <div className={`
          absolute -top-1.5 -right-1.5
          flex items-center justify-center
          min-w-[20px] h-5
          rounded-full
          bg-gradient-to-r from-red-500 to-rose-600
          text-white text-[11px] font-bold
          border-2 border-black
          shadow-lg shadow-red-500/40
          animate-pulse
          z-10
        `}>
          {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
        </div>
      )}
      
      <div className="absolute inset-0 rounded-xl sm:rounded-full bg-green-500/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
    </Button>

    {/* ❤️ Likes - ROUGE (Version TypeScript-safe) */}
<Button
  variant="ghost"
  size="icon"
  onClick={() => console.log('Likes clicked')}
  className={`
    h-11 w-11 sm:h-12 sm:w-12
    rounded-xl sm:rounded-full
    bg-white/8 hover:bg-white/15
    border border-white/15
    transition-all duration-300
    group
    relative
    shadow-md shadow-red-500/10
    hover:shadow-red-500/20
  `}
  aria-label={`Likes: ${(profile?.likes_count ?? 0)}`}
>
  <Heart 
    size={20} 
    className={`
      relative z-10
      drop-shadow-sm
      group-hover:scale-110
      transition-transform
      ${(profile?.likes_count ?? 0) > 0 
        ? 'fill-red-500 text-red-300' 
        : 'text-gray-400'
      }
    `} 
  />
  
  {/* 🔹 Badge compteur likes - TOUJOURS VISIBLE & SAFE */}
  <span className={`
    absolute -top-1.5 -right-1.5
    flex items-center justify-center
    min-w-[20px] h-5
    rounded-full
    ${(profile?.likes_count ?? 0) > 0 
      ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' 
      : 'bg-gray-700/50 text-gray-300'
    }
    text-[11px] font-bold
    border-2 border-black
    shadow-lg
    ${(profile?.likes_count ?? 0) > 0 ? 'shadow-red-500/40 animate-pulse' : ''}
    z-10
  `}>
    {(profile?.likes_count ?? 0) > 99 ? '99+' : (profile?.likes_count ?? 0)}
  </span>
  
  <div className="absolute inset-0 rounded-xl sm:rounded-full bg-red-500/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
</Button>

    {/* 🌗 Thème - JAUNE/BLANC */}
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`
        h-11 w-11 sm:h-12 sm:w-12
        rounded-xl sm:rounded-full
        bg-white/8 hover:bg-white/15
        border border-white/15
        transition-all duration-300
        group
        relative
        shadow-md
        ${theme === 'dark' 
          ? 'shadow-yellow-500/10 hover:shadow-yellow-500/20' 
          : 'shadow-blue-500/10 hover:shadow-blue-500/20'
        }
      `}
      aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300 group-hover:scale-110 transition-transform" />
      ) : (
        <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-200 group-hover:scale-110 transition-transform" />
      )}
      <div className="absolute inset-0 rounded-xl sm:rounded-full bg-white/15 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* 🔹 Badge indicateur thème */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 hidden sm:block">
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-medium ${
          theme === 'dark'
            ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30'
            : 'bg-blue-500/20 text-blue-200 border-blue-500/30'
        }`}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </div>
      </div>
    </Button>
  </div>
</div>


{/* 🔹 Carte profil utilisateur - DESIGN ULTRA PREMIUM */}
<motion.div
  whileHover={{ y: -3, scale: 1.015 }}
  whileTap={{ scale: 0.99 }}
  onClick={() => router.push('/dashboard/settings')}
  className={`
    relative
    p-4
    cursor-pointer
    transition-all duration-300
    flex items-center gap-4
    group
    overflow-hidden
    rounded-2xl
    bg-gradient-to-br 
    ${
      subscription.plan === 'premium'
        ? 'from-cyan-900/30 via-blue-900/20 to-transparent'
        : subscription.plan === 'entreprise'
        ? 'from-purple-900/30 via-indigo-900/20 to-transparent'
        : 'from-blue-900/30 via-gray-900/20 to-transparent'
    }
    before:content-['']
    before:absolute
    before:inset-0
    before:bg-gradient-to-r
    before:from-transparent
    before:via-white/5
    before:to-transparent
    before:opacity-0
    group-hover:before:opacity-100
    before:transition-opacity
    before:duration-500
    border border-white/10
    backdrop-blur-xl
    shadow-xl
    shadow-black/40
    hover:shadow-2xl
    hover:shadow-cyan-500/10
    hover:border-cyan-500/30
    active:scale-[0.995]
  `}
>
  {/* 🌊 Fond animé */}
  <div className="absolute inset-0 overflow-hidden rounded-2xl">
    <div className="absolute -left-1/2 -top-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />
  </div>

  {/* 🖼️ Avatar + statut + plan - CONTENEUR AMÉLIORÉ */}
  <div className="relative shrink-0">
    {/* 🔹 Cercle de fond animé */}
    <div className={`
      absolute inset-0 rounded-full
      ${
        subscription.plan === 'premium'
          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
          : subscription.plan === 'entreprise'
          ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20'
          : 'bg-gradient-to-r from-blue-500/20 to-gray-500/20'
      }
      opacity-0 group-hover:opacity-100 transition-opacity duration-500
      animate-ping
      blur-xl
    `} />
    
    {/* 🔹 Avatar avec effet hover */}
    <div className={`
      relative rounded-full overflow-hidden
      transition-all duration-500
      group-hover:scale-105
      group-hover:rotate-3
      border-2
      ${
        subscription.plan === 'premium'
          ? 'border-cyan-400/50 group-hover:border-cyan-400'
          : subscription.plan === 'entreprise'
          ? 'border-purple-400/50 group-hover:border-purple-400'
          : 'border-blue-400/50 group-hover:border-blue-400'
      }
      shadow-2xl
      shadow-black/50
    `}>
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.full_name}
          className="w-16 h-16 object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
          <User className="w-9 h-9 text-gray-300" />
        </div>
      )}
      
      {/* 🔹 Overlay dégradé */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>

    {/* 🟢 Statut en ligne - AMÉLIORÉ */}
    <div className="absolute -top-1 -right-1 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
        <div className="relative w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-black shadow-lg shadow-green-500/50" />
      </div>
      <span className="absolute -right-8 -top-1 text-[10px] font-medium text-green-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        En ligne
      </span>
    </div>

    {/* 🔰 Icône plan - BADGE ÉLÉGANT */}
    <div className={`
      absolute -bottom-1.5 -right-1.5
      w-7 h-7
      rounded-xl
      flex items-center justify-center
      border-2 border-white/30
      shadow-2xl shadow-black/60
      z-20
      ${
        subscription.plan === 'premium'
          ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
          : subscription.plan === 'entreprise'
          ? 'bg-gradient-to-br from-purple-600 to-indigo-700'
          : 'bg-gradient-to-br from-blue-600 to-gray-700'
      }
      transform transition-all duration-300
      group-hover:scale-110
      group-hover:rotate-12
      overflow-hidden
    `}>
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      {subscription.plan === 'premium' && <Crown className="w-3.5 h-3.5 text-white drop-shadow-md" />}
      {subscription.plan === 'entreprise' && <Building className="w-3.5 h-3.5 text-white drop-shadow-md" />}
      {subscription.plan === 'basic' && <Star className="w-3.5 h-3.5 text-white drop-shadow-md" />}
      
      {/* 🔹 Étoile scintillante */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1 h-1 bg-white rounded-full animate-ping" />
      </div>
    </div>
  </div>

  {/* 👤 Infos utilisateur - AMÉLIORÉES */}
  <div className="relative flex-1 min-w-0 z-10">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200 group-hover:from-cyan-100 transition-all duration-300">
            {profile.full_name}
          </h3>
          {profile.verified && (
            <Badge className="bg-blue-500/20 border-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full">
              <Check className="w-3 h-3" />
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs font-medium text-cyan-300/90">@{profile.username}</p>
          <span className="text-[9px] text-gray-500">•</span>
          <div className={`
            flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full
            ${
              subscription.plan === 'premium'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                : subscription.plan === 'entreprise'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                : 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
            }
          `}>
            {subscription.plan === 'premium' && <Crown className="w-2.5 h-2.5" />}
            {subscription.plan === 'entreprise' && <Building className="w-2.5 h-2.5" />}
            {subscription.plan === 'basic' && <Star className="w-2.5 h-2.5" />}
            <span>
              {subscription.plan === 'premium' ? 'Premium' : 
               subscription.plan === 'entreprise' ? 'Entreprise' : 'Basic'}
            </span>
          </div>
        </div>
      </div>

      {/* 🔹 Indicateur de complétion - DESIGN ULTRA ÉLÉGANT */}
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
          {/* 🔸 Badge pourcentage AMÉLIORÉ */}
          <div className={`
            flex items-center justify-center
            min-w-[32px] h-6 px-2
            rounded-xl
            text-xs font-bold
            shadow-lg
            ${
              profileCompletion >= 80
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                : profileCompletion >= 50
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-yellow-500/30'
                : 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-red-500/30'
            }
            transform transition-all duration-300
            group-hover:scale-105
            relative
            overflow-hidden
          `}>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            {profileCompletion}%
            <div className="absolute -right-1 -top-1 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
          
          {/* 🔸 Icône contextuelle avec animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {profileCompletion >= 80 ? (
              <CheckCircle className="w-5 h-5 text-green-400 drop-shadow-lg" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
            )}
          </motion.div>
        </div>

        {/* 🔸 Barre de progression ÉLÉGANTE */}
        <div className="w-full mt-2">
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(profileCompletion, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`
                h-full rounded-full relative overflow-hidden
                ${
                  profileCompletion >= 80
                    ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600'
                    : profileCompletion >= 50
                    ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600'
                    : 'bg-gradient-to-r from-red-500 via-orange-500 to-red-600'
                }
                shadow-lg
              `}
            >
              {/* 🔹 Animation scintillante */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              
              {/* 🔹 Points lumineux */}
              <div className="absolute inset-0 flex items-center justify-between px-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 text-right font-medium">
            {profileCompletion >= 80 ? 'Profil complet ✨' : 
             profileCompletion >= 50 ? 'Encore quelques infos' : 'Complétez votre profil'}
          </p>
        </div>
      </div>
    </div>

    {/* 🔹 Action au hover - AMÉLIORÉE */}
    <div className={`
      mt-3 p-2.5 rounded-xl
      bg-white/5 border border-white/10
      flex items-center justify-between
      opacity-0 group-hover:opacity-100
      translate-y-2 group-hover:translate-y-0
      transition-all duration-300
      group-hover:bg-gradient-to-r
      ${
        subscription.plan === 'premium'
          ? 'group-hover:from-cyan-500/10 group-hover:to-blue-500/10'
          : subscription.plan === 'entreprise'
          ? 'group-hover:from-purple-500/10 group-hover:to-indigo-500/10'
          : 'group-hover:from-blue-500/10 group-hover:to-gray-500/10'
      }
    `}>
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-cyan-400" />
        <span className="font-medium text-sm bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300">
          Modifier le profil
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-cyan-400 transform transition-transform group-hover:translate-x-1" />
    </div>
  </div>

  {/* 🔹 Badge angle supérieur droit - OPTIONNEL */}
  {profileCompletion >= 80 && (
    <div className="absolute -top-2 -right-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full animate-pulse opacity-75" />
        <div className="relative bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-yellow-500/50 flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          Complet
        </div>
      </div>
    </div>
  )}
</motion.div>

{/* 🔹 Styles personnalisés pour les animations */}
<style jsx global>{`
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite linear;
  }
  @keyframes grid {
    0% { background-position: 0 0; }
    100% { background-position: 20px 20px; }
  }
  .bg-grid-white\/5 {
    background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), 
                      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 10px 10px;
    animation: grid 10s linear infinite;
  }
`}</style>

{/* 🔹 Section 4: Boutons Actions - ULTRA COMPACT avec BADGES ICÔNES */}
<style>{`
  @keyframes floatBubble {
    0% { transform: translateY(0) scale(0.6); opacity: 0.6; }
    100% { transform: translateY(-15px) scale(1.2); opacity: 0; }
  }
  .bubble {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 70%);
    pointer-events: none;
    filter: blur(0.2px);
    opacity: 0.4;
    animation: floatBubble 1.5s ease-out forwards;
    z-index: 1;
  }
  .bubble-1 { animation-delay: 0s; left: 25%; bottom: 1px; width: 2.5px; height: 2.5px; }
  .bubble-2 { animation-delay: 0.2s; left: 45%; bottom: 1px; width: 2px; height: 2px; }
  .bubble-3 { animation-delay: 0.4s; left: 65%; bottom: 1px; width: 3px; height: 3px; }
  .bubble-4 { animation-delay: 0.6s; left: 80%; bottom: 1px; width: 2.2px; height: 2.2px; }
  .dashboard-action-btn {
    position: relative;
    overflow: visible !important; /* 🔑 CRUCIAL : badges visibles */
    transition: all 0.25s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
  }
  .dashboard-action-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.08) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
    z-index: 1;
  }
  .dashboard-action-btn:hover::after {
    opacity: 1;
  }
  .dashboard-action-btn:hover {
    transform: translateY(-0.5px) scale(1.015) !important;
    box-shadow: var(--hover-shadow) !important;
  }
  .dashboard-action-btn:active {
    transform: translateY(0.5px) scale(0.985) !important;
  }
`}</style>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5"> {/* 🔑 gap-1.5 pour densité maximale */}
  
  {/* 🌐 Voir profil public - CYAN */}
  <Link href={`/${locale}/${profile.username}`} target="_blank">
    <Button
      className={`
        dashboard-action-btn
        w-full h-9 sm:h-10 /* 🔑 ULTRA COMPACT : h-9 */
        bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600
        text-white font-medium text-[11px] sm:text-xs /* 🔑 Texte minimal */
        rounded-lg
        group
        relative
        shadow-md shadow-cyan-500/15
        hover:shadow-cyan-500/25
        [--hover-shadow:0_4px_12px_-2px_rgba(6,182,212,0.3),0_3px_6px_-3px_rgba(59,130,246,0.2)]
      `}
      onMouseMove={(e) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
        btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
      }}
    >
      {/* 🔑 Conteneur bulles - overflow-visible */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
      </div>
      
      {/* Lueur hover subtile */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
      
      {/* 🔑 Contenu ultra-compact */}
      <div className="relative z-10 flex items-center justify-center gap-1"> {/* 🔑 gap-1 */}
        <Globe className="h-3.5 w-3.5 group-hover:scale-115 transition-transform duration-250" /> {/* 🔑 h-3.5 w-3.5 */}
        <span className="hidden xs:inline whitespace-nowrap">Profil</span> {/* 🔑 Texte court */}
      </div>
      
      {/* 🔑 BADGE ICÔNE - Parfaitement visible */}
      <div className="absolute -top-1 -right-1 bg-yellow-400 border-[1.5px] border-white rounded-full p-0.5 shadow-sm animate-pulse z-20">
        <Globe className="w-2 h-2 text-amber-900" />
 {/* 🔑 w-2 h-2 */}
      </div>
    </Button>
  </Link>

  {/* 🛒 Gestion des commandes - BLEU FONCÉ */}
  <Button
    onClick={() => router.push(isAdmin ? '/admin/orders' : '/dashboard/orders')}
    className={`
      dashboard-action-btn
      w-full h-9 sm:h-10
      bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900
      text-white font-medium text-[11px] sm:text-xs
      rounded-lg
      group
      relative
      shadow-md shadow-blue-900/20
      hover:shadow-blue-800/30
      [--hover-shadow:0_4px_12px_-2px_rgba(59,130,246,0.2),0_3px_6px_-3px_rgba(30,64,175,0.25)]
    `}
    onMouseMove={(e) => {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
      btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
    }}
  >
    <div className="absolute inset-0 overflow-visible pointer-events-none">
      <div className="bubble bubble-1" />
      <div className="bubble bubble-2" />
      <div className="bubble bubble-3" />
      <div className="bubble bubble-4" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
    <div className="relative z-10 flex items-center justify-center gap-1">
      <ShoppingBag className="h-3.5 w-3.5 group-hover:scale-115 transition-transform duration-250" />
      <span className="hidden xs:inline whitespace-nowrap">Commandes</span>
    </div>
  </Button>

  {/* 📅 Voir vos événements - CYAN (Conditionnel) */}
  {(subscription.plan === 'premium' || (subscription.plan === 'entreprise' && hasCompany)) && (
    <Button
      onClick={() => setIsEventModalOpen(true)}
      className={`
        dashboard-action-btn
        w-full h-9 sm:h-10
        bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600
        text-white font-medium text-[11px] sm:text-xs
        rounded-lg
        group
        relative
        shadow-md shadow-cyan-500/15
        hover:shadow-cyan-500/25
        [--hover-shadow:0_4px_12px_-2px_rgba(6,182,212,0.3),0_3px_6px_-3px_rgba(59,130,246,0.2)]
      `}
      onMouseMove={(e) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
        btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
      }}
    >
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
      <div className="relative z-10 flex items-center justify-center gap-1">
        <Calendar className="h-3.5 w-3.5 group-hover:rotate-3 group-hover:scale-110 transition-transform duration-250" />
        <span className="hidden xs:inline whitespace-nowrap">Événements</span>
      </div>
    </Button>
  )}

  {/* ➕ Créer un événement - VERT (Conditionnel) */}
  {(subscription.plan === 'premium' || (subscription.plan === 'entreprise' && hasCompany)) && (
    <Button
      onClick={() => setIsEventFormOpen(true)}
      className={`
        dashboard-action-btn
        w-full h-9 sm:h-10
        bg-gradient-to-r from-green-600 via-emerald-500 to-green-600
        text-white font-medium text-[11px] sm:text-xs
        rounded-lg
        group
        relative
        shadow-md shadow-green-500/15
        hover:shadow-green-500/25
        [--hover-shadow:0_4px_12px_-2px_rgba(16,185,129,0.3),0_3px_6px_-3px_rgba(22,163,74,0.2)]
      `}
      onMouseMove={(e) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
        btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
      }}
    >
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
      <div className="relative z-10 flex items-center justify-center gap-1">
        <Plus className="h-3.5 w-3.5 group-hover:scale-125 transition-transform duration-250" />
        <span className="hidden xs:inline whitespace-nowrap">Créer</span>
      </div>
      
      {/* 🔑 BADGE ICÔNE PREMIUM - Visible et élégant */}
      <div className="absolute -top-1 -right-1 bg-purple-500 border-[1.5px] border-white rounded-full p-0.5 shadow-sm z-20">
        <Crown className="w-2 h-2 text-amber-200 fill-current" />
      </div>
    </Button>
  )}

  {/* 🏢 Espace Business - VIOLET (Conditionnel) */}
  {subscription.plan === 'entreprise' && hasCompany && (
    <Link href="/dashboard/entreprise">
      <Button
        className={`
          dashboard-action-btn
          w-full h-9 sm:h-10
          bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600
          text-white font-medium text-[11px] sm:text-xs
          rounded-lg
          group
          relative
          shadow-md shadow-purple-500/20
          hover:shadow-purple-500/30
          [--hover-shadow:0_4px_12px_-2px_rgba(124,58,237,0.3),0_3px_6px_-3px_rgba(99,102,241,0.2)]
        `}
        onMouseMove={(e) => {
          const btn = e.currentTarget;
          const rect = btn.getBoundingClientRect();
          btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
          btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
        }}
      >
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          <div className="bubble bubble-1" />
          <div className="bubble bubble-2" />
          <div className="bubble bubble-3" />
          <div className="bubble bubble-4" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
        <div className="relative z-10 flex items-center justify-center gap-1">
          <Building className="h-3.5 w-3.5 group-hover:scale-115 transition-transform duration-250" />
          <span className="hidden xs:inline whitespace-nowrap">Business</span>
        </div>
        
        {/* 🔑 BADGE ICÔNE ENTREPRISE - Visible et animé */}
        <div className="absolute -top-1 -right-1 bg-amber-400 border-[1.5px] border-white rounded-full p-0.5 shadow-sm animate-pulse z-20">
          <Briefcase className="w-2 h-2 text-amber-900 fill-current" />
        </div>
      </Button>
    </Link>
  )}
</div>

  {/* ========================================
   SECTION: Gestion des Cartes NFC
   ======================================== */}
<Card className="glass-section border border-white/15 rounded-xl bg-white/5 backdrop-blur-sm w-full shadow-lg shadow-black/20">
  <CardHeader className="border-b border-white/10 pb-4">
    <CardTitle className="flex items-center flex-wrap gap-3">
      {/* Icône NFC */}
      <div className="p-2 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg">
        <CreditCard className="w-5 h-5 text-purple-400" />
      </div>
      
      <span>{t('nfc.title') || 'Carte NFC'}</span>
      
      {/* Badge statut - CORRIGÉ */}
      {loadingCards ? (
        <div className="w-20 h-6 bg-white/10 rounded-lg animate-pulse" />
      ) : hasOrderedCard ? (
        <Badge 
          className={`
            ${
              activeCard?.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : activeCard?.status === 'lost'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
            }
          `}
        >
          {activeCard?.status === 'active' ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1 inline" />
              {t('nfc.active') || 'Active'}
            </>
          ) : activeCard?.status === 'lost' ? (
            <>
              <XCircle className="w-3 h-3 mr-1 inline" />
              {t('nfc.lost') || 'Perdue'}
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3 mr-1 inline" />
              {t('nfc.inactive') || 'Inactive'}
            </>
          )}
        </Badge>
      ) : (
        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
          <XCircle className="w-3 h-3 mr-1 inline" />
          {t('nfc.none') || 'Aucune'}
        </Badge>
      )}
    </CardTitle>
  </CardHeader>
  
  <CardContent className="pt-4">
    {/* 🔹 Cas 1: Utilisateur n'a pas encore commandé de carte */}
    {!hasOrderedCard && (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-gray-300">
            {t('nfc.no_card_message') || 'Vous n\'avez pas encore de carte NFC LUVIKA.'}
          </p>
          <p className="text-sm text-gray-400">
            {t('nfc.no_card_description') || 'Commandez votre carte NFC personnalisée pour partager facilement vos informations en un simple tap.'}
          </p>
        </div>

        {/* Avantages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">
                {t('nfc.benefit1_title') || 'Livraison rapide'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {t('nfc.benefit1_desc') || 'Recevez votre carte en 3-5 jours ouvrables'}
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">
                {t('nfc.benefit2_title') || 'Personnalisable'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {t('nfc.benefit2_desc') || 'Design unique avec votre QR code et infos'}
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">
                {t('nfc.benefit3_title') || 'Durabilité'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {t('nfc.benefit3_desc') || 'Carte en PVC haute qualité, résistante à l\'eau'}
            </p>
          </div>
        </div>

        {/* Bouton commander */}
        <Button
          onClick={handleOrderCard}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
          {t('nfc.order_button') || 'Commander ma carte NFC'}
          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    )}

    {/* 🔹 Cas 2: Utilisateur a au moins une carte - SANS SECTION STATS */}
    {hasOrderedCard && (
      <div className="space-y-4">
        {/* Informations sur la carte */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {t('nfc.card_id') || 'Carte'} #{activeCard?.card_id || activeCard?.matricule || activeCard?.id.slice(0, 8)}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(activeCard?.created_at).toLocaleDateString()}
                </p>
                {activeCard?.matricule && (
                  <p className="text-xs text-gray-500">
                    Matricule: {activeCard.matricule}
                  </p>
                )}
              </div>
            </div>
            <Badge 
              className={`
                ${
                  activeCard?.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : activeCard?.status === 'lost'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                }
              `}
            >
              {activeCard?.status === 'active' ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1 inline" />
                  {t('nfc.active') || 'Active'}
                </>
              ) : activeCard?.status === 'lost' ? (
                <>
                  <XCircle className="w-3 h-3 mr-1 inline" />
                  {t('nfc.lost') || 'Perdue'}
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1 inline" />
                  {t('nfc.inactive') || 'Inactive'}
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
  onClick={() => {
    loadNfcCards(); // Recharger au cas où
    setIsNFCModalOpen(true);
  }}
  className="flex-1 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 text-purple-300 font-semibold py-3 rounded-lg transition-all duration-300 group relative"
>
  <Settings className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
  {t('nfc.manage_button') || 'Gérer mes cartes'}
  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
</Button>

          <Button
            onClick={handleOrderCard}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            {t('nfc.order_another') || 'Commander une autre'}
          </Button>
        </div>

        {/* Message d'information */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300">
            <span className="font-medium">{t('nfc.tip') || '💡 Astuce:'}</span>{' '}
            {t('nfc.tip_message') || 'Personnalisez le contenu de votre carte NFC dans les paramètres pour contrôler les informations partagées.'}
          </p>
        </div>
      </div>
    )}

    {/* 🔹 Indicateur de chargement */}
    {loadingCards && (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="text-gray-400">{'Chargement...'}</span>
      </div>
    )}
  </CardContent>
</Card>
     
{/* 🔹 Colonne unique: Abonnement - DESIGN ULTRA PREMIUM */}
<motion.div
  whileHover={{ y: -2, scale: 1.005 }}
  whileTap={{ scale: 0.995 }}
  className={`
    relative
    glass-section
    border border-white/10
    rounded-2xl
    bg-gradient-to-br
    ${
      subscription.plan === 'premium'
        ? 'from-cyan-900/40 via-blue-900/30 to-transparent'
        : subscription.plan === 'entreprise'
        ? 'from-purple-900/40 via-indigo-900/30 to-transparent'
        : 'from-blue-900/40 via-gray-900/30 to-transparent'
    }
    backdrop-blur-2xl
    w-full
    shadow-2xl
    shadow-black/50
    overflow-hidden
    group
    transition-all duration-500
    hover:border-cyan-500/30
    hover:shadow-cyan-500/15
  `}
>
  {/* 🌊 Fond animé subtil */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -left-1/2 -top-1/2 w-full h-full bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="absolute inset-0 bg-grid-white/3 bg-[size:30px_30px]" />
  </div>

  {/* 🔹 Bordure lumineuse animée */}
  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-border-shimmer" />
  </div>

  <CardHeader className="relative z-10 border-b border-white/5 pb-5">
    <CardTitle className="flex items-center flex-wrap gap-3">
      {/* 🔸 Icône abonnement avec animation */}
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={`
          p-2.5 rounded-xl
          bg-gradient-to-br
          ${
            subscription.plan === 'premium'
              ? 'from-cyan-500/20 to-blue-500/20'
              : subscription.plan === 'entreprise'
              ? 'from-purple-500/20 to-indigo-500/20'
              : 'from-blue-500/20 to-gray-500/20'
          }
          shadow-lg
          shadow-black/30
        `}
      >
        <CreditCard className={`
          w-6 h-6
          ${
            subscription.plan === 'premium'
              ? 'text-cyan-300'
              : subscription.plan === 'entreprise'
              ? 'text-purple-300'
              : 'text-blue-300'
          }
          drop-shadow-md
        `} />
      </motion.div>
      
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
        {t('subscription.title')}
      </span>
      
      {/* 🔸 Badge du plan - DESIGN ÉLÉGANT */}
      <Badge className={`
        px-3 py-1.5
        rounded-xl
        font-bold
        text-sm
        shadow-lg
        ${
          subscription.plan === 'premium'
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 border border-cyan-500/30'
            : subscription.plan === 'entreprise'
            ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-purple-500/30 border border-purple-500/30'
            : 'bg-gradient-to-r from-blue-600 to-gray-700 text-white shadow-blue-500/30 border border-blue-500/30'
        }
        flex items-center gap-1.5
        transform transition-all duration-300
        group-hover:scale-105
        relative
        overflow-hidden
      `}>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        {subscription.plan === 'premium' && <Crown className="w-3.5 h-3.5" />}
        {subscription.plan === 'entreprise' && <Building className="w-3.5 h-3.5" />}
        {subscription.plan === 'basic' && <Star className="w-3.5 h-3.5" />}
        {t(`subscription.plans.${subscription.plan}`) || subscription.plan}
        
        {/* 🔹 Étoile scintillante */}
        <div className="absolute -right-1 -top-1 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
      </Badge>
      
      {/* 🔸 Indicateur lumineux - AMÉLIORÉ */}
      <div className="flex items-center gap-2" aria-live="polite">
        {subscription.active ? (
          <>
            <motion.div
              className="relative w-4 h-4 rounded-full bg-green-500/95"
              style={{ 
                boxShadow: '0 0 12px 4px rgba(34, 197, 94, 0.7)',
                filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))'
              }}
              animate={{ 
                opacity: [1, 0.6, 1],
                scale: [1, 1.15, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              role="status"
              aria-label={t('subscription.active_indicator')}
            >
              <motion.div 
                className="absolute inset-0 rounded-full bg-green-300/40"
                animate={{ scale: [0.9, 1.3, 0.9] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeOut" 
                }}
              />
              <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-green-300 text-sm font-bold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {t('subscription.active')}
              </span>
              <span className="text-[10px] text-green-400/80 font-medium mt-0.5">
                ✨ Accès complet
              </span>
            </div>
          </>
        ) : (
          <>
            <div 
              className="w-4 h-4 rounded-full bg-yellow-400/80 relative"
              style={{ 
                boxShadow: '0 0 8px rgba(234, 179, 8, 0.6)',
                filter: 'drop-shadow(0 0 6px rgba(234, 179, 8, 0.4))'
              }}
              role="status"
              aria-label={t('subscription.inactive_indicator')}
            >
              <div className="absolute inset-0 rounded-full bg-yellow-200/30 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-yellow-300 text-sm font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t('subscription.inactive')}
              </span>
              <span className="text-[10px] text-yellow-400/80 font-medium mt-0.5">
                ⚠️ Renouvellement requis
              </span>
            </div>
          </>
        )}
      </div>
    </CardTitle>
  </CardHeader>
  
  <CardContent className="relative z-10 pt-5">
    {/* 🔹 Message contextuel avec icône */}
    <div className={`
      p-4 rounded-xl
      mb-5
      flex items-start gap-3
      ${
        subscription.active
          ? 'bg-green-500/10 border border-green-500/20'
          : 'bg-yellow-500/10 border border-yellow-500/20'
      }
    `}>
      {subscription.active ? (
        <div className="mt-0.5 text-green-400">
          <CheckCircle className="w-5 h-5" />
        </div>
      ) : (
        <div className="mt-0.5 text-yellow-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
      )}
      <div>
        <p className="font-medium text-white">
          {subscription.active
            ? t('subscription.active_until', { date: '∞' })
            : t('subscription.upgrade_prompt')}
        </p>
        <p className="text-[13px] text-gray-300 mt-1">
          {subscription.active
            ? '✅ Votre abonnement est actif et renouvelé automatiquement'
            : '💡 Passez au niveau supérieur pour débloquer toutes les fonctionnalités'}
        </p>
      </div>
    </div>
    
    {/* 🔹 Bouton d'upgrade - DESIGN PREMIUM */}
    {profile.plan !== 'entreprise' && (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          size="lg"
          onClick={() => setActiveModal('upgrade')}
          className={`
            w-full
            py-4
            font-bold
            text-base
            rounded-xl
            relative
            overflow-hidden
            shadow-xl
            transition-all duration-300
            ${
              profile.plan === 'basic'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600'
                : 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600'
            }
            text-white
            border-0
            group/btn
          `}
        >
          {/* 🔹 Fond animé du bouton */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
          
          {/* 🔹 Particules scintillantes */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-ping"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                  opacity: '0.6'
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 flex items-center justify-center gap-2">
            {profile.plan === 'basic' ? (
              <>
                <Crown className="w-5 h-5" />
                {t('subscription.upgrade_to_premium')}
              </>
            ) : (
              <>
                <Building className="w-5 h-5" />
                {t('subscription.request_enterprise')}
              </>
            )}
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </div>
          
          {/* 🔹 Badge angle supérieur droit */}
          <div className="absolute -top-2 -right-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full animate-pulse opacity-75" />
              <div className="relative bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-yellow-500/50">
                {profile.plan === 'basic' ? '✨' : '🚀'}
              </div>
            </div>
          </div>
        </Button>
        
        {/* 🔹 Texte incitatif sous le bouton */}
        <p className="text-center text-[12px] text-gray-400 mt-3 font-medium">
          {profile.plan === 'basic'
            ? '💎 Débloquez les fonctionnalités premium dès aujourd\'hui'
            : '🏢 Solution personnalisée pour votre entreprise'}
        </p>
      </motion.div>
    )}
    
    {/* 🔹 Statut détaillé en bas */}
    <div className="mt-6 pt-4 border-t border-white/5">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-gray-400">Statut du compte :</span>
        <span className={`
          font-semibold px-2.5 py-1 rounded-full text-[12px]
          ${
            subscription.active
              ? 'bg-green-500/15 text-green-300 border border-green-500/20'
              : 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/20'
          }
        `}>
          {subscription.active ? '✅ Actif' : '⚠️ Inactif'}
        </span>
      </div>
      {subscription.active && (
        <div className="mt-2 flex items-center justify-between text-[13px]">
          <span className="text-gray-400">Prochain renouvellement :</span>
          <span className="text-cyan-300 font-medium">Jamais (à vie)</span>
        </div>
      )}
    </div>
  </CardContent>

  {/* 🔹 Badge angle inférieur gauche - OPTIONNEL */}
  {subscription.active && (
    <div className="absolute -bottom-3 -left-3">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full animate-pulse opacity-75" />
        <div className="relative bg-gradient-to-r from-emerald-400 to-cyan-500 text-black text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-cyan-500/50 flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          <span>À VIE</span>
        </div>
      </div>
    </div>
  )}
</motion.div>

{/* 🔹 Styles personnalisés pour les animations */}
<style jsx global>{`
  @keyframes border-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-border-shimmer {
    animation: border-shimmer 3s infinite linear;
  }
  @keyframes grid {
    0% { background-position: 0 0; }
    100% { background-position: 30px 30px; }
  }
  .bg-grid-white\/3 {
    background-image: linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), 
                      linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 30px 30px;
    animation: grid 15s linear infinite;
  }
`}</style>



      {/* 🔹 Menu flottant - reste en overlay */}
      <DashboardQuickMenu onAction={handleQuickAction} actions={quickActions} />

        {/* 🔹 MODAL ÉVÉNEMENTS - Scroll fluide et sans débordement */}
<AnimatePresence>
  {/* 🔹 MODAL ÉVÉNEMENTS */}
  {isEventModalOpen && (
    <motion.div
      key="event-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setIsEventModalOpen(false)}
    >
              <motion.div
                initial={{ 
                  scale: 0.95, 
                  opacity: 0,
                  y: 20 
                }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  y: 0,
                  transition: { 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 300,
                    mass: 0.5
                  }
                }}
                exit={{ 
                  scale: 0.95, 
                  opacity: 0,
                  y: 20,
                  transition: { duration: 0.2 }
                }}
                className="relative w-full max-w-4xl h-[90vh] flex flex-col bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl shadow-cyan-500/10"
                onClick={e => e.stopPropagation()}
              >
                {/* 🔘 Bouton fermeture (toujours visible) */}
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-gray-300 hover:text-white transition-all duration-300 shadow-lg shadow-black/50 backdrop-blur-sm"
                  aria-label="Fermer la fenêtre"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>

                {/* 📱 CONTENEUR SCROLL PRINCIPAL - Structure optimale */}
                <div className="flex-1 min-h-0 overflow-y-auto ">

                  {/* 🔹 HEADER FIXE (ne scroll pas) */}
                  <div className="sticky top-0 z-40 bg-gradient-to-b from-gray-900/95 to-transparent backdrop-blur-sm border-b border-white/10 py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-xl">
                        <Calendar className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                          Gestion des événements
                        </h2>
                        <p className="mt-1.5 text-sm text-gray-400 max-w-2xl">
                          Visualisez les participants, scannez des QR codes et gérez vos événements en temps réel
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 🔹 CONTENU SCROLLABLE (zone principale) */}
                  <div className="flex-grow overflow-y-auto overscroll-contain py-4 px-4 sm:px-6 md:px-8">
                    {/* ✅ Contenu principal avec gestion de scroll */}
                    <div className="space-y-6">
                      <EventAttendeesSection plan={profile.plan ?? null} />
                      
                      {/* 🔹 Espacement en bas pour le footer */}
                      <div className="h-6" />
                    </div>
                  </div>

                  {/* 🔹 FOOTER FIXE (ne scroll pas) */}
                  <div className="sticky bottom-0 z-40 bg-gradient-to-t from-gray-900/95 to-transparent backdrop-blur-sm border-t border-white/10 py-4 px-6">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                      <span>Données mises à jour en temps réel</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

  {/* 🔹 MODAL CRÉATION ÉVÉNEMENT */}
  {isEventFormOpen && (
    <motion.div
      key="event-form-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={() => setIsEventFormOpen(false)}
    >
      <motion.div
        initial={{ 
          scale: 0.95, 
          opacity: 0,
          y: 20 
        }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: 0,
          transition: { 
            type: "spring", 
            damping: 25, 
            stiffness: 300,
            mass: 0.5
          }
        }}
        exit={{ 
          scale: 0.95, 
          opacity: 0,
          y: 20,
          transition: { duration: 0.2 }
        }}
        className="relative w-full max-w-3xl max-h-[95vh] bg-gradient-to-br from-green-900/30 to-emerald-900/10 backdrop-blur-2xl rounded-3xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/20 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 🔘 Bouton fermeture premium (toujours visible) */}
        <button
          onClick={() => setIsEventFormOpen(false)}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-gray-300 hover:text-white transition-all duration-300 shadow-lg shadow-black/50 backdrop-blur-sm"
          aria-label="Fermer la fenêtre"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* 🌿 Décorations de fond animées */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Radial gradient subtil */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.15),transparent_70%)]" />
          
          {/* Particules flottantes */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-emerald-400/20 backdrop-blur-sm"
              style={{
                width: `${Math.random() * 80 + 20}px`,
                height: `${Math.random() * 80 + 20}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        {/* 📱 Contenu scrollable avec padding responsive */}
        <div className="relative z-10 h-full overflow-y-auto overscroll-contain">
          {/* Header avec dégradé */}
          <div className="sticky top-0 z-40 bg-gradient-to-b from-green-900/50 to-transparent backdrop-blur-sm border-b border-emerald-500/20 py-5 px-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                <Plus className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-300">
                  Créer un nouvel événement
                </h2>
                <p className="mt-1 text-sm text-emerald-200/80">
                  Configurez votre événement en quelques étapes simples
                </p>
              </div>
            </div>
          </div>

          {/* Contenu principal avec padding responsive */}
          <div className="p-4 sm:p-6">
            <CreateEventForm
              onSubmit={async (data) => {
                try {
                  const response = await fetch('/api/events/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  });
                  
                  if (!response.ok) throw new Error('Erreur création événement');
                  
                  const eventData = await response.json();
                  console.log('✅ Événement créé:', eventData);
                  
                  setIsEventFormOpen(false);
                  toast.success('🎉 Événement créé avec succès !', {
                    description: 'Votre événement est prêt à recevoir des participants',
                    duration: 5000,
                  });
                } catch (error) {
                  console.error('❌ Erreur:', error);
                  toast.error('❌ Erreur lors de la création', {
                    description: "Une erreur est survenue. Veuillez réessayer.",
                    duration: 5000,
                  });
                }
              }}
              onClose={() => setIsEventFormOpen(false)}
              isLoading={false}
            />
          </div>

          {/* Footer décoratif */}
          <div className="sticky bottom-0 z-40 bg-gradient-to-t from-green-900/50 to-transparent backdrop-blur-sm border-t border-emerald-500/20 py-4 px-6 mt-6">
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-300/70">
              <Leaf className="w-3 h-3" />
              <span>Événement éco-responsable • Zéro papier</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
  {/* 🔹 MODAUX INDÉPENDANTS - CLÉS STATIQUES (pas de Date.now !) */}
  {isPortfolioModalOpen && (
    <PortfolioModal
      key="portfolio-modal" // ✅ STATIQUE (pas de Date.now)
      isOpen={true}
      onClose={() => setIsPortfolioModalOpen(false)}
      profileId={profile.id}
    />
  )}
  {isCertificatesModalOpen && (
    <CertificatesModal
      key="certificates-modal" // ✅ STATIQUE
      isOpen={true}
      onClose={() => setIsCertificatesModalOpen(false)}
      profileId={profile.id}
    />
  )}
  {activeModal === 'upgrade' && profile.plan !== 'entreprise' && (
    <UpgradeModal
      key="modal-upgrade"
      isOpen={true}
      onClose={closeModal}
      onConfirm={handleUpgradeRequest}
      isSubmitting={isSubmitting}
    />
  )}
  {activeModal === 'followers' && (
    <FollowersModal
      key="modal-followers"
      isOpen={true}
      onClose={closeModal}
      profileId={profile.id}
      totalFollowers={totalFollowers || 0}
    />
  )}
  {isContactModalOpen && (
    <ContactRequestsSection
      key="contact-requests-modal" // ✅ STATIQUE
      isOpen={true}
      onClose={() => setIsContactModalOpen(false)}
    />
  )}
  {showSignOutConfirm && (
    <SignOutConfirmSheet
      key="signout-confirm-modal" // ✅ STATIQUE
      isOpen={true}
      onClose={() => setShowSignOutConfirm(false)}
      onConfirm={handleLogout}
      t={t}
      tNavbar={tNavbar}
    />
  )}

  {/* 🔹 MODAUX NFC - CONDITIONNELS AVEC CLÉS EXPLICITES */}
  {isNFCModalOpen && ( // ✅ Conditionnel + key explicite
    <NFCModal
      key="nfc-modal" // 🔑 CLÉ MANQUANTE AJOUTÉE
      isOpen={true}
      onClose={() => setIsNFCModalOpen(false)}
      cards={nfcCards}
      onManageCard={(card) => {
        setSelectedCardForManagement(card);
        setIsNFCModalOpen(false);
        setIsManagementModalOpen(true);
      }}
    />
  )}
  {isManagementModalOpen && ( // ✅ Conditionnel + key explicite
    <NFCManagementModal
      key="nfc-management-modal" // 🔑 CLÉ MANQUANTE AJOUTÉE
      isOpen={true}
      onClose={() => {
        setIsManagementModalOpen(false);
        setSelectedCardForManagement(null);
      }}
      card={selectedCardForManagement}
      onActionComplete={() => {
        loadNfcCards();
        toast.success('✅ Action effectuée avec succès');
      }}
    />
  )}
 {/* 🔹 MODAL RECHERCHE - AJOUT DE key */}
  {isSearchModalOpen && (
    <motion.div
      key="search-modal" // 🔑 CLÉ MANQUANTE AJOUTÉE
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setIsSearchModalOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-2xl p-6 border border-white/15 h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🔹 En-tête du modal */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Search className="w-6 h-6 text-purple-400" />
              Rechercher des profils Luvika
            </h2>
            <p className="text-sm text-gray-400">
              Trouvez et suivez d'autres utilisateurs de la plateforme
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchModalOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 🔹 Barre de recherche */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* 🔹 Indicateur de chargement */}
        {isSearching && searchQuery && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-gray-400 text-lg">Recherche en cours...</span>
          </div>
        )}

        {/* 🔹 Résultats de recherche */}
        {searchQuery && !isSearching && searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((result, index) => (
  <div
    key={result.id ?? result.username ?? `search-${index}`}
    className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group"
  >

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center overflow-hidden">
                      {result.avatar_url ? (
                        <img
                          src={result.avatar_url}
                          alt={result.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    
                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-white truncate">
                          {result.full_name}
                        </div>
                        {result.plan && (
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {result.plan}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        @{result.username}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFollow(result.id)}
                      className={`h-9 ${
                        followStatus[result.id]
                          ? 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                      }`}
                    >
                      {followStatus[result.id] ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Suivi</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Suivre</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/${locale}/${result.username}`, '_blank')}
                      className="h-9 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🔹 Message "Aucun résultat" */}
        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
            <div className="flex justify-center mb-4">
              <Search className="w-12 h-12 text-gray-500" />
            </div>
            <p className="text-gray-400 text-lg mb-2">
              Aucun utilisateur trouvé pour "{searchQuery}"
            </p>
            <p className="text-gray-500 text-sm">
              Essayez un autre nom ou username
            </p>
          </div>
        )}

        {/* 🔹 Message initial */}
        {!searchQuery && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Commencez à taper pour rechercher...</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      {/* Modal succès */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t('subscription.success_title') || '✅ Succès !'}
        message={t('subscription.success_message') || 'Un admin vous contactera sous 24h.'}
      />
    </div>
  );
}

function closeModal() {
  throw new Error('Function not implemented.');
}
