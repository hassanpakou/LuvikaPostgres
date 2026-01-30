'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, QrCode, Share2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicProfile } from '../../types/profile';

type Props = {
  profile: PublicProfile;
  setShowQRModal: (val: boolean) => void;
  onContactClick?: () => void;
};

export default function FloatingButtons({
  profile,
  setShowQRModal,
  onContactClick,
}: Props) {
  const [showFloating, setShowFloating] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  /* 🔹 Scroll hide (mobile) */
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

  /* 🔊 Son */
  const clickSound = new Audio('/vibrator.mp3');
  const playSound = () => {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  };

  /* 📳 Vibration */
  const vibrate = (ms = 30) => {
    if (navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  /* 📇 vCard */
  const downloadVCard = () => {
    playSound();
    vibrate();

    const {
      full_name = '',
      job_title = '',
      company = '',
      email = '',
      phone = '',
      whatsapp = '',
      address = '',
      city = '',
      country = '',
      website = '',
      username = '',
    } = profile;

    const fullAddress = [address, city, country].filter(Boolean).join(';');
    const profileUrl = `https://luvika.me/${username}`;

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
      `NOTE:Profil LUVIKA — ${profileUrl}`,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    const blob = new Blob([vCardContent], {
      type: 'text/vcard;charset=utf-8',
    });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${username || 'contact'}.vcf`;
    a.click();
  };

  /* 🔗 Partage */
  const shareProfile = () => {
    playSound();
    vibrate();

    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Profil de ${profile.full_name}`,
        text: `Découvrez le profil de ${profile.full_name} sur LUVIKA`,
        url,
      });
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
      onClick: () => {
        playSound();
        vibrate();
        setShowQRModal(true);
      },
    },
    {
      label: 'Partager',
      icon: <Share2 className="w-5 h-5" />,
      onClick: shareProfile,
    },
    {
      label: 'Écris-moi',
      icon: <Mail className="w-5 h-5" />,
      onClick: () => {
        playSound();
        vibrate();
        onContactClick?.();
      },
    },
  ];

  return (
    <>
      {/* ================= DESKTOP ================= */}
      <div className="fixed right-6 bottom-6 z-50 hidden md:flex flex-col gap-3">
        {buttons.map((btn, idx) => (
          <motion.div
            key={idx}
            className="relative group"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <span
              className="absolute right-14 top-1/2 -translate-y-1/2
              bg-black/90 text-white text-xs px-3 py-1.5 rounded-md
              opacity-0 group-hover:opacity-100 transition"
            >
              {btn.label}
            </span>

            <motion.button
              onClick={btn.onClick}
              className="w-12 h-12 rounded-full
              bg-black/70 backdrop-blur-md
              border border-white/10
              text-white flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {btn.icon}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* ================= MOBILE TOGGLE ================= */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 md:hidden"
        animate={{ y: showFloating ? 0 : 120 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="flex flex-col gap-3 mb-4 items-end"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {buttons.map((btn, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    btn.onClick();
                    setIsOpen(false);
                  }}
                  className="w-11 h-11 rounded-full
                  bg-black/80 backdrop-blur-md
                  border border-white/10
                  text-cyan-400 flex items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                >
                  {btn.icon}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔘 Toggle principal */}
        <motion.button
          onClick={() => {
            playSound();
            vibrate(40);
            setIsOpen(!isOpen);
          }}
          className="w-14 h-14 rounded-full
          bg-cyan-500 text-black
          flex items-center justify-center shadow-xl"
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
