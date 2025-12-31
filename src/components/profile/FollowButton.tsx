// src/components/profile/FollowButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FollowButtonProps = {
  profileId: string;
  currentUserId: string | null;
  initialIsFollowing: boolean;
  initialFollowers: number;
  initialFollowing: number;
};

export default function FollowButton({
  profileId,
  currentUserId,
  initialIsFollowing,
  initialFollowers,
  initialFollowing,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    if (!currentUserId || currentUserId === profileId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isFollowing ? 'unfollow' : 'follow',
          targetId: profileId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setFollowers(data.followers);
        setFollowing(data.following);
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          size="lg"
          onClick={toggleFollow}
          disabled={!currentUserId || loading}
          className={`w-44 rounded-xl font-medium transition-all duration-300 ${
            isFollowing
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-400/30'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isFollowing ? (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Follow
            </>
          )}
        </Button>
      </motion.div>

      <div className="flex gap-6 text-xs text-gray-400">
        <div className="text-center">
          <div className="font-medium text-white">{followers}</div>
          <div>Followers</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-white">{following}</div>
          <div>Following</div>
        </div>
      </div>
    </div>
  );
}