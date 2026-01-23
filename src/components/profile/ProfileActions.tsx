'use client';

import { useState, useEffect } from 'react';
import { Download, QrCode, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

type Profile = {
  full_name?: string;
  username?: string;
};

export default function FloatingButtons({
  profile,
  setShowQRModal,
}: {
  profile: Profile;
  setShowQRModal: (val: boolean) => void;
}) {
  const [showFloating, setShowFloating] = useState(true);

  // Hide on scroll
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

  // Télécharger vCard
  const downloadVCard = () => {
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name || ''}
NOTE:Contact via LUVIKA — luvika.me/${profile.username || ''}
END:VCARD`
      .trim()
      .replace(/\n/g, '\r\n');

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.username || 'contact'}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Partager profil
  const shareProfile = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: `Profil de ${profile.full_name}`,
          text: `Découvrez le profil de ${profile.full_name} sur LUVIKA`,
          url,
        })
        .catch(console.warn);
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Lien copié !'));
    }
  };

  const buttons = [
    {
      label: 'Ajouter au contact',
      icon: <Download className="w-5 h-5 text-cyan-200" />,
      onClick: downloadVCard,
      color: '0cf',
    },
    {
      label: 'QR Code',
      icon: <QrCode className="w-5 h-5 text-white" />,
      onClick: () => setShowQRModal(true), // ici on utilise ton vrai code QR
      color: '08f',
    },
    {
      label: 'Partager',
      icon: <Share2 className="w-5 h-5 text-red-300" />,
      onClick: shareProfile,
      color: 'f06',
    },
  ];

  return (
<div className="fixed inset-x-0 bottom-20 z-50 flex justify-center items-center gap-3">
      {buttons.map((btn, idx) => (
        <motion.button
          key={idx}
          onClick={btn.onClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white font-medium shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: showFloating ? 1 : 0,
            y: showFloating ? [0, -2, 0] : 20,
          }}
          transition={{
            opacity: { duration: 0.25 },
            y: {
              duration: showFloating ? 3 : 0.25,
              repeat: showFloating ? Infinity : 0,
              ease: 'easeInOut',
            },
          }}
          whileHover={{
            scale: 1.1,
            textShadow: `0 0 6px #${btn.color}, 0 0 12px #${btn.color}, 0 0 18px #${btn.color}`,
            boxShadow: `0 0 12px #${btn.color}, 0 0 24px #${btn.color}, 0 0 36px #${btn.color}`,
          }}
          whileTap={{ scale: 0.95 }}
        >
          {btn.icon}
          <span className="text-sm font-semibold">{btn.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
