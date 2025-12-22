// src/components/nfc/SimulateNFCTap.tsx

'use client';

import { Button } from '@/components/ui/button';
import { Scan } from 'lucide-react';

export default function SimulateNFCTap({ profileId }: { profileId: string }) {
  const handleSimulate = async () => {
    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          scan_type: 'nfc',
        }),
      });

      if (res.ok) {
        alert('✅ Scan NFC simulé avec succès !');
      } else {
        const err = await res.json();
        alert(`❌ Erreur : ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSimulate}
      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
    >
      <Scan className="mr-2 h-4 w-4" />
      Simuler un tap NFC
    </Button>
  );
}