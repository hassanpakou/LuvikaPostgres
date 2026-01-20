// src/components/nfc/NfcWriter.tsx
'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export function NfcWriter({ username }: { username: string }) {
  const [isWriting, setIsWriting] = useState(false);

  const writeNfc = async () => {
    // 🔍 Vérifie le support NFC
    if (!('NDEFReader' in window)) {
      toast.error('❌ NFC non supporté', {
        description: 'Votre appareil ne prend pas en charge le NFC.'
      });
      return;
    }

    try {
      setIsWriting(true);

      // ✅ Utilise NDEFReader (pas NDEFWriter)
      const ndef = new (window as any).NDEFReader();
      await ndef.write({
        records: [
          {
            text: `https://luvika.vercel.app/${username}`,
            lang: 'fr'
          }
        ]
      });

      toast.success('✅ Carte NFC programmée !', {
        description: 'Votre identité numérique est prête.'
      });

    } catch (err: any) {
      console.error('NFC error:', err);
      toast.error('❌ Échec écriture NFC', {
        description: err.message || 'Impossible d’écrire sur la carte.'
      });
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <Button
      onClick={writeNfc}
      disabled={isWriting}
      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
    >
      {isWriting ? (
        <span className="flex items-center">
          <span className="animate-spin w-4 h-4 mr-2">⚙️</span>
          Écriture...
        </span>
      ) : (
        '📱 Programmer carte NFC'
      )}
    </Button>
  );
}