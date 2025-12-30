// src/components/profile/QRModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // ✅ plus besoin de AnimatePresence ici
import { Button } from '@/components/ui/button';
import { ExternalLink, QrCode, Copy } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRModal({
  isOpen,
  onClose,
  profileUrl,
  username,
}: {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  username: string;
}) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQrDataUrl(null);
      setQrError(null);
      QRCode.toDataURL(profileUrl, {
        width: 240,
        margin: 2,
        color: { dark: '#1e40af', light: '#ffffff' },
        type: 'image/png',
      })
        .then(setQrDataUrl)
        .catch(err => {
          console.error('❌ Échec génération QR:', err);
          setQrError('Impossible de générer le QR');
        });
    }
  }, [isOpen, profileUrl]);

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ✅ Pas de return null — on gère l’affichage via les variants
  return (
    <>
      {/* ✅ Overlay — sans AnimatePresence */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-xl z-50"
          onClick={onClose}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`bubble-${i}`} // ✅ clé unique
                className="absolute w-2 h-2 rounded-full bg-cyan-300/20"
                style={{
                  left: `${10 + (i * 15) + Math.random() * 20}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: ['-100px', '120vh'],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 8 + i,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ✅ Modal — sans AnimatePresence */}
      {isOpen && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ rotateY: -30 }}
            animate={{ rotateY: 0 }}
            className="max-w-md w-full"
          >
            <div className="glass-border backdrop-blur-2xl bg-gradient-to-br from-cyan-900/20 to-blue-900/30 border border-cyan-400/30 rounded-3xl overflow-hidden shadow-2xl">
              <button
                onClick={onClose}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-cyan-200 hover:bg-black/60 transition-colors"
                aria-label="Fermer"
              >
                <ExternalLink className="w-5 h-5 rotate-45" />
              </button>

              <div className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-xl flex items-center justify-center">
                  <QrCode className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">QR Code de profil</h3>
                <p className="text-cyan-200 text-sm mb-4">
                  Scannez pour accéder à <span className="font-mono">@{username}</span>
                </p>

                <div className="flex justify-center mb-5">
                  {qrError ? (
                    <div className="mx-auto w-48 h-48 bg-red-900/20 border border-red-500/30 rounded-2xl flex items-center justify-center p-4">
                      <p className="text-red-300 text-xs text-center">❌ {qrError}</p>
                    </div>
                  ) : qrDataUrl ? (
                    <motion.img
                      key={profileUrl}
                      src={qrDataUrl}
                      alt={`QR Code pour ${username}`}
                      className="w-48 h-48 rounded-2xl border-2 border-white/30 bg-white shadow-md"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-800/30 rounded-2xl animate-pulse flex items-center justify-center">
                      <span className="text-xs text-gray-400">Génération...</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-300 text-sm mb-5">
                  ✅ Le QR redirige vers :<br />
                  <span className="font-mono text-cyan-200 text-xs break-all">
                    {profileUrl}
                  </span>
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/10"
                    onClick={copyLink}
                  >
                    <Copy className="mr-1.5 h-4 w-4" />
                    {copied ? '✅ Copié !' : '📋 Copier le lien'}
                  </Button>
                  <Button
                    onClick={() => window.open(profileUrl, '_blank')}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600"
                  >
                    🌐 Ouvrir le profil
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}