// src/components/dashboard/DashboardContent.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Heart, Download } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SimulateNFCTap from '@/components/nfc/SimulateNFCTap';

// ✅ Fonction locale — formatte la distance avec traduction
const formatDistance = (dateString: string, t: any): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffDays > 0) return `${diffDays} ${t('time.days', { count: diffDays })}`;
  if (diffHrs > 0) return `${diffHrs} ${t('time.hours', { count: diffHrs })}`;
  if (diffMin > 0) return `${diffMin} ${t('time.minutes', { count: diffMin })}`;
  return `${diffSec} ${t('time.seconds', { count: diffSec })}`;
};

type Profile = {
  id: string;
  full_name: string;
  username: string;
  job_title?: string;
  is_public?: boolean;
  bio_short?: string;
  sections_visibility?: Record<string, boolean>;
};

type Subscription = {
  plan: string;
  active: boolean;
  expires_at?: string;
};

type Card = {
  id: string;
  card_id: string;
  status: 'active' | 'lost' | 'blocked' | 'inactive';
  created_at: string;
};

type Scan = {
  id: string;
  scan_type: string;
  created_at: string;
  profiles?: { full_name?: string; username?: string };
};

type Props = {
  user: { id: string };
  profile: Profile;
  subscription: Subscription;
  cards: Card[];
  recentScans: Scan[];
  totalScans: number;
  qrBase64: string;
  profileUrl: string;
  planColors: Record<string, string>;
  likesCount: number;
};

export default function DashboardContent({
  user, profile, subscription, cards, recentScans, totalScans,
  qrBase64, profileUrl, planColors, likesCount,
}: Props) {
  const t = useTranslations('dashboard'); // ✅ OK côté client
  const router = useRouter();
  const [hasLiked, setHasLiked] = useState(false);
  const [sectionsVisibility, setSectionsVisibility] = useState<Record<string, boolean>>(
    profile.sections_visibility || {
      bio: true,
      contact: true,
      social: true,
      portfolio: true,
      certificates: true,
    }
  );

  const handleLike = () => setHasLiked(!hasLiked);

  const updateVisibility = (section: string, checked: boolean) => {
    setSectionsVisibility(prev => ({ ...prev, [section]: checked }));
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/scans/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luvika-scans-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch {
      alert('❌ Échec de l’export');
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  {/* 🔹 Bloc gauche : titre + sous-titre + likes */}
  <div className="flex flex-col gap-2">
    <h1 className="text-2xl sm:text-3xl font-bold text-white">
      {t('greeting', { name: profile.full_name })}
    </h1>

    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <p className="text-gray-400 text-sm sm:text-base">
        {t('subtitle')}
      </p>

      <button
        onClick={handleLike}
        className="flex items-center gap-1 text-gray-300 hover:text-red-400 w-fit"
      >
        <Heart
          size={16}
          fill={hasLiked ? 'red' : 'none'}
          className="transition-colors"
        />
        <span className="text-sm">{likesCount}</span>
      </button>
    </div>
  </div>

  {/* 🔹 Bloc droit : actions */}
  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
    <Link
      href={`/${profile.username}`}
      target="_blank"
      className="w-full sm:w-auto"
    >
      <Button
        variant="outline"
        className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
      >
        {t('view_public')}
      </Button>
    </Link>

    <Button
      onClick={handleExport}
      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500"
    >
      <Download className="h-4 w-4" />
      {t('export_csv')}
    </Button>

    <Button
      onClick={() => router.push('/admin/orders')}
      className="w-full sm:w-auto bg-gradient-to-r from-blue-900 to-blue-900"
    >
      Gérer les commandes
    </Button>
  </div>
</div>


      {/* Visibilité */}
      <Card className="glass-border">
        <CardHeader><CardTitle>{t('visibility.title')}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">{t('visibility.description')}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(['bio', 'contact', 'social', 'portfolio', 'certificates'] as const).map(section => (
              <label key={section} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sectionsVisibility[section] !== false}
                  onChange={e => updateVisibility(section, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-300 capitalize">{section}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commandes (Premium/Entreprise) */}
      {(subscription.plan === 'premium' || subscription.plan === 'entreprise') && (
        <Card className="glass-border">
          <CardHeader><CardTitle>{t('orders.title')}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">{t('orders.description')}</p>
            <Button onClick={() => router.push('/admin/orders')} className="bg-gradient-to-r from-blue-600 to-cyan-500">
              {t('orders.manage')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Abonnement */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>{t('subscription.title')}</span>
            <Badge className={`${planColors[subscription.plan]} text-white`}>
              {t(`subscription.plans.${subscription.plan}`)}
            </Badge>
            <Badge className={subscription.active ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}>
              {subscription.active ? t('subscription.active') : t('subscription.inactive')}
            </Badge>
            
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">
            {subscription.active
              ? t('subscription.active_until', { date: new Date(subscription.expires_at || '').toLocaleDateString('fr-FR') })
              : t('subscription.upgrade_prompt')}
          </p>
          {!subscription.active && (
            <Button size="sm" className="mt-3 bg-gradient-to-r from-blue-600 to-cyan-500">
              {t('subscription.request_upgrade')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* QR & NFC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-border">
          <CardHeader><CardTitle>{t('qr.title')}</CardTitle></CardHeader>
          <CardContent className="text-center">
            {qrBase64 ? (
              <div>
                <img 
                  src={qrBase64} 
                  alt={t('qr.alt', { username: profile.username })}
                  className="mx-auto w-48 h-48 bg-white p-2 rounded-lg"
                />
                <p className="text-sm text-gray-400 mt-2">{t('qr.instructions')}</p>
                <Button size="sm" variant="outline" className="mt-3 border-white/20 text-white hover:bg-white/10" onClick={() => window.open(profileUrl, '_blank')}>
                  {t('qr.open_link')}
                </Button>
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-800 rounded-lg mx-auto animate-pulse" />
            )}
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardHeader>
            <CardTitle>{t('nfc.title', { count: cards.length })}</CardTitle>
          </CardHeader>
          <CardContent>
            {cards.length === 0 ? (
              <p className="text-gray-400">{t('nfc.empty')}</p>
            ) : (
              <ul className="space-y-3">
                {cards.map(card => (
                  <li key={card.id} className="flex justify-between items-center p-3 glass-border">
                    <div>
                      <span className="font-mono text-sm text-blue-300">{card.card_id}</span>
                      <div className="text-xs text-gray-400">
                        {formatDistance(card.created_at, t)} {t('nfc.ago')}
                      </div>
                    </div>
                    <Badge className={
                      card.status === 'active' ? 'bg-green-500' :
                      card.status === 'lost' ? 'bg-yellow-500' :
                      card.status === 'blocked' ? 'bg-red-500' : 'bg-gray-500'
                    }>
                      {t(`nfc.status.${card.status}`)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <SimulateNFCTap profileId={profile.id} />
            <Button size="sm" className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-500" disabled={subscription.plan === 'basic' && cards.length >= 1}>
              {subscription.plan === 'basic' && cards.length >= 1 ? t('nfc.upgrade_required') : t('nfc.add_card')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card className="glass-border">
        <CardHeader><CardTitle>{t('stats.title')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 glass-border">
              <div className="text-3xl font-bold text-blue-300">{totalScans}</div>
              <div className="text-gray-400">{t('stats.total_scans')}</div>
            </div>
            <div className="text-center p-4 glass-border">
              <div className="text-3xl font-bold text-cyan-300">
                {recentScans.filter(s => s.scan_type === 'nfc').length}
              </div>
              <div className="text-gray-400">{t('stats.nfc_scans')}</div>
            </div>
            <div className="text-center p-4 glass-border">
              <div className="text-3xl font-bold text-purple-300">
                {recentScans.filter(s => s.scan_type === 'qr_profile').length}
              </div>
              <div className="text-gray-400">{t('stats.qr_scans')}</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-3">{t('stats.recent_visitors')}</h3>
          {recentScans.length === 0 ? (
            <p className="text-gray-400">{t('stats.no_scans')}</p>
          ) : (
            <ul className="space-y-2">
              {recentScans.map(scan => (
                <li key={scan.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-white">
                      {scan.profiles?.full_name || t('stats.anonymous')}
                    </span>
                    <span className="text-gray-400 ml-2">
                      ({scan.scan_type === 'nfc' ? t('stats.scan_type.nfc') : t('stats.scan_type.qr')})
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {formatDistance(scan.created_at, t)} {t('nfc.ago')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}