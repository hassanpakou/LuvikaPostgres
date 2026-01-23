// src/components/dashboard/modals/QRModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

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

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.querySelector('#qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${username}_luvika_qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-md p-6 border border-white/15"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">QR Code</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>

          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-white rounded-xl">
              <canvas
                id="qr-canvas"
                width="256"
                height="256"
                className="mx-auto"
              />
            </div>
            <p className="text-gray-300 mt-3">
              Scannez pour accéder à votre profil LUVIKA
            </p>
          </div>

          <p className="text-sm text-gray-400 bg-black/20 p-3 rounded-lg mb-4 break-all">
            {profileUrl}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={copyLink}
            >
              {copied ? '✅ Copié !' : '📋 Copier le lien'}
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-600 to-blue-500"
              onClick={downloadQR}
            >
              <Download className="w-4 h-4 mr-1" />
              Télécharger
            </Button>
          </div>

          {/* Génération client-side simple (à remplacer par votre generateQRBase64 côté client si besoin) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                import QRCode from 'qrcode';
                if (typeof QRCode !== 'undefined') {
                  QRCode.toCanvas(document.getElementById('qr-canvas'), '${profileUrl}', {
                    width: 256,
                    color: {
                      dark: '#2563eb',
                      light: '#ffffff'
                    }
                  }, function (error) {
                    if (error) console.error(error);
                  });
                }
              `
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}