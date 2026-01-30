// src/components/profile/FloatingButtons.tsx
'use client';

import { useState, useEffect } from 'react';
import { Book, Download, PlusCircle, QrCode, Share2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { PublicProfile } from '../../types/profile';

type Props = {
  profile: PublicProfile;
  setShowQRModal: (val: boolean) => void;
  onContactClick?: () => void;
};

export default function FloatingButtons({
  profile,
  setShowQRModal,
  onContactClick, // 👈 Nouvelle prop
}: {
  profile: PublicProfile;
  setShowQRModal: (val: boolean) => void;
  onContactClick?: () => void; // 👈 Optionnel
}) {
  const [showFloating, setShowFloating] = useState(true);

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

const downloadVCard = () => {
  const {
    full_name = '',
    job_title = '',
    company = '',
    email = '',
    phone = '',
    whatsapp = '',
    address = '',
    website = '',
    city = '',
    country = '',
    username = ''
  } = profile;

  // Construit l'adresse complète
  const fullAddress = [address, city, country].filter(Boolean).join(';');

  // URL du profil LUVIKA
  const profileUrl = `https://luvika.me/${username}`;

  // Génère le contenu vCard
  const vCardContent = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${full_name}`,
    job_title ? `TITLE:${job_title}` : '',
    company ? `ORG:${company}` : '',
    email ? `EMAIL:${email}` : '',
    phone ? `TEL;TYPE=WORK,VOICE:${phone}` : '',
    whatsapp ? `TEL;TYPE=CELL,VOICE:${whatsapp}` : '',
    fullAddress ? `ADR;TYPE=WORK:;;${fullAddress}` : '',
    website ? `URL:${website}` : '',
    `NOTE:Profil LUVIKA — ${profileUrl}`,
    'END:VCARD'
  ]
    .filter(Boolean) // Supprime les lignes vides
    .join('\r\n');

  // Crée le fichier
  const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${username || 'contact'}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
};

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
    label: 'Ajouter contact',
    icon: <PlusCircle className="w-5 h-5" />,
    onClick: downloadVCard,
  },
  {
    label: 'QR Code',
    icon: <QrCode className="w-5 h-5" />,
    onClick: () => setShowQRModal(true),
  },
  {
    label: 'Partager',
    icon: <Share2 className="w-5 h-5" />,
    onClick: shareProfile,
  },
  {
    label: 'Écris-moi',
    icon: <Mail className="w-5 h-5" />,
    onClick: onContactClick || (() => {}),
  },
];


  return (
    <>
      {/* 🔹 Desktop / Tablette: compact vertical floating buttons */}
      <div className="fixed right-6 bottom-6 z-50 hidden md:flex flex-col gap-3">
  {buttons.map((btn, idx) => (
    <motion.div
      key={`desktop-${idx}`}
      className="relative group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: showFloating ? 1 : 0, y: showFloating ? 0 : 20 }}
      transition={{ duration: 0.3, delay: idx * 0.05 }}
    >
      {/* Tooltip */}
      <span
        className="
          absolute right-14 top-1/2 -translate-y-1/2
          bg-black/90 text-white text-xs px-3 py-1.5 rounded-md
          opacity-0 translate-x-2
          group-hover:opacity-100 group-hover:translate-x-0
          transition-all duration-200
          whitespace-nowrap shadow-lg
        "
      >
        {btn.label}
      </span>

      {/* Button */}
      <motion.button
        onClick={btn.onClick}
        aria-label={btn.label}
        className="
          w-12 h-12 rounded-full
          bg-black/70 backdrop-blur-md
          border border-white/10
          text-white flex items-center justify-center
          shadow-lg
          hover:bg-cyan-500/20
        "
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {btn.icon}
      </motion.button>
    </motion.div>
  ))}
</div>


      {/* 🔹 Mobile — Navbar bottom */}
      <motion.div
  className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
  initial={{ y: 80 }}
  animate={{ y: 0 }}
  transition={{ type: 'spring', damping: 20, stiffness: 250 }}
>
  <div className="bg-black/85 backdrop-blur-xl border-t border-white/10">
    <div className="flex justify-around items-center py-3 px-2">
      {buttons.map((btn, idx) => (
        <button
          key={`mobile-${idx}`}
          onClick={btn.onClick}
          className="
            flex flex-col items-center gap-1
            w-20 py-2 rounded-xl
            active:bg-white/10
            transition
          "
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="text-cyan-400"
          >
            {btn.icon}
          </motion.div>

          <span className="text-[11px] text-gray-300 font-medium">
            {btn.label}
          </span>
        </button>
      ))}
    </div>
  </div>
</motion.div>

    </>
  );
}