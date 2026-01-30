'use client';

import { useState, useEffect, useRef } from 'react';
import { PlusCircle, QrCode, Share2, Mail, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicProfile } from '../../types/profile';

type Props = {
  profile: PublicProfile;
  setShowQRModal: (val: boolean) => void;
  onContactClick?: () => void;
};

export default function FloatingButtons({ profile, setShowQRModal, onContactClick }: Props) {
  const [showFloating, setShowFloating] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll mobile
  useEffect(() => {
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const currentScroll = window.scrollY;
      setShowFloating(!(currentScroll > lastScroll && currentScroll > 80));
      lastScroll = currentScroll;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hint auto-hide
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isOpen]);

  // Sons & vibration
  const toggleSound = new Audio('/click.mp3'); // toggle click
  const actionSound = new Audio('/click.mp3'); // action click

  const playToggleSound = () => { toggleSound.currentTime = 0; toggleSound.play().catch(() => {}); };
  const playActionSound = () => { actionSound.currentTime = 0; actionSound.play().catch(() => {}); };
  const vibrate = (pattern: number | number[]) => navigator.vibrate?.(pattern);

  // Actions
  const downloadVCard = () => {
    playActionSound();
    vibrate([50, 30, 50]);

    const { full_name='', job_title='', company='', email='', phone='', whatsapp='', address='', city='', country='', website='', username='' } = profile;
    const profileUrl = `https://luvika.me/${username}`;
    const fullAddress = [address, city, country].filter(Boolean).join(';');

    const vCardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${full_name}`,
      job_title && `TITLE:${job_title}`,
      company && `ORG:${company}`,
      email && `EMAIL:${email}`,
      phone && `TEL;TYPE=WORK:${phone}`,
      whatsapp && `TEL;TYPE=CELL:${whatsapp}`,
      fullAddress && `ADR;TYPE=WORK:;;${fullAddress}`,
      website && `URL:${website}`,
      `NOTE:LUVIKA — ${profileUrl}`,
      'END:VCARD',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${username || 'contact'}.vcf`;
    a.click();
  };

  const shareProfile = () => {
    playActionSound();
    vibrate(60);
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: `Profil ${profile.full_name}`, text: 'Découvrez ce profil sur LUVIKA', url });
    else navigator.clipboard.writeText(url);
  };

  const buttons = [
    { label: 'Ajouter contact', icon: <PlusCircle className="w-5 h-5" />, onClick: downloadVCard },
    { label: 'QR Code', icon: <QrCode className="w-5 h-5" />, onClick: () => { playActionSound(); vibrate(50); setShowQRModal(true); } },
    { label: 'Partager', icon: <Share2 className="w-5 h-5" />, onClick: shareProfile },
    { label: 'Écris-moi', icon: <Mail className="w-5 h-5" />, onClick: () => { playActionSound(); vibrate(50); onContactClick?.(); } },
  ];

  // Positions des boutons en arc
  const buttonPositions = [
    { x: 0, y: -70 },
    { x: -60, y: -50 },
    { x: -70, y: 0 },
    { x: -60, y: 50 },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <motion.div ref={containerRef} className="fixed bottom-6 right-6 z-50 md:hidden" animate={{ y: showFloating ? 0 : 120 }}>

        {/* Hint "Clique-moi" */}
        <AnimatePresence>
          {showHint && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0.4, 1, 0.4], y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-16 right-0 flex items-center gap-2 bg-black/75 backdrop-blur-xl text-white text-xs px-3 py-1.5 rounded-full border border-white/10 shadow-xl"
            >
              <span className="select-none flex items-center gap-1">
                👆 Clique-moi
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>⬇️</motion.span>
              </span>

              <button
                onClick={(e) => { e.stopPropagation(); setShowHint(false); }}
                className="ml-1 w-4 h-4 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-3 h-3 text-white/80" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boutons en arc */}
        <AnimatePresence>
          {isOpen && buttons.map((btn, idx) => (
            <motion.button
              key={idx}
              onClick={() => { btn.onClick(); setIsOpen(false); }}
              initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
              animate={{ scale: 1, opacity: 1, x: buttonPositions[idx].x, y: buttonPositions[idx].y }}
              exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute w-11 h-11 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-cyan-400 flex items-center justify-center shadow-lg"
              whileTap={{ scale: 0.9 }}
            >
              {btn.icon}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Toggle principal */}
        <motion.button
          onClick={() => { playToggleSound(); vibrate(25); setIsOpen(!isOpen); }}
          className="w-14 h-14 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-xl"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <PlusCircle className="w-7 h-7" />
        </motion.button>
      </motion.div>
    </>
  );
}
