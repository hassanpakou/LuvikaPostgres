'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Heart, Download, X, Mail, Check, 
  Settings, AlertTriangle, MessageSquare, Send,
  Eye, Bell, Plus, ArrowRight, Contact, QrCode, Package, ArrowUp, Search, Users
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import SimulateNFCTap from '@/components/nfc/SimulateNFCTap';
import { generateQRBase64 } from '@/lib/qr';
import SearchModal from '@/src/components/dashboard/SearchModal';
import FollowersModal from '@/src/components/dashboard/FollowersModal';

const formatDistance = (dateString: string, t: any): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  const router = useRouter();

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

// 🔹 ✅ Modal : Visibilité
// ✅ Après — type flexible
const VisibilityModal = ({
  sectionsVisibility,
  onClose,
  onSave,
}: {
  sectionsVisibility: Record<string, boolean>;
  onClose: () => void;
  onSave: (newVisibility: Record<string, boolean>) => void;
}) => {
  const [localSections, setLocalSections] = useState(sectionsVisibility);
  const t = useTranslations('dashboard.visibility');

  
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
            <Eye size={20} className="text-purple-400" />
            {t('title')}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="space-y-4">
          {(['bio', 'contact', 'social', 'portfolio', 'certificates'] as const).map(section => (
            <label key={section} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-300 capitalize">{section}</span>
              <input
                type="checkbox"
                checked={localSections[section] !== false}
                onChange={e => setLocalSections(prev => ({ ...prev, [section]: e.target.checked }))}
                className="rounded text-cyan-500 focus:ring-cyan-500"
              />
            </label>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-500" 
            onClick={() => {
              onSave(localSections);
              onClose();
            }}
          >
            Sauvegarder
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 🔹 ✅ Modal : Réception des messages
const ContactToggleModal = ({
  enabled,
  onToggle,
  onClose,
}: {
  enabled: boolean;
  onToggle: () => void;
  onClose: () => void;
}) => {
  const t = useTranslations('dashboard.contact_requests');

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
            <Bell size={20} className="text-cyan-400" />
            {t('title')}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <p className="text-gray-300 mb-4">{t('description')}</p>
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
          <div>
            <h3 className="font-medium text-white">{t('label')}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {enabled ? t('enabled') : t('disabled')}
            </p>
          </div>
          <Button
            variant={enabled ? "destructive" : "default"}
            size="sm"
            onClick={onToggle}
            className={`flex items-center gap-2 ${
              enabled 
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30' 
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {enabled ? (
              <>
                <X size={16} />
                {t('disable')}
              </>
            ) : (
              <>
                <Check size={16} />
                {t('enable')}
              </>
            )}
          </Button>
        </div>

        <div className="text-center">
          <Button variant="outline" className="text-gray-300" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 🔹 ✅ Modal : Signalement carte
const ReportCardModal = ({
  reportReason,
  setReportReason,
  customReason,
  setCustomReason,
  onSubmit,
  onClose,
}: {
  reportReason: string;
  setReportReason: (v: string) => void;
  customReason: string;
  setCustomReason: (v: string) => void;
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
            <AlertTriangle size={20} className="text-yellow-400" />
            {t('report_card')}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        <div className="space-y-3 mb-4">
          {[
            { value: 'lost', label: t('reasons.lost') },
            { value: 'stolen', label: t('reasons.stolen') },
            { value: 'damaged', label: t('reasons.damaged') },
            { value: 'no_longer_needed', label: t('reasons.no_longer_needed') },
            { value: 'other', label: t('reasons.other') },
          ].map(reason => (
            <div key={reason.value} className="flex items-start gap-3">
              <input
                type="radio"
                id={`reason-${reason.value}`}
                name="report-reason"
                checked={reportReason === reason.value}
                onChange={() => setReportReason(reason.value)}
                className="mt-1.5 rounded text-cyan-500 focus:ring-cyan-500"
              />
              <label 
                htmlFor={`reason-${reason.value}`} 
                className="text-gray-300 cursor-pointer"
              >
                {reason.label}
              </label>
            </div>
          ))}
        </div>

        {reportReason === 'other' && (
          <div className="mb-4">
            <label htmlFor="custom-reason" className="text-sm text-gray-400 mb-1 block">
              {t('custom_reason')}
            </label>
            <Textarea
              id="custom-reason"
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              placeholder={t('custom_reason_placeholder')}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              rows={2}
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={!reportReason || (reportReason === 'other' && !customReason.trim())}
            onClick={onSubmit}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {t('submit_report')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
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
                Un administrateur vous contactera sous 24h pour finaliser votre passage à Premium ou Entreprise.
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

// 🔹 ✅ Modal : NFC
const NFCModal = ({
  isOpen,
  onClose,
  cards,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  cards: { id: string; card_id: string; status: string; created_at: string }[];
  onAdd: () => void;
}) => {
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
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 w-6 h-6 rounded-full flex items-center justify-center">
                <span className="text-black text-xs">N</span>
              </span>
              Cartes NFC
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-amber-400" size={28} />
              </div>
              <p className="text-gray-400">Aucune carte NFC.</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {cards.map(card => (
                <div key={card.id} className="glass-border bg-white/5 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-mono text-sm text-blue-300">{card.card_id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(card.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      card.status === 'active' ? 'bg-green-500/20 text-green-300' :
                      card.status === 'lost' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {card.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black"
            onClick={() => {
              onAdd();
              onClose();
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Ajouter une carte
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// 🔹 ✅ Modal : Commandes
const OrdersModal = ({
  isOpen,
  onClose,
  isAdmin,
  router, // ✅ ajouté
}: {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  router: ReturnType<typeof useRouter>; // ✅ typé
}) => {
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
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package size={20} className="text-violet-400" />
              Commandes
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="glass-border bg-white/5 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">Carte NFC Premium</p>
                  <p className="text-sm text-gray-400">Livraison estimée $ 5 : 48 heures</p>
                </div>
                <span className="px-2 py-1 text-xs bg-violet-500/20 text-violet-300 rounded">
                  En attente
                </span>
              </div>
            </div>
          </div>
<Button
  className="w-full mb-3 border-white/20 text-white hover:bg-white/10"
  onClick={async () => {
    const res = await fetch('/api/orders', { method: 'POST' });
    if (res.ok) {
      router.push('/dashboard/orders?success=1'); // ✅ maintenant défini
      onClose();
    }
  }}
>
  <Plus className="w-4 h-4 mr-1" /> Commander une carte NFC
</Button>

<Button
  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
  onClick={() => {
    window.location.href = isAdmin ? '/admin/orders' : '/dashboard/orders';
    onClose();
  }}
>
  Voir toutes les commandes <ArrowRight className="ml-2 w-4 h-4" />
</Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// 🔹 ✅ Menu flottant (version linéaire — sans dépendance externe)
const DashboardQuickMenu = ({ onAction }: { onAction: (id: string) => void }) => {
  // 🔹 Fallback temporaire pour éviter l'erreur de traduction
  const t_quick = (key: string) => {
    const fallback: Record<string, string> = {
      visibility: '👁️ Visibilité',
      contact: '✉️ Messages',
      qr: '🖼️ QR',
      nfc: '📱 NFC',
      report: '⚠️ Signaler',
      message: '💬 Message',
      orders: '📦 Commandes',
      upgrade: '⬆️ Upgrade',
      search: '🔎 Recherche',
      followers: '❤️ Abonnés',
    };
    return fallback[key] || key;
  };

  const actions = [
    { id: 'visibility', label: t_quick('visibility'), icon: <Eye size={14} />, color: 'bg-purple-500' },
    { id: 'contact', label: t_quick('contact'), icon: <Bell size={14} />, color: 'bg-cyan-500' },
    { id: 'qr', label: t_quick('qr'), icon: <QrCode size={14} />, color: 'bg-blue-500' },
    { id: 'nfc', label: t_quick('nfc'), icon: <Contact size={14} />, color: 'bg-emerald-500' },
    { id: 'report', label: t_quick('report'), icon: <AlertTriangle size={14} />, color: 'bg-red-500' },
    { id: 'message', label: t_quick('message'), icon: <MessageSquare size={14} />, color: 'bg-indigo-500' },
    { id: 'orders', label: t_quick('orders'), icon: <Package size={14} />, color: 'bg-violet-500' },
    { id: 'upgrade', label: t_quick('upgrade'), icon: <ArrowUp size={14} />, color: 'bg-amber-500' },
    { id: 'search', label: 'Rechercher', icon: <Search size={14} />, color: 'bg-orange-500' },
    { id: 'followers', label: 'Abonnés', icon: <Users size={14} />, color: 'bg-green-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="flex flex-wrap justify-center gap-2 p-3 glass-border backdrop-blur-xl rounded-full border border-white/15 bg-white/5">
        {actions.map(action => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(action.id)}
            className={`w-11 h-11 rounded-full flex items-center justify-center ${action.color} text-white shadow-md hover:shadow-lg transition-all`}
            title={action.label}
          >
            {action.icon}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// 🔹 Types
type Profile = {
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
};

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

export default function DashboardContent({
  user, profile, cards, recentScans,
  totalScans, qrBase64, profileUrl, planColors, isAdmin, totalFollowers,
}: Props) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const router = useRouter();
  const [hasLiked, setHasLiked] = useState(false);
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

  const [reportReason, setReportReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const closeModal = () => setActiveModal(null);

  const subscription = useMemo(() => {
    const plan = (profile.plan || 'basic').toLowerCase() as 'basic' | 'premium' | 'entreprise';
    return { plan, active: plan === 'premium' || plan === 'entreprise', expires_at: undefined };
  }, [profile.plan]);

  const handleLike = () => setHasLiked(!hasLiked);
  const handleQuickAction = (actionId: string) => setActiveModal(actionId);

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
        closeModal();
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

  return (
    <div className="space-y-8 pb-28">
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

      {/* Commandes */}
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

      {/* Abonnement */}
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
              ? t('subscription.active_until', { date: '∞' })
              : t('subscription.upgrade_prompt')}
          </p>
          {!subscription.active && (
            <Button
              size="sm"
              className="mt-3 bg-gradient-to-r from-blue-600 to-cyan-500"
              onClick={() => setActiveModal('upgrade')}
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

      {/* 🔹 ✅ Menu flottant */}
      <DashboardQuickMenu onAction={handleQuickAction} />

      {/* 🔹 ✅ Modaux — TOUT INCLUS */}
      <AnimatePresence>
        {activeModal === 'visibility' && (
  <VisibilityModal
    sectionsVisibility={sectionsVisibility}
    onClose={closeModal}
    onSave={(newVisibility) => {
      setSectionsVisibility(newVisibility);
      saveSectionsVisibility(newVisibility);
    }}
  />
)}
        {activeModal === 'contact' && (
          <ContactToggleModal
            enabled={acceptsContactRequests}
            onToggle={toggleContactRequests}
            onClose={closeModal}
          />
        )}
        {activeModal === 'report' && (
          <ReportCardModal
            reportReason={reportReason}
            setReportReason={setReportReason}
            customReason={customReason}
            setCustomReason={setCustomReason}
            onSubmit={handleReportCard}
            onClose={closeModal}
          />
        )}
        {activeModal === 'message' && (
          <CustomMessageModal
            value={customMessage}
            onChange={setCustomMessage}
            onSubmit={handleSendCustomMessage}
            onClose={closeModal}
          />
        )}
        {activeModal === 'upgrade' && !subscription.active && (
          <UpgradeModal
            isOpen={true}
            onClose={closeModal}
            onConfirm={handleUpgradeRequest}
            isSubmitting={isSubmitting}
          />
        )}
        {activeModal === 'qr' && (
          <QRModal
            isOpen={true}
            onClose={closeModal}
            profileUrl={profileUrl}
            username={profile.username}
          />
        )}
        {activeModal === 'nfc' && (
          <NFCModal
            isOpen={true}
            onClose={closeModal}
            cards={cards}
            onAdd={() => router.push('/dashboard/nfc/add')}
          />
        )}
        {activeModal === 'orders' && (
          <OrdersModal
            isOpen={true}
            onClose={closeModal}
            isAdmin={isAdmin}
            router={router} // ✅ passé ici
        />
        )}

        {/* ✅ Ajoutez-le ici : */}
        {activeModal === 'search' && (
            <SearchModal
              isOpen={true}
              onClose={closeModal}
            />
        )}
        {/* 🔹 ✅ Modal Abonnés */}
        {activeModal === 'followers' && (
  <FollowersModal
    isOpen={true}
    onClose={closeModal}
    profileId={profile.id}
    totalFollowers={totalFollowers}
          />
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