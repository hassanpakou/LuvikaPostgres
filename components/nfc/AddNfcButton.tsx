// src/components/nfc/AddNfcButton.tsx
'use client';

import { Button } from '../ui/button';

export function AddNfcButton() {
  return (
    <Button 
      className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-cyan-500"
      onClick={() => {
        alert('✨ Fonctionnalité NFC en développement — bientôt disponible !');
      }}
    >
      ➕ Ajouter une nouvelle carte
    </Button>
  );
}