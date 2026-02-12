'use client';

import { useState, useEffect, useRef } from 'react';
import { PlusCircle, QrCode, Share2, Mail, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicProfile } from '../../types/profile';

type Props = {
  profile: PublicProfile;
  setShowQRModal: (val: boolean) => void;
  onContactClick?: () => void;
};

export default function FloatingButtons({ profile, setShowQRModal, onContactClick }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic en dehors
  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isOpen]);

  // Sons & vibration (SSR safe)
  const toggleSound = typeof window !== 'undefined' ? new Audio('/click.mp3') : null;
  const actionSound = typeof window !== 'undefined' ? new Audio('/click.mp3') : null;

  const playToggleSound = () => {
    if (toggleSound) {
      toggleSound.currentTime = 0;
      toggleSound.play().catch(() => {});
    }
  };

  const playActionSound = () => {
    if (actionSound) {
      actionSound.currentTime = 0;
      actionSound.play().catch(() => {});
    }
  };

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Actions
  const downloadVCard = () => {
    playActionSound();
    vibrate([50, 30, 50]);

    const { full_name = '', job_title = '', company = '', email = '', phone = '', whatsapp = '', address = '', city = '', country = '', website = '', username = '' } = profile;
    const profileUrl = `https://luvika.me/${username}`;
    const fullAddress = [address, city, country].filter(Boolean).join('; ');

    const vCardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${full_name}`,
      job_title && `TITLE:${job_title}`,
      company && `ORG:${company}`,
      email && `EMAIL:${email}`,
      phone && `TEL;TYPE=WORK,VOICE:${phone}`,
      whatsapp && `TEL;TYPE=CELL,VOICE:${whatsapp}`,
      fullAddress && `ADR;TYPE=WORK:;;${fullAddress}`,
      website && `URL:${website}`,
      `NOTE:LUVIKA — ${profileUrl}`,
      'END:VCARD',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username || 'contact'}.vcf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const shareProfile = () => {
    playActionSound();
    vibrate(60);
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: `Profil ${profile.full_name || 'LUVIKA'}`,
          text: 'Découvrez ce profil sur LUVIKA',
          url,
        })
        .catch(() => navigator.clipboard.writeText(url));
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const buttons = [
    { label: 'Ajouter contact', icon: <PlusCircle className="w-5 h-5" />, onClick: downloadVCard, color: 'from-cyan-500 to-cyan-300' },
    { label: 'QR Code', icon: <QrCode className="w-5 h-5" />, onClick: () => { playActionSound(); vibrate(50); setShowQRModal(true); }, color: 'from-purple-500 to-purple-300' },
    { label: 'Partager', icon: <Share2 className="w-5 h-5" />, onClick: shareProfile, color: 'from-amber-500 to-amber-300' },
    { label: 'Écris-moi', icon: <Mail className="w-5 h-5" />, onClick: () => { playActionSound(); vibrate(50); onContactClick?.(); }, color: 'from-emerald-500 to-emerald-300' },
  ];

  return (
    <>
      {/* Backdrop unique (noir + flou combinés) */}
      {isOpen && (
        <AnimatePresence>
          <motion.div
            key="backdrop"                           // ← clé obligatoire
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        </AnimatePresence>
      )}

      {/* Menu flottant */}
      <motion.div
        ref={containerRef}
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Tooltip */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 right-0 bg-black/75 backdrop-blur-xl text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-nowrap pointer-events-none"
          >
            Cliquez
          </motion.div>
        )}

        {/* Boutons du menu (quand ouvert) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="menu-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-3 flex flex-col items-end space-y-2.5"
            >
              {buttons.map((btn, idx) => (
                <motion.button
                  key={btn.label}                    // ← mieux que idx (plus stable)
                  onClick={() => {
                    btn.onClick();
                    setIsOpen(false);
                  }}
                  initial={{ scale: 0.7, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.7, opacity: 0, y: 8 }}
                  transition={{
                    delay: idx * 0.05,
                    type: 'spring',
                    stiffness: 400,
                    damping: 18,
                  }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${btn.color} text-white shadow-lg flex items-center justify-center border border-white/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  title={btn.label}
                  aria-label={btn.label}
                >
                  {btn.icon}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton toggle principal */}
        <motion.button
          onClick={() => {
            playToggleSound();
            vibrate(25);
            setIsOpen(!isOpen);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-300 text-white shadow-xl border-2 border-white/30 flex items-center justify-center"
          animate={{
            rotate: isOpen ? 180 : 0,
            y: isOpen ? -4 : 0,
          }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          title={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <ChevronDown className="w-7 h-7" /> : <ChevronUp className="w-7 h-7" />}
        </motion.button>
      </motion.div>
    </>
  );
}