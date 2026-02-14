// src/components/blog/ReloadButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function ReloadButton() {
  return (
    <Button 
      variant="outline" 
      className="border-white/20 text-gray-300 hover:bg-white/10"
      onClick={() => window.location.reload()}
    >
      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      Vérifier à nouveau
    </Button>
  );
}