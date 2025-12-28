'use client';

import { useState, useEffect, useMemo } from 'react'; // ✅ useMemo ajouté
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Heart, Download, X, Mail, Check } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SimulateNFCTap from '@/components/nfc/SimulateNFCTap';

import { generateQRBase64 } from '@/lib/qr';

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

// 🔹 Modal de succès — inchangé
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

// ✅ Type mis à jour — ajout de `plan?`
type Profile = {
  id: string;
  full_name: string;
  username: string;
  job_title?: string;
  is_public?: boolean;
  bio_short?: string;
  sections_visibility?: Record<string, boolean>;
  accepts_contact_requests?: boolean;
  plan?: string | null; // ✅ ajouté — ESSENTIEL
  likes_count?: number; // ✅ ajouté

};

// ❌ Supprimé : type Subscription (plus utilisé)

type Card = {
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

// ✅ Props mis à jour — suppression de `subscription`
type Props = {
  user: { id: string };
  profile: Profile; // ✅ contient maintenant `plan`
  cards: Card[];
  recentScans: Scan[];
  totalScans: number;
  qrBase64: string;
  profileUrl: string;
  planColors: Record<string, string>;
  //likesCount: number;
  isAdmin: boolean;
};

export default function DashboardContent({
  user, profile, cards, recentScans,
  totalScans, qrBase64, profileUrl, planColors, isAdmin,
}: Props) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const router = useRouter();
  const [hasLiked, setHasLiked] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

// 🔹 ✅ CALCUL AUTO DU subscription — avec expires_at (optionnel)
const subscription = useMemo(() => {
  const plan = (profile.plan || 'basic').toLowerCase() as 'basic' | 'premium' | 'entreprise';
  // 🔸 Si vous n’avez PAS encore de champ `plan_expires_at`, laissez undefined
  // 🔸 Sinon, ajoutez-le dans le type Profile et décommentez la ligne ci-dessous
  const expires_at = undefined; // ou profile.plan_expires_at ?? undefined;

  return {
    plan,
    active: plan === 'premium' || plan === 'entreprise',
    expires_at, // ✅ maintenant présent
  };
}, [profile.plan /*, profile.plan_expires_at si ajouté */]);

  // 🔍 Debug temporaire — à commenter après vérification
  useEffect(() => {
    console.log('🔍 profile.plan =', profile.plan);
    console.log('🔍 computed subscription =', subscription);
  }, [profile.plan, subscription]);

  const handleLike = () => setHasLiked(!hasLiked);
const updateVisibility = (section: string, checked: boolean) => {
  const newVisibility = { ...sectionsVisibility, [section]: checked };
  setSectionsVisibility(newVisibility);
  saveSectionsVisibility(newVisibility); // ✅ Sauvegarde immédiate
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
      a.download = `luvika-scans-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('❌ Échec de l’export');
    }
  };

  const handleUpgradeRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/upgrade-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, profile_id: profile.id }),
      });

      if (res.ok) {
        setIsUpgradeModalOpen(false);
        setShowSuccessModal(true);
      } else {
        throw new Error();
      }
    } catch {
      alert('❌ Échec. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Sauvegarde immédiate dans la DB
const saveSectionsVisibility = async (newVisibility: Record<string, boolean>) => {
  try {
    const res = await fetch('/api/profile/sections-visibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: user.id, 
        sections_visibility: newVisibility 
      }),
    });
    if (!res.ok) throw new Error('Échec sauvegarde');
  } catch (err) {
    console.error('❌ Sauvegarde sections échouée:', err);
    // Optionnel : rollback UI
    // setSectionsVisibility(prev => ({...prev}));
  }
};

  const toggleContactRequests = async () => {
    try {
      const res = await fetch('/api/profile/contact-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          enabled: !acceptsContactRequests 
        }),
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

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qr = await generateQRBase64(profileUrl, {
          size: 300,
          color: '#2563eb',
        });
        setQrImage(qr);
      } catch (err) {
        console.error('❌ QR generation failed:', err);
        setQrError('Impossible de générer le QR Code.');
      }
    };

    if (profileUrl) {
      generateQR();
    }
  }, [profileUrl]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsUpgradeModalOpen(false);
        setShowSuccessModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {t('greeting', { name: profile.full_name })}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-gray-400 text-sm sm:text-base">{t('subtitle')}</p>
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-gray-300 hover:text-red-400 w-fit"
            >
              <Heart size={16} fill={hasLiked ? 'red' : 'none'} className="transition-colors" />
              <span className="text-sm">{profile.likes_count ?? 0}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
          <Link href={`/${locale}/${profile.username}`} target="_blank" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
              {t('view_public')}
            </Button>
          </Link>

          <Button
            onClick={handleExport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500"
          >
            <Download className="h-4 w-4" />
            {t('export_csv')}
          </Button>

          <Button
            onClick={() => router.push(isAdmin ? '/admin/orders' : '/dashboard/orders')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-900 to-blue-900"
          >
            {t('orders.manage')}
          </Button>
        </div>
      </div>

      {/* Visibilité */}
      <Card className="glass-border">
        <CardHeader><CardTitle>{t('visibility.title')}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">{t('visibility.description')}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(['bio', 'contact', 'social', 'portfolio', 'certificates'] as const).map(section => (
              <label key={section} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sectionsVisibility[section] !== false}
                  onChange={e => updateVisibility(section, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-300 capitalize">{section}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Réception des messages */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="text-cyan-400" size={20} />
            {t('contact_requests.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">
            {t('contact_requests.description')}
          </p>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <h3 className="font-medium text-white">
                {t('contact_requests.label')}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {acceptsContactRequests 
                  ? t('contact_requests.enabled') 
                  : t('contact_requests.disabled')}
              </p>
            </div>
            <Button
              variant={acceptsContactRequests ? "destructive" : "default"}
              size="sm"
              onClick={toggleContactRequests}
              className={`flex items-center gap-2 ${
                acceptsContactRequests 
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30' 
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {acceptsContactRequests ? (
                <>
                  <X size={16} />
                  {t('contact_requests.disable')}
                </>
              ) : (
                <>
                  <Check size={16} />
                  {t('contact_requests.enable')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commandes — condition sur subscription calculé */}
      {(subscription.plan === 'premium' || subscription.plan === 'entreprise') && (
        <Card className="glass-border">
          <CardHeader><CardTitle>{t('orders.title')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">{t('orders.description')}</p>
            <Button
              onClick={() => router.push(isAdmin ? '/admin/orders' : '/dashboard/orders')}
              className="bg-gradient-to-r from-blue-600 to-cyan-500"
            >
              {t('orders.manage')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 🔹 ✅ Abonnement — maintenant toujours synchro */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>{t('subscription.title')}</span>
            <Badge className={`${planColors[subscription.plan] || 'bg-gray-600'} text-white`}>
              {t(`subscription.plans.${subscription.plan}`) || subscription.plan}
            </Badge>
            <Badge className={subscription.active ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}>
              {subscription.active ? t('subscription.active') : t('subscription.inactive')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">
            {subscription.active
              ? t('subscription.active_until', { 
                  date: subscription.expires_at 
                    ? new Date(subscription.expires_at).toLocaleDateString('fr-FR') 
                    : '∞' 
                })
              : t('subscription.upgrade_prompt')}
          </p>
          {!subscription.active && (
            <Button
              size="sm"
              className="mt-3 bg-gradient-to-r from-blue-600 to-cyan-500"
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              {t('subscription.request_upgrade')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* QR & NFC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-border">
          <CardHeader><CardTitle>{t('qr.title')}</CardTitle></CardHeader>
          <CardContent className="text-center">
            {qrBase64 ? (
              <div>
                <img 
                  src={qrBase64} 
                  alt={t('qr.alt', { username: profile.username })}
                  className="mx-auto w-48 h-48 bg-white p-2 rounded-lg"
                />
                <p className="text-sm text-gray-400 mt-2">{t('qr.instructions')}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 border-white/20 text-white hover:bg-white/10"
                  onClick={() => window.open(profileUrl, '_blank')}
                >
                  {t('qr.open_link')}
                </Button>
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-800 rounded-lg mx-auto animate-pulse" />
            )}
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardHeader>
            <CardTitle>{t('nfc.title', { count: cards.length })}</CardTitle>
          </CardHeader>
          <CardContent>
            {cards.length === 0 ? (
              <p className="text-gray-400">{t('nfc.empty')}</p>
            ) : (
              <ul className="space-y-3">
                {cards.map(card => (
                  <li key={card.id} className="flex justify-between items-center p-3 glass-border">
                    <div>
                      <span className="font-mono text-sm text-blue-300">{card.card_id}</span>
                      <div className="text-xs text-gray-400">
                        {formatDistance(card.created_at, t)} {t('nfc.ago')}
                      </div>
                    </div>
                    <Badge className={
                      card.status === 'active' ? 'bg-green-500' :
                      card.status === 'lost' ? 'bg-yellow-500' :
                      card.status === 'blocked' ? 'bg-red-500' : 'bg-gray-500'
                    }>
                      {t(`nfc.status.${card.status}`)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <SimulateNFCTap profileId={profile.id} />
            <Button
              size="sm"
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-500"
              disabled={subscription.plan === 'basic' && cards.length >= 1}
              onClick={() => router.push('/dashboard/nfc/add')}
            >
              {subscription.plan === 'basic' && cards.length >= 1
                ? t('nfc.upgrade_required')
                : t('nfc.add_card')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card className="glass-border">
        <CardHeader><CardTitle>{t('stats.title')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 glass-border">
              <div className="text-3xl font-bold text-blue-300">{totalScans}</div>
              <div className="text-gray-400">{t('stats.total_scans')}</div>
            </div>
            <div className="text-center p-4 glass-border">
              <div className="text-3xl font-bold text-cyan-300">
                {recentScans.filter(s => s.scan_type === 'nfc').length}
              </div>
              <div className="text-gray-400">{t('stats.nfc_scans')}</div>
            </div>
            <div className="text-center p-4 glass-border">
              <div className="text-3xl font-bold text-purple-300">
                {recentScans.filter(s => s.scan_type === 'qr_profile').length}
              </div>
              <div className="text-gray-400">{t('stats.qr_scans')}</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-3">{t('stats.recent_visitors')}</h3>
          {recentScans.length === 0 ? (
            <p className="text-gray-400">{t('stats.no_scans')}</p>
          ) : (
            <ul className="space-y-2">
              {recentScans.map(scan => (
                <li key={scan.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-white">
                      {scan.profiles?.full_name || t('stats.anonymous')}
                    </span>
                    <span className="text-gray-400 ml-2">
                      ({scan.scan_type === 'nfc' ? t('stats.scan_type.nfc') : t('stats.scan_type.qr')})
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {formatDistance(scan.created_at, t)} {t('nfc.ago')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Modal Upgrade */}
      {isUpgradeModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsUpgradeModalOpen(false)}
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
                onClick={() => setIsUpgradeModalOpen(false)}
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
                    {t('subscription.request_upgrade')}
                  </h2>
                  <p className="text-gray-300">
                    Un administrateur vous contactera sous 24h pour finaliser votre passage à Premium ou Entreprise.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    onClick={() => setIsUpgradeModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
                    onClick={handleUpgradeRequest}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi...' : '✅ Envoyer la demande'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Modal succès */}
      <AnimatePresence>
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title={t('subscription.success_title') || '✅ Succès !'}
          message={t('subscription.success_message') || 'Un admin vous contactera sous 24h.'}
        />
      </AnimatePresence>
    </div>
  );
}