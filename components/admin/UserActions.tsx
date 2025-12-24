// src/components/admin/UserActions.tsx
'use client';

import { Button } from '../../components/ui/button';
import { ShieldX } from 'lucide-react';

export function UserActions({ id, isSelf }: { id: string; isSelf: boolean }) {
  if (isSelf) return null;

  const handleBan = async () => {
    if (confirm('Bannir cet utilisateur définitivement ?')) {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: 'POST',
      });
      if (res.ok) window.location.reload();
    }
  };

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={handleBan}
    >
      <ShieldX className="h-4 w-4 mr-1" /> Bannir
    </Button>
  );
}