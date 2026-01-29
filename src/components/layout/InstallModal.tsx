'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function InstallModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem('install_modal_shown');
    if (alreadyShown) return;

    // Android / Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS / Safari
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandaloneMode = 'standalone' in window.navigator && window.navigator.standalone;
    if (isIos && !isInStandaloneMode) {
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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-lg relative text-white">
        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-200 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-2">Installer Luvika</h2>
        <p className="mb-4 text-sm">
          { (window as any).deferredPrompt
            ? 'Cliquez sur "Installer" pour ajouter Luvika à votre écran d’accueil.'
            : 'Sur iOS : cliquez sur le bouton "Partager" puis "Ajouter à l’écran d’accueil".'
          }
        </p>

        <Button className="bg-cyan-500 hover:bg-cyan-600 w-full" onClick={handleInstall}>
          Installer
        </Button>
      </div>
    </div>
  );
}
