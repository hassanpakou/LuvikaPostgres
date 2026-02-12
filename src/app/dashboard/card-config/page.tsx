// src/app/dashboard/card-config/page.tsx

'use client';

import { useState, useEffect, useRef, JSX } from 'react';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Contact, Globe, Calendar, Link, FileText, Folder, Briefcase,
  CheckCircle, XCircle, RefreshCw, ArrowLeft, X, Eye, Smartphone, QrCode, Scan, Layout,
  ChevronRight, Lock
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Switch } from '../../../../components/ui/switch';
import { createClient } from '../../../../src/lib/supabase/client';
import DashboardQuickMenu from '../../../../src/components/dashboard/DashboardQuickMenu';

// Types
type ScanConfig = {
  scan_type: string;
  enabled: boolean;
  label: string;
  description: string;
  icon: JSX.Element;
  color: string;
  previewIcon: JSX.Element;
};

export default function CardConfigPage() {
  const t = useTranslations('dashboard.card_config');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, boolean>>({});
  const [customLinkUrl, setCustomLinkUrl] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<string>('basic');

  const quickActions = [
    { id: 'preview', label: t('preview'), icon: <Eye className="w-4 h-4" />, color: 'from-cyan-500 to-blue-500' },
    { id: 'refresh', label: t('refresh'), icon: <RefreshCw className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
    { id: 'back',     label: t('back'),     icon: <ArrowLeft className="w-4 h-4" />, color: 'from-gray-500 to-gray-600' },
  ];

  const isPremium = userPlan === 'premium' || userPlan === 'entreprise';

  const isOptionLocked = (scanType: string) => {
    const freeOptions = ['profile', 'contact', 'social'];
    return !freeOptions.includes(scanType) && !isPremium;
  };

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'preview') setIsPreviewOpen(true);
    if (actionId === 'refresh') handleRefresh();
    if (actionId === 'back') router.push('/dashboard');
  };

  const scanOptions: ScanConfig[] = [
    { scan_type: 'profile', enabled: configs.profile || false, label: t('types.profile'),     description: t('descriptions.profile'),     icon: <User className="w-6 h-6" />,       color: 'from-cyan-500 to-blue-500',    previewIcon: <User className="w-5 h-5 text-cyan-400" /> },
    { scan_type: 'contact', enabled: configs.contact || false, label: t('types.contact'),     description: t('descriptions.contact'),     icon: <Contact className="w-6 h-6" />,     color: 'from-emerald-500 to-teal-500', previewIcon: <Contact className="w-5 h-5 text-emerald-400" /> },
    { scan_type: 'social',  enabled: configs.social || false,  label: t('types.social'),      description: t('descriptions.social'),      icon: <Globe className="w-6 h-6" />,       color: 'from-purple-500 to-indigo-500',previewIcon: <Globe className="w-5 h-5 text-purple-400" /> },
    { scan_type: 'event',   enabled: configs.event || false,   label: t('types.event'),       description: t('descriptions.event'),       icon: <Calendar className="w-6 h-6" />,    color: 'from-amber-500 to-orange-500', previewIcon: <Calendar className="w-5 h-5 text-amber-400" /> },
    { scan_type: 'custom',  enabled: configs.custom || false,  label: t('types.custom_link'),  description: t('descriptions.custom_link'),  icon: <Link className="w-6 h-6" />,        color: 'from-pink-500 to-rose-500',    previewIcon: <Link className="w-5 h-5 text-pink-400" /> },
    { scan_type: 'cv',      enabled: configs.cv || false,      label: t('types.cv'),          description: t('descriptions.cv'),          icon: <FileText className="w-6 h-6" />,    color: 'from-blue-500 to-cyan-500',    previewIcon: <FileText className="w-5 h-5 text-blue-400" /> },
    { scan_type: 'business',enabled: configs.business || false,label: t('types.business'),     description: t('descriptions.business'),     icon: <Briefcase className="w-6 h-6" />,   color: 'from-gray-500 to-zinc-500',    previewIcon: <Briefcase className="w-5 h-5 text-gray-400" /> },
  ];

  // Fermeture modal par Échap
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPreviewOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Charger configs + plan utilisateur
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Plan utilisateur
      const { data: profileData } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();
      setUserPlan(profileData?.plan || 'basic');

      // Configs
      const { data, error } = await supabase
        .from('card_configs')
        .select('scan_type, enabled')
        .eq('profile_id', user.id)
        .in('scan_type', scanOptions.map(o => o.scan_type));

      if (error) throw error;

      const configMap: Record<string, boolean> = {};
      data?.forEach(cfg => {
        configMap[cfg.scan_type] = cfg.enabled;
      });

      // Valeurs par défaut false
      scanOptions.forEach(opt => {
        if (!(opt.scan_type in configMap)) {
          configMap[opt.scan_type] = false;
        }
      });

      setConfigs(configMap);
    } catch (err) {
      console.error('Erreur chargement configs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // Realtime – version améliorée
// Realtime – version améliorée
useEffect(() => {
  const supabase = createClient();

  const initRealtime = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // ─── Canal card_configs ───
    const cardChannel = supabase
      .channel(`card-configs-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'card_configs',
          filter: `profile_id=eq.${user.id}`
        },
        (payload: any) => {
          console.log(
            '[Realtime card_configs]',
            payload.eventType,
            payload.new?.scan_type || '(inconnu)',
            payload.new?.enabled ?? '—'
          );

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const { scan_type, enabled } = payload.new || {};
            if (scan_type) {
              setConfigs(prev => ({
                ...prev,
                [scan_type]: !!enabled
              }));
            }
          }
        }
      )
      .subscribe(status => {
        console.log('[card-configs channel status]', status);
        if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
          console.warn('Problème realtime card_configs → reconnexion...');
        }
      });

    // ─── Canal profile (pour custom_link_url) ───
    const profileChannel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload: any) => {
          console.log('[Realtime profile] UPDATE reçu', payload.new?.custom_link_url);
          const newUrl = payload.new?.custom_link_url;
          if (newUrl !== undefined) {
            setCustomLinkUrl(newUrl || '');
          }
        }
      )
      .subscribe(status => {
        console.log('[profile channel status]', status);
      });

    // Cleanup : on retourne une fonction qui nettoie les deux channels
    return () => {
      if (cardChannel) supabase.removeChannel(cardChannel);
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  };

  initRealtime();

  // Re-souscription périodique
  const interval = setInterval(() => {
    if (navigator.onLine) {
      initRealtime();
    }
  }, 45000);

  return () => {
    clearInterval(interval);
  };
}, []);

  const handleRefresh = async () => {
    await fetchConfigs();
  };

  // ──── IMPORTANT ──── Toggle unique → realtime fiable
  const handleToggle = async (scanType: string, enabled: boolean) => {
    if (isOptionLocked(scanType)) return;

    setSaving(scanType);

    const previousValue = configs[scanType];

    // Optimistic update (immédiat)
    setConfigs(prev => ({ ...prev, [scanType]: enabled }));

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non trouvé");

      const { error } = await supabase
        .from('card_configs')
        .upsert(
          {
            profile_id: user.id,
            scan_type: scanType,
            enabled,
            updated_at: new Date().toISOString(),
            priority: scanOptions.findIndex(o => o.scan_type === scanType) + 1,
          },
          { onConflict: 'profile_id,scan_type' }
        );

      if (error) throw error;

      // Optionnel : petite confirmation visuelle
      console.log(`Config ${scanType} mise à jour → ${enabled}`);
    } catch (err) {
      console.error('Erreur sauvegarde toggle:', err);
      // Rollback si erreur
      setConfigs(prev => ({ ...prev, [scanType]: previousValue }));
    } finally {
      setSaving(null);
    }
  };

  const enabledOptions = scanOptions.filter(opt => configs[opt.scan_type]);

  return (
    <div className="space-y-8 pb-24">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-gray-400">{t('subtitle_new')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
          <Button
            onClick={() => setIsPreviewOpen(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            {t('preview')}
          </Button>
        </div>
      </motion.div>

      {/* Info */}
      <Card className="glass-border bg-blue-500/10 border-blue-500/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-medium">{t('info_title')}</p>
              <p>{t('info_description')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des toggles */}
      <div className="space-y-3">
        {scanOptions.map((option) => (
          <motion.div
            key={option.scan_type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: scanOptions.indexOf(option) * 0.05 }}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`glass-border cursor-pointer transition-all duration-200 ${
                option.enabled ? 'border-l-4 border-l-emerald-500 bg-white/5' : 'hover:bg-white/5'
              }`}
              onClick={() => {
                if (!isOptionLocked(option.scan_type)) {
                  handleToggle(option.scan_type, !option.enabled);
                }
              }}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color} shadow-lg`}>
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{option.label}</h3>
                      {option.enabled && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('active')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {saving === option.scan_type && (
                    <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  <div className="relative">
                    <Switch
                      checked={option.enabled}
                      onCheckedChange={(checked) => {
                        if (!isOptionLocked(option.scan_type)) {
                          handleToggle(option.scan_type, checked);
                        }
                      }}
                      disabled={saving === option.scan_type || isOptionLocked(option.scan_type)}
                      className="data-[state=checked]:bg-emerald-500"
                    />

                    {isOptionLocked(option.scan_type) && (
                      <div className="absolute -top-1 -right-1 bg-red-500/90 rounded-full p-1 shadow-lg border border-red-400">
                        <Lock className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Champ custom link */}
            {option.scan_type === 'custom' && option.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 ml-16"
              >
                <Card className="glass-border bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-link-url" className="text-sm font-medium text-gray-300">
                        {t('custom_link_url_label')}
                      </Label>
                      <Input
                        id="custom-link-url"
                        placeholder="https://example.com"
                        value={customLinkUrl}
                        onChange={(e) => setCustomLinkUrl(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500"
                      />
                      <p className="text-xs text-gray-400">
                        {t('custom_link_url_description')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Confirmation visuelle (optionnel mais sympa) */}
      {saving === null && Object.values(configs).some(v => v) && (
        <Card className="glass-border bg-emerald-600/10 border-emerald-400/30">
          <CardContent className="py-3 px-4 text-center text-sm font-medium text-emerald-300 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Modifications enregistrées
          </CardContent>
        </Card>
      )}

      <DashboardQuickMenu onAction={handleQuickAction} actions={quickActions} />

      {/* Modal preview */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-border backdrop-blur-xl rounded-2xl w-full max-w-md p-6 border border-white/15 relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Bouton de fermeture */}
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                aria-label="Fermer la prévisualisation"
              >
                <X className="w-5 h-5" />
              </button>

              {/* En-tête du modal */}
              <div className="text-center mb-6">
                <div className="flex justify-center gap-4 mb-4">
                  <div className="flex flex-col items-center">
                    <Smartphone className="w-8 h-8 text-cyan-400 mb-1" />
                    <span className="text-xs text-gray-400">NFC</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <QrCode className="w-8 h-8 text-purple-400 mb-1" />
                    <span className="text-xs text-gray-400">QR Code</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                  <Scan className="w-6 h-6 text-emerald-400" />
                  {t('preview_title')}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {t('preview_description')}
                </p>
              </div>

              {/* Contenu de la preview - Design de carte NFC */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-5 border border-white/10 shadow-2xl">
                {/* En-tête de la carte */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Layout className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-white">LUVIKA Card</div>
                      <div className="text-xs text-cyan-400">Digital Identity</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>

                {/* Options activées */}
                {enabledOptions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                      <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-gray-400">
                      {t('preview_empty')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {t('preview_empty_hint')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {enabledOptions.map((option) => (
                      <motion.div
                        key={option.scan_type}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: enabledOptions.indexOf(option) * 0.05 }}
                        className="group flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${option.color} group-hover:scale-110 transition-transform`}>
                          {option.previewIcon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">{option.label}</div>
                          <div className="text-xs text-gray-400 line-clamp-1">{option.description}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Pied de page */}
                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                  <div className="flex justify-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </div>
                  <p className="text-xs text-gray-500">
                    {enabledOptions.length} {enabledOptions.length === 1 ? 'option activée' : 'options activées'} • LUVIKA NFC
                  </p>
                </div>
              </div>

              {/* Légende */}
              <div className="mt-5 text-center">
                <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  <Smartphone className="w-3 h-3 mr-1" />
                  {t('preview_hint')}
                </Badge>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}