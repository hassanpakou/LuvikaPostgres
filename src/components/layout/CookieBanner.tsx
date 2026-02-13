// src/components/layout/CookiesBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Cookie, ShieldCheck, X, 
  Sparkle, ArrowRight 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
      >
        <div className="glass-border rounded-2xl p-5 bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/50">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                Luvika utilise des cookies
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] py-0.5 px-2">
                  Strictement nécessaires
                </Badge>
              </h3>
            </div>
            <button
              onClick={handleReject}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            En poursuivant votre navigation, vous acceptez l'utilisation de cookies nécessaires au bon fonctionnement de la plateforme, à la sécurisation de votre session et à l'amélioration de nos services.
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/25 text-[11px] py-0.5 px-2">
                <ShieldCheck className="w-3 h-3 mr-0.5 inline" />
                Sécurité
              </Badge>
              <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25 text-[11px] py-0.5 px-2">
                <Sparkle className="w-3 h-3 mr-0.5 inline" />
                Session
              </Badge>
              <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/25 text-[11px] py-0.5 px-2">
                <Settings className="w-3 h-3 mr-0.5 inline" />
                Préférences
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleAccept}
                size="sm"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-sm"
              >
                Accepter
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                className="border-white/20 text-gray-300 hover:bg-white/10 font-medium"
              >
                Refuser
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-cyan-300 hover:text-cyan-200 hover:bg-white/5 font-medium"
              >
                <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                  Politique de confidentialité
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// 🔹 Icône manquante
import { Settings } from 'lucide-react';