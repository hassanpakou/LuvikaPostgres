'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('luvika_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('luvika_cookie_consent', 'accepted');
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('luvika_cookie_consent', 'rejected');
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-white/10 p-4 sm:p-6"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="text-white">
            <h3 className="font-bold text-lg mb-1">Luvika utilise des cookies</h3>
            <p className="text-gray-300 text-sm max-w-2xl">
              En poursuivant votre navigation sur Luvika, vous acceptez l’utilisation de cookies nécessaires au bon fonctionnement de la plateforme, à la sécurisation de votre session et à l’amélioration de nos services.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleAccept}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-sm"
            >
              Accepter
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              className="border-white/20 text-gray-300 hover:bg-white/10 px-4 py-2 text-sm"
            >
              Refuser
            </Button>
            <Button
              variant="ghost"
              asChild
              className="text-cyan-300 hover:text-cyan-200 px-4 py-2 text-sm"
            >
              <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                Politique de confidentialité
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}