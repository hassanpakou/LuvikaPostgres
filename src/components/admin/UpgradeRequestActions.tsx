// src/components/admin/UpgradeRequestActions.tsx
'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export function UpgradeRequestActions({ id }: { id: string }) {
  const handleAction = async (status: 'approved' | 'rejected') => {
    const res = await fetch(`/api/admin/upgrade-requests/${id}/${status}`, {
      method: 'POST',
    });
    if (res.ok) window.location.reload();
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="bg-gradient-to-r from-green-600 to-emerald-500"
        onClick={() => handleAction('approved')}
      >
        <CheckCircle className="h-4 w-4 mr-1" /> Approuver
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleAction('rejected')}
      >
        <XCircle className="h-4 w-4 mr-1" /> Rejeter
      </Button>
    </div>
  );
}