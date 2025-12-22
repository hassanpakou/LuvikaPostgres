// src/components/nfc/NFCTapButton.tsx
import { Button } from '@/components/ui/button';
import { Scan, Phone } from 'lucide-react';

// ✅ Hook NFC désactivé pour le build (à réactiver plus tard)
// import { useNFC } from '@/hooks/useNFC';

export default function NFCTapButton({ onScan }: { onScan: (url: string) => void }) {
  // ✅ Simule le NFC en dev (sans hook)
  const handleSimulateScan = () => {
    // Exemple d’URL NFC simulée
    onScan('https://luvika.vercel.app/nestor');
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={handleSimulateScan}
        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-6 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg"
      >
        <Scan className="w-5 h-5" />
        Simuler un scan NFC
      </Button>
      <p className="text-gray-400 text-sm flex items-center gap-1">
        <Phone className="w-4 h-4" />
        NFC non disponible en mode web (Android uniquement)
      </p>
    </div>
  );
}