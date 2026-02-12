// src/components/profile/GlacialLikeButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

interface GlacialLikeButtonProps {
  profileId: string;
  initialLikes: number;
  hideCount?: boolean; // ← nouvelle prop pour cacher le compteur
}

export default function GlacialLikeButton({
  profileId,
  initialLikes,
  hideCount = false,
}: GlacialLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const liked = localStorage.getItem(`luvika_liked_${profileId}`) === 'true';
    setHasLiked(liked);
    if (liked && initialLikes === likes) {
      setLikes(prev => prev + 1);
    }
  }, [profileId, initialLikes]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`profile-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profileId}`
        },
        (payload) => {
          if (payload.new.likes_count !== undefined) {
            setLikes(payload.new.likes_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  const handleLike = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newHasLiked = !hasLiked;
    const newLikes = hasLiked ? likes - 1 : likes + 1;

    setHasLiked(newHasLiked);
    setLikes(newLikes);
    localStorage.setItem(`luvika_liked_${profileId}`, String(newHasLiked));

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          likes_count: newLikes,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)
        .select('likes_count')
        .single();

      if (error) {
        console.error('❌ Like update failed:', error);
        setHasLiked(!newHasLiked);
        setLikes(hasLiked ? likes + 1 : likes - 1);
      } else {
        setLikes(data.likes_count);
      }
    } catch (err) {
      console.error('❌ Like error:', err);
      setHasLiked(!newHasLiked);
      setLikes(hasLiked ? likes + 1 : likes - 1);
    }

    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLike}
      disabled={isAnimating}
      className="flex items-center justify-center px-6 py-3 rounded-full transition-all shadow-lg group"
      aria-label={hasLiked ? "Retirer un like" : "Ajouter un like"}
    >
      <motion.div
        animate={{ 
          scale: hasLiked ? [1, 1.4, 1] : 1,
          rotate: hasLiked ? [0, -15, 15, 0] : 0,
        }}
        transition={{ 
          duration: 0.4,
          ease: "easeOut"
        }}
      >
        <Heart 
          size={22} 
          fill={hasLiked ? "#3700FF" : "none"} 
          className={`${hasLiked ? "text-blue-400" : "text-gray-300 group-hover:text-red-300"} transition-colors`}
        />
      </motion.div>

      {/* Affiche le compteur seulement si hideCount=false */}
      {!hideCount && <span className="text-white font-medium text-lg ml-2">{likes}</span>}
    </motion.button>
  );
}
