// src/components/profile/LikeButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LikeButton({
  profileId,
  initialLikes,
}: {
  profileId: string;
  initialLikes: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);

  // Simule un chargement initial (ex: vérifie si user a déjà liké)
  useEffect(() => {
    // TODO: fetch('/api/interactions/check', { profile_id: profileId })
    // Pour l’instant, on simule
    const liked = Math.random() > 0.7; // 30% de chances d’avoir déjà liké
    setHasLiked(liked);
    if (liked) setLikes(prev => prev + 1);
  }, [profileId]);

  const handleLike = async () => {
    try {
      const res = await fetch('/api/interactions/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId }),
      });

      if (res.ok) {
        setLikes(prev => hasLiked ? prev - 1 : prev + 1);
        setHasLiked(!hasLiked);
      }
    } catch (err) {
      console.error('Erreur like:', err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      className="flex items-center gap-1 text-gray-300 hover:text-red-400 hover:bg-red-500/10"
    >
      <Heart
        size={16}
        fill={hasLiked ? "red" : "none"}
        className="transition-colors"
      />
      <span>{likes}</span>
    </Button>
  );
}