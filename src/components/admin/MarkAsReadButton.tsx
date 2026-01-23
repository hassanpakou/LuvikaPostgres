// src/components/admin/MarkAsReadButton.tsx
'use client';

import { Button } from '../../../components/ui/button';
import { CheckCircle } from 'lucide-react';

export function MarkAsReadButton({ requestId }: { requestId: string }) {
  const markAsRead = async () => {
    const res = await fetch(`/api/admin/contact-requests/${requestId}/read`, {
      method: 'POST',
    });
    if (res.ok) {
      window.location.reload();
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10"
      onClick={markAsRead}
    >
      <CheckCircle className="w-3 h-3 mr-1" />
      Marquer lu
    </Button>
  );
}