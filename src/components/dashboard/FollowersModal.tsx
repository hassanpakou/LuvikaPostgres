// src/components/dashboard/FollowersModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, BadgeCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Follower = {
  id: string;
  username: string;
  full_name: string;
  plan: string | null;
  avatar_url: string | null;
  followed_at: string;
};

export default function FollowersModal({
  isOpen,
  onClose,
  profileId,
  totalFollowers,
}: {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  totalFollowers: number;
}) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!isOpen) return;
    
    setLoading(true);
    fetch(`/api/followers?profile_id=${profileId}&page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        if (page === 1) {
          setFollowers(data.followers || []);
        } else {
          setFollowers(prev => [...prev, ...(data.followers || [])]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Fetch followers failed:', err);
        setLoading(false);
      });
  }, [isOpen, profileId, page]);

  const loadMore = () => setPage(p => p + 1);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-md border border-white/20 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* 🔹 Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="text-cyan-400" size={20} />
              Abonnés ({totalFollowers})
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={18} />
            </Button>
          </div>

          {/* 🔹 Liste */}
          <div className="max-h-96 overflow-y-auto p-2">
            {loading && page === 1 ? (
              <div className="text-center py-8 text-gray-400">Chargement...</div>
            ) : followers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <User className="mx-auto h-12 w-12 mb-2 opacity-50" />
                Aucun abonné pour le moment
              </div>
            ) : (
              <ul className="space-y-2">
                {followers.map(follower => (
                  <motion.li
                    key={follower.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-border bg-white/5 p-3 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {follower.avatar_url ? (
                            <img
                              src={follower.avatar_url}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            follower.full_name?.charAt(0) || follower.username.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{follower.full_name || follower.username}</p>
                          <p className="text-sm text-cyan-300">@{follower.username}</p>
                        </div>
                      </div>
                      {follower.plan === 'premium' && (
                        <BadgeCheck className="text-yellow-400 ml-1" size={16} />
                      )}
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(follower.followed_at).toLocaleDateString('fr-FR')}
                    </div>
                    {follower.plan && follower.plan !== 'basic' && (
                      <Badge className={`mt-1 px-2 py-0.5 text-[10px] rounded ${
                        follower.plan === 'premium' 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
                      }`}>
                        {follower.plan === 'premium' ? '⭐ Premium' : '🏢 Entreprise'}
                      </Badge>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>

          {/* 🔹 Footer */}
          <div className="p-3 border-t border-white/10">
            {!loading && followers.length > 0 && followers.length % limit === 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={loadMore}
              >
                Charger plus
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-400 hover:text-white mt-2"
              onClick={onClose}
            >
              Fermer
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}