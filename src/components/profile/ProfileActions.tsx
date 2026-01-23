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

  // Cache les boutons desktop au scroll
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

  // Boutons communs
  const buttons = [
    { label: 'Contact', icon: <Download className="w-5 h-5" />, onClick: downloadVCard },
    { label: 'QR', icon: <QrCode className="w-5 h-5" />, onClick: () => setShowQRModal(true) },
    { label: 'Partager', icon: <Share2 className="w-5 h-5" />, onClick: shareProfile },
  ];

  return (
    <>
      {/* 🔹 Desktop / Tablette */}
      <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center items-center gap-4 md:hidden lg:flex">
        {buttons.map((btn, idx) => (
          <motion.button
            key={`desktop-${idx}`}
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
              boxShadow: '0 0 12px rgba(37, 99, 235, 0.7), 0 0 24px rgba(37, 99, 235, 0.5)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {btn.icon}
            <span className="text-sm font-semibold">{btn.label}</span>
          </motion.button>
        ))}
      </div>

      {/* 🔹 Mobile — Navbar bottom */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 hidden md:block lg:hidden"
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="bg-black/80 backdrop-blur-xl border-t border-white/10">
          <div className="flex justify-around items-center py-3 px-2">
            {buttons.map((btn, idx) => (
              <button
                key={`mobile-${idx}`}
                onClick={btn.onClick}
                className="flex flex-col items-center gap-1 w-16 p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label={btn.label}
              >
                <motion.div
                  className="text-cyan-300"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {btn.icon}
                </motion.div>
                <span className="text-[10px] text-gray-300 font-medium">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}