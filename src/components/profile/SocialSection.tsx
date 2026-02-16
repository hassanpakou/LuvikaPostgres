// src/components/profile/SocialSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Share2, Instagram, Linkedin, Github, Gitlab } from 'lucide-react';
import { SiTiktok } from "react-icons/si";
import SocialCard from './SocialCard';
import { isSectionEnabled } from '../../lib/utils/profileHelpers';
import { cleanSocialHandle, ensureAbsoluteUrl } from '../../lib/utils/socialHelpers';

type Profile = {
  instagram?: string | null;
  linkedin?: string | null;
  github?: string | null;
  gitlab?: string | null;
  tiktok?: string | null;
  snapchat?: string | null;
  telegram?: string | null;
  behance?: string | null;
  dribbble?: string | null;
};

type CardConfig = {
  scan_type: string;
  enabled: boolean;
};

export default function SocialSection({ 
  profile, 
  cardConfigs 
}: { 
  profile: Profile; 
  cardConfigs: CardConfig[]; 
}) {
  const showSocialSection = isSectionEnabled('social', cardConfigs) && (
    profile.instagram?.trim() ||
    profile.linkedin?.trim() ||
    profile.github?.trim() ||
    profile.gitlab?.trim() ||
    profile.tiktok?.trim() ||
    profile.snapchat?.trim() ||
    profile.telegram?.trim() ||
    profile.behance?.trim() ||
    profile.dribbble?.trim()
  );

  if (!showSocialSection) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      className="w-full px-4 mt-10"
    >
      <div className="max-w-5xl mx-auto">
        {/* Titre section */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Share2 className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Mes réseaux sociaux</h2>
          </div>
          <p className="text-sm text-gray-400">
            Retrouvez-moi sur les plateformes professionnelles et créatives
          </p>
        </div>

        {/* Grille responsive moderne */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Instagram - ✅ ESPACES SUPPRIMÉS DANS LES URLS */}
          {profile.instagram?.trim() && (
            <SocialCard
              platform="instagram"
              label="Instagram"
              handle={profile.instagram.trim()}
              href={`https://instagram.com/${encodeURIComponent(profile.instagram.trim())}`}
              icon={<Instagram className="w-5 h-5 text-white" />}
            />
          )}
          
          {/* LinkedIn - ✅ ESPACES SUPPRIMÉS */}
          {profile.linkedin?.trim() && (
            <SocialCard
              platform="linkedin"
              label="LinkedIn"
              handle={profile.linkedin.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')}
              href={`https://linkedin.com/in/${encodeURIComponent(profile.linkedin.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''))}`}
              icon={<Linkedin className="w-5 h-5 text-white" />}
            />
          )}
          
          {/* GitHub */}
          {profile.github?.trim() && (
            <SocialCard
              platform="github"
              label="GitHub"
              handle={profile.github.trim().replace(/^https?:\/\//, '')}
              href={`https://github.com/${encodeURIComponent(profile.github.trim().replace(/^https?:\/\//, ''))}`}
              icon={<Github className="w-5 h-5 text-white" />}
            />
          )}
          
          {/* GitLab */}
          {profile.gitlab?.trim() && (
            <SocialCard
              platform="gitlab"
              label="GitLab"
              handle={profile.gitlab.trim().replace(/^https?:\/\//, '')}
              href={`https://gitlab.com/${encodeURIComponent(profile.gitlab.trim().replace(/^https?:\/\//, ''))}`}
              icon={<Gitlab className="w-5 h-5 text-white" />}
            />
          )}
          
          {/* TikTok */}
          {profile.tiktok?.trim() && (
            <SocialCard
              platform="tiktok"
              label="TikTok"
              handle={`@${profile.tiktok.trim().replace(/^@/, '')}`}
              href={`https://tiktok.com/@${encodeURIComponent(profile.tiktok.trim().replace(/^@/, ''))}`}
              icon={<SiTiktok className="w-5 h-5 text-white" />}
            />
          )}
          
          {/* Snapchat */}
          {profile.snapchat?.trim() && (
            <SocialCard
              platform="snapchat"
              label="Snapchat"
              handle={`@${profile.snapchat.trim().replace(/^@/, '')}`}
              href={`https://snapchat.com/add/${encodeURIComponent(profile.snapchat.trim().replace(/^@/, ''))}`}
              icon={<SnapchatIcon className="w-5 h-5 text-white" />}
            />
          )}
          
          {/* Telegram */}
          {profile.telegram?.trim() && (
            <SocialCard
              platform="telegram"
              label="Telegram"
              handle={`@${profile.telegram.trim().replace(/^@/, '')}`}
              href={`https://t.me/${encodeURIComponent(profile.telegram.trim().replace(/^@/, ''))}`}
              icon={<TelegramIcon className="w-5 h-5 text-white" />}
            />
          )}
          
          {/* Behance */}
          {profile.behance?.trim() && (
            <SocialCard
              platform="behance"
              label="Behance"
              handle={cleanSocialHandle(profile.behance.trim(), 'behance.net')}
              href={ensureAbsoluteUrl(profile.behance.trim(), 'https://www.behance.net/')}
              icon={<BehanceIcon className="w-5 h-5 text-white" />}
            />
          )}
          
          {/* Dribbble */}
          {profile.dribbble?.trim() && (
            <SocialCard
              platform="dribbble"
              label="Dribbble"
              handle={cleanSocialHandle(profile.dribbble.trim(), 'dribbble.com')}
              href={ensureAbsoluteUrl(profile.dribbble.trim(), 'https://dribbble.com/')}
              icon={<DribbbleIcon className="w-5 h-5 text-white" />}
            />
          )}
        </div>

        {/* Divider décoratif */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <span>Réseaux sociaux vérifiés</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 🔹 ICÔNES CUSTOM POUR RÉSEAUX SOCIAUX (PLACÉES EN HAUT DU FICHIER)
const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M21.927 9.208l-.863-.527A5.486 5.486 0 0 0 12 7a5.486 5.486 0 0 0-9.064 1.681l-.863.527a1 1 0 0 0-.066 1.72l.902.55a3.489 3.489 0 0 1 0 5.643l-.902.55a1 1 0 0 0 .066 1.72l.863.527A5.486 5.486 0 0 0 12 23a5.486 5.486 0 0 0 9.064-1.681l.863-.527a1 1 0 0 0 .066-1.72l-.902-.55a3.489 3.489 0 0 1 0-5.643l.902-.55a1 1 0 0 0-.066-1.72z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2zm4.333 13.5l-1.45 4.35c-.15.45-.6.6-1 .45L12 19l-6.5 3.5c-.4.2-.8-.1-.6-.5l1.5-6.5L3.5 12c-.2-.4 0-.8.4-.8l17-7c.4-.2.8.1.6.5l-2.5 12.5c-.1.5-.5.8-.9.6l-2.767-1.167z"/>
  </svg>
);

const BehanceIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M0 0v24h24V0H0zm8.4 18.4H4.8V5.6h3.6c1.6 0 2.8.4 3.6 1.2s1.2 2 1.2 3.6s-.4 2.8-1.2 3.6s-2 1.2-3.6 1.2zm-1.2-1.6h2c1.2 0 2-.4 2.4-1.2s.6-2 .6-3.6s-.2-2.8-.6-3.6s-1.2-1.2-2.4-1.2H7.2v9.6zm5.6-10.4v1.6h-3.2v3.2h2.8v1.6h-2.8v3.2h3.2v1.6h-4.8V5.6h4.8v1.6z"/>
  </svg>
);

const DribbbleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m-1.1 17.2c-4.8 0-7.1-4.7-7.4-8.2c.3-3.5 2.7-8.2 7.4-8.2c1.1 0 2.1.2 3.1.7c.9-.5 2-.8 3.2-.8c4.6 0 7 4.7 7.3 8.3c-.3 3.6-2.7 8.2-7.3 8.2c-1.1 0-2.2-.3-3.2-.7c-.9.5-1.9.7-2.9.7m-.7-13.3c.2.2.2.5.1.7c-.1.2-.3.3-.6.2c-2.2-.9-3.8-3.2-3.9-3.4c-.1-.2-.1-.4.1-.6c.2-.2.5-.2.7-.1c.1.1 1.7 2.2 3.7 3.2m10.2 0c1.9-1 3.4-3 3.6-3.2c.2-.2.4-.2.6-.1c.2.2.2.4.1.6c-.2.2-1.8 2.6-4 3.5c-.2.1-.5 0-.7-.2c-.2-.2-.1-.5.1-.8m-9.7-3.7c.2.2.2.5.1.7c-.1.2-.3.3-.6.2c-1.3-.5-2.2-2.2-2.3-3.4c.2-2.5 2.1-4.1 2.8-4.6c.2-.1.4-.1.6.1c.2.2.2.4.1.6c-.3.5-1.7 2-1.9 4.4m9.2 0c.1-.6.2-1.1.2-1.8c-.1-2.1-1.1-3.5-1.8-4.1c-.2-.1-.2-.4-.1-.6c.2-.2.4-.2.6-.1c.7.5 2.3 2 2.5 4.3c0 .7.1 1.2.2 1.8c0 .2.1.4-.1.5c-.1.1-.3.1-.4-.1c-.2-.2-.3-.3-.5-.5c-.2-.3-.6-.4-.9-.2c-.3.2-.4.6-.2.9c.3.6 1.2 2.4 2.5 3.4c.2.1.2.4.1.6c-.2.2-.4.2-.6.1c-1.4-1-2.3-2.8-2.5-3.4c-.2-.3-.2-.7.1-.9c.2-.2.6-.4.9-.2c.3.2.4.6.2.9c-.2.3-.2.3-.3.5c-.1.1-.3.2-.5.1c-.2-.1-.3-.4-.1-.7m-4.8 1.8c.9-.1 2.8-1.1 3.9-2.7c.2-.2.5-.2.7-.1c.2.2.2.5.1.7c-.8 1.6-2.6 2.7-4.1 2.9c-.3 0-.5-.2-.5-.4c-.1-.1 0-.2.1-.4z"/>
  </svg>
);