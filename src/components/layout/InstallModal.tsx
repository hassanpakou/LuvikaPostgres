// src/components/layout/InstallModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, Smartphone, Download, 
  Sparkle, Share2, Plus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallModal() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem('install_modal_shown');
    if (alreadyShown) return;

    // Détection iOS
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(ios);
    
    // Android / Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS / Safari
    const isInStandaloneMode = 'standalone' in window.navigator && (window.navigator as any).standalone;
    if (ios && !isInStandaloneMode) {
      setShow(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if ((window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();
      (window as any).deferredPrompt.userChoice.then(() => {
        setShow(false);
        localStorage.setItem('install_modal_shown', 'true');
      });
    } else {
      setShow(false);
      localStorage.setItem('install_modal_shown', 'true');
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('install_modal_shown', 'true');
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
      >
        <div className="glass-border rounded-2xl p-5 bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/50 relative overflow-hidden">
          {/* Décoration intérieure */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-full blur-3xl"></div>
          
          {/* Bouton fermer */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors p-1"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>

          <div className="relative z-10">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Installer Luvika</h2>
                <p className="text-cyan-300 text-sm font-medium">Application Progressive Web (PWA)</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {isIOS ? (
                <>
                  <span className="font-medium text-cyan-300">Sur iOS :</span> Cliquez sur le bouton <Share2 className="w-3.5 h-3.5 inline mx-0.5 align-middle" /> 
                  <span className="align-middle">"Partager"</span>, puis <Plus className="w-3.5 h-3.5 inline mx-0.5 align-middle" /> 
                  <span className="align-middle">"Ajouter à l'écran d'accueil"</span>.
                </>
              ) : (
                <>
                  <span className="font-medium text-cyan-300">Sur Android :</span> Cliquez sur "Installer" pour ajouter Luvika à votre écran d'accueil. 
                  L'application fonctionnera comme une app native avec notifications push et accès hors-ligne.
                </>
              )}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {!isIOS && (
                <Button 
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-sm"
                  onClick={handleInstall}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Installer l'application
                </Button>
              )}
              
              <Button 
                size="sm"
                variant="outline" 
                className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 font-medium"
                onClick={handleClose}
              >
                Plus tard
              </Button>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-gray-500">
              <p className="flex items-center gap-1.5">
                <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>L'installation est gratuite et ne prend que quelques secondes</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}