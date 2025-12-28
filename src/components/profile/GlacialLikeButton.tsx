// src/components/profile/GlacialLikeButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function GlacialLikeButton({
  profileId,
  initialLikes,
}: {
  profileId: string;
  initialLikes: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 💾 Persistance locale
  useEffect(() => {
    const liked = localStorage.getItem(`luvika_liked_${profileId}`) === 'true';
    setHasLiked(liked);
    if (liked && initialLikes === likes) {
      setLikes(prev => prev + 1);
    }
  }, [profileId, initialLikes]);

  const handleLike = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newHasLiked = !hasLiked;
    const newLikes = hasLiked ? likes - 1 : likes + 1;

    setHasLiked(newHasLiked);
    setLikes(newLikes);
    localStorage.setItem(`luvika_liked_${profileId}`, String(newHasLiked));

    // 📡 Éventuel API call (à activer plus tard)
    // fetch('/api/interactions/like', { method: 'POST', body: JSON.stringify({ profile_id: profileId }) });

    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLike}
      disabled={isAnimating}
      className="flex items-center gap-3 px-6 py-3 rounded-full transition-all shadow-lg group"
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
          fill={hasLiked ? "#ef4444" : "none"} 
          className={`${hasLiked ? "text-red-400" : "text-gray-300 group-hover:text-red-300"} transition-colors`}
        />
      </motion.div>
      <span className="text-white font-medium text-lg">{likes}</span>
    </motion.button>
  );
}