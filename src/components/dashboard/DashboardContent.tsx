// src/components/dashboard/DashboardContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Heart, Download, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SimulateNFCTap from '@/components/nfc/SimulateNFCTap';

// ✅ Fonction locale — remplace formatDistanceToNow
const formatDistance = (dateString: string, t: any): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffDays > 0) {
    return `${diffDays} ${t('time.days', { count: diffDays })}`;
  }
  if (diffHrs > 0) {
    return `${diffHrs} ${t('time.hours', { count: diffHrs })}`;
  }
  if (diffMin > 0) {
    return `${diffMin} ${t('time.minutes', { count: diffMin })}`;
  }
  return `${diffSec} ${t('time.seconds', { count: diffSec })}`;
};

type Profile = {
  id: string;
  full_name: string;
  username: string;
  job_title: string;
  is_public: boolean;
  bio_short: string;
  sections_visibility?: Record<string, boolean>;
};

type Subscription = {
  plan: 'basic' | 'premium' | 'entreprise';
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
  t: any;
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
  t, user, profile, subscription, cards, recentScans, totalScans,
  qrBase64, profileUrl, planColors, likesCount,
}: Props) {
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

  const handleLike = async () => {
    setHasLiked(!hasLiked);
  };

  const updateVisibility = async (section: string, checked: boolean) => {
    const newVisibility = { ...sectionsVisibility, [section]: checked };
    setSectionsVisibility(newVisibility);
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/scans/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!res.ok) throw new Error('Export échoué');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luvika-scans-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Erreur export CSV:', err);
      alert('❌ Échec de l’export');
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête + Like */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t('dashboard.greeting', { name: profile.full_name })}
          </h1>
          <div className="mt-2 flex items-center gap-4">
            <p className="text-gray-400">{t('dashboard.subtitle')}</p>
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-gray-300 hover:text-red-400 transition"
            >
              <Heart size={16} fill={hasLiked ? 'red' : 'none'} className={hasLiked ? 'animate-pulse' : ''} />
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Link href={`/${profile.username}`} target="_blank" className="block">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              {t('dashboard.view_public')}
            </Button>
          </Link>
          <Button onClick={handleExport} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500">
            <Download className="h-4 w-4" />
            {t('dashboard.export_csv')}
          </Button>
          <Button onClick={() => router.push('/admin/orders')}>
            Gérer les commandes
          </Button>
        </div>
      </div>

      {/* Gestion visibilité sections */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle>{t('dashboard.visibility.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">{t('dashboard.visibility.description')}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(['bio', 'contact', 'social', 'portfolio', 'certificates'] as const).map((section) => (
              <label key={section} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sectionsVisibility[section] !== false}
                  onChange={(e) => updateVisibility(section, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-300 capitalize">{section}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commandes cartes */}
      {(subscription.plan === 'premium' || subscription.plan === 'entreprise') && (
        <Card className="glass-border">
          <CardHeader>
            <CardTitle>{t('dashboard.orders.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">{t('dashboard.orders.description')}</p>
            <Button
              onClick={() => router.push('/admin/orders')}
              className="bg-gradient-to-r from-blue-600 to-cyan-500"
            >
              {t('dashboard.orders.manage')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statut abonnement */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>{t('dashboard.subscription.title')}</span>
            <Badge className={`${planColors[subscription.plan]} text-white`}>
              {t(`dashboard.subscription.plans.${subscription.plan}`)}
            </Badge>
            <Badge 
              variant="secondary" 
              className={
                subscription.active 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-yellow-500/20 text-yellow-300'
              }
            >
              {subscription.active 
                ? t('dashboard.subscription.active') 
                : t('dashboard.subscription.inactive')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">
            {subscription.active 
              ? t('dashboard.subscription.active_until', { 
                  date: new Date(subscription.expires_at || '').toLocaleDateString('fr-FR') 
                })
              : t('dashboard.subscription.upgrade_prompt')}
          </p>
          {!subscription.active && (
            <Button size="sm" className="mt-3 bg-gradient-to-r from-blue-600 to-cyan-500">
              {t('dashboard.subscription.request_upgrade')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* QR Code + NFC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code */}
        <Card className="glass-border">
          <CardHeader>
            <CardTitle>{t('dashboard.qr.title')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {qrBase64 ? (
              <div>
                <img 
                  src={qrBase64} 
                  alt={t('dashboard.qr.alt', { username: profile.username })}
                  className="mx-auto w-48 h-48 bg-white p-2 rounded-lg"
                />
                <p className="text-sm text-gray-400 mt-2">
                  {t('dashboard.qr.instructions')}
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-3 border-white/20 text-white hover:bg-white/10"
                  onClick={() => window.open(profileUrl, '_blank')}
                >
                  {t('dashboard.qr.open_link')}
                </Button>
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-800 rounded-lg mx-auto animate-pulse" />
            )}
          </CardContent>
        </Card>

        {/* Cartes NFC */}
        <Card className="glass-border">
          <CardHeader>
            <CardTitle>
              {t('dashboard.nfc.title', { count: cards.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cards.length === 0 ? (
              <p className="text-gray-400">{t('dashboard.nfc.empty')}</p>
            ) : (
              <ul className="space-y-3">
                {cards.map((card) => (
                  <li key={card.id} className="flex justify-between items-center p-3 glass-border">
                    <div>
                      <span className="font-mono text-sm text-blue-300">{card.card_id}</span>
                      <div className="text-xs text-gray-400">
                        {formatDistance(card.created_at, t)} {t('dashboard.nfc.ago')}
                      </div>
                    </div>
                    <Badge 
                      className={
                        card.status === 'active' ? 'bg-green-500' :
                        card.status === 'lost' ? 'bg-yellow-500' :
                        card.status === 'blocked' ? 'bg-red-500' : 'bg-gray-500'
                      }
                    >
                      {t(`dashboard.nfc.status.${card.status}`)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <SimulateNFCTap profileId={profile.id} />
            <Button 
              size="sm" 
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-500"
              disabled={subscription.plan === 'basic' && cards.length >= 1}
            >
              {subscription.plan === 'basic' && cards.length >= 1 
                ? t('dashboard.nfc.upgrade_required')
                : t('dashboard.nfc.add_card')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle>{t('dashboard.stats.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 glass-border">
              <div className="text-3xl font-bold text-blue-300">{totalScans}</div>
              <div className="text-gray-400">{t('dashboard.stats.total_scans')}</div>
            </div>
            <div className="text-center p-4 glass-border">
              <div className="text-3xl font-bold text-cyan-300">
                {recentScans.filter(s => s.scan_type === 'nfc').length}
              </div>
              <div className="text-gray-400">{t('dashboard.stats.nfc_scans')}</div>
            </div>
            <div className="text-center p-4 glass-border">
              <div className="text-3xl font-bold text-purple-300">
                {recentScans.filter(s => s.scan_type === 'qr_profile').length}
              </div>
              <div className="text-gray-400">{t('dashboard.stats.qr_scans')}</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-3">
            {t('dashboard.stats.recent_visitors')}
          </h3>
          {recentScans.length === 0 ? (
            <p className="text-gray-400">{t('dashboard.stats.no_scans')}</p>
          ) : (
            <ul className="space-y-2">
              {recentScans.map((scan) => (
                <li key={scan.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-white">
                      {scan.profiles?.full_name || t('dashboard.stats.anonymous')}
                    </span>
                    <span className="text-gray-400 ml-2">
                      ({scan.scan_type === 'nfc' 
                        ? t('dashboard.stats.scan_type.nfc') 
                        : t('dashboard.stats.scan_type.qr')})
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {formatDistance(scan.created_at, t)} {t('dashboard.nfc.ago')}
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