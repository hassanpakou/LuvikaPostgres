// src/components/nfc/CardManager.tsx
'use client';

import { useRouter } from 'next/navigation'; // ✅ Bon import
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Phone } from 'lucide-react';
import { toast } from 'sonner';

// ✅ Supprime onCardCreated des props
export function CardManager({ 
  profileId, 
  username,
}: { 
  profileId: string; 
  username: string;
}) {
  const router = useRouter(); // ✅ Hook client-side

  const [isWriting, setIsWriting] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const writeNfc = async () => {
  if (isIOS) {
    toast.warning('⚠️ NFC non supporté sur iOS', {
      description: 'Utilisez le QR code pour partager votre profil.'
    });
    return;
  }

  if (!('NDEFReader' in window)) {
    toast.error('❌ NFC non supporté', {
      description: 'Votre appareil ne prend pas en charge le NFC.'
    });
    return;
  }

  try {
    setIsWriting(true);
    // ✅ Cast pour éviter l'erreur TS
    const NDEFReader = (window as any).NDEFReader;
    const writer = new NDEFReader();
    await writer.write({
      records: [{ text: `https://luvika.vercel.app/${username}` }]
    });

    const res = await fetch('/api/nfc/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: profileId, username })
    });

    if (res.ok) {
      toast.success('✅ Carte NFC programmée !');
      router.refresh();
    } else {
      throw new Error('Échec enregistrement');
    }
  } catch (err: any) {
    console.error('NFC error:', err);
    toast.error('❌ Échec écriture NFC');
  } finally {
    setIsWriting(false);
  }
};

  const generateQr = () => {
    toast.success('✅ QR Code généré !');
    // Tu peux ajouter la logique de génération ici plus tard
  };

  return (
    <div className="space-y-4">
      {/* NFC */}
      <div className="glass-border p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Phone className="w-5 h-5 text-blue-400" />
          <h3 className="font-medium text-white">Carte NFC</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          {isIOS 
            ? "L’écriture NFC n’est pas supportée sur iOS." 
            : "Approchez une carte vierge pour programmer votre profil."}
        </p>
        <Button
          onClick={writeNfc}
          disabled={isIOS || isWriting}
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
      </div>

      {/* QR Code */}
      <div className="glass-border p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <QrCode className="w-5 h-5 text-emerald-400" />
          <h3 className="font-medium text-white">QR Code</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Générez un QR code pour partager votre profil partout.
        </p>
        <Button
          onClick={generateQr}
          variant="outline"
          className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
        >
          🖨️ Générer QR Code
        </Button>
      </div>
    </div>
  );
}