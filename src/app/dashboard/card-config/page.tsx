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
  ChevronRight, Lock, Crown, Zap, Sparkles, AlertCircle, Info, ShieldCheck
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Switch } from '../../../../components/ui/switch';
import { createClient } from '../../../../src/lib/supabase/client';
import DashboardQuickMenu from '../../../../src/components/dashboard/DashboardQuickMenu';
import { toast } from 'sonner';

// Types
type ScanConfig = {
  scan_type: string;
  enabled: boolean;
  label: string;
  description: string;
  icon: JSX.Element;
  color: string;
  previewIcon: JSX.Element;
  premium?: boolean;
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
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'locked'>('all');
// 🔑 AJOUTER CET ÉTAT EN HAUT DU COMPOSANT (après les autres useState)
const [isRealtimeActive, setIsRealtimeActive] = useState(false);
const [lastRealtimeUpdate, setLastRealtimeUpdate] = useState<Date | null>(null);
const [realtimeError, setRealtimeError] = useState<string | null>(null);
const realtimeRetryCount = useRef(0);
const MAX_RETRY_ATTEMPTS = 5;


  const quickActions = [
    { id: 'preview', label: t('preview'), icon: <Eye className="w-4 h-4" />, color: 'from-cyan-500 to-blue-500' },
    { id: 'refresh', label: t('refresh'), icon: <RefreshCw className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
    { id: 'back', label: t('back'), icon: <ArrowLeft className="w-4 h-4" />, color: 'from-gray-500 to-gray-600' },
  ];

  const isPremium = userPlan === 'premium' || userPlan === 'entreprise';

  const scanOptions: ScanConfig[] = [
    { 
      scan_type: 'profile', 
      enabled: configs.profile || false, 
      label: t('types.profile'),     
      description: t('descriptions.profile'),     
      icon: <User className="w-6 h-6" />,       
      color: 'from-cyan-500 to-blue-500',    
      previewIcon: <User className="w-5 h-5 text-cyan-400" /> 
    },
    { 
      scan_type: 'contact', 
      enabled: configs.contact || false, 
      label: t('types.contact'),     
      description: t('descriptions.contact'),     
      icon: <Contact className="w-6 h-6" />,     
      color: 'from-emerald-500 to-teal-500', 
      previewIcon: <Contact className="w-5 h-5 text-emerald-400" /> 
    },
    { 
      scan_type: 'social',  
      enabled: configs.social || false,  
      label: t('types.social'),      
      description: t('descriptions.social'),      
      icon: <Globe className="w-6 h-6" />,       
      color: 'from-purple-500 to-indigo-500',
      previewIcon: <Globe className="w-5 h-5 text-purple-400" /> 
    },
    { 
      scan_type: 'event',   
      enabled: configs.event || false,   
      label: t('types.event'),       
      description: t('descriptions.event'),       
      icon: <Calendar className="w-6 h-6" />,    
      color: 'from-amber-500 to-orange-500', 
      previewIcon: <Calendar className="w-5 h-5 text-amber-400" />,
      premium: true 
    },
    { 
      scan_type: 'custom',  
      enabled: configs.custom || false,  
      label: t('types.custom_link'),  
      description: t('descriptions.custom_link'),  
      icon: <Link className="w-6 h-6" />,        
      color: 'from-pink-500 to-rose-500',    
      previewIcon: <Link className="w-5 h-5 text-pink-400" /> 
    },
    { 
      scan_type: 'cv',      
      enabled: configs.cv || false,      
      label: t('types.cv'),          
      description: t('descriptions.cv'),          
      icon: <FileText className="w-6 h-6" />,    
      color: 'from-blue-500 to-cyan-500',    
      previewIcon: <FileText className="w-5 h-5 text-blue-400" />,
      premium: true 
    },
    { 
      scan_type: 'business',
      enabled: configs.business || false,
      label: t('types.business'),     
      description: t('descriptions.business'),     
      icon: <Briefcase className="w-6 h-6" />,   
      color: 'from-gray-500 to-zinc-500',    
      previewIcon: <Briefcase className="w-5 h-5 text-gray-400" />,
      premium: true 
    },
  ];

  // 🔹 Filtrer les options selon l'onglet actif
  const filteredOptions = scanOptions.filter(option => {
    if (activeTab === 'active') return option.enabled;
    if (activeTab === 'locked') return option.premium && !isPremium;
    return true;
  });

  // 🔹 Compter les options
  const stats = {
    total: scanOptions.length,
    active: scanOptions.filter(opt => opt.enabled).length,
    locked: scanOptions.filter(opt => opt.premium && !isPremium).length,
    available: scanOptions.filter(opt => !opt.premium || isPremium).length
  };

  // 🔹 Gestion des actions rapides
  const handleQuickAction = (actionId: string) => {
    if (actionId === 'preview') setIsPreviewOpen(true);
    if (actionId === 'refresh') handleRefresh();
    if (actionId === 'back') router.push('/dashboard');
  };


  // 🔹 Fermeture modal par Échap
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPreviewOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // 🔑 CORRECTION DE L'INITIALISATION - SUPPRIME LES VALEURS PAR DÉFAUT INCORRECTES
const fetchConfigs = async () => {
  setLoading(true);
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 🔹 Plan utilisateur
    const { data: profileData } = await supabase
      .from('profiles')
      .select('plan, custom_link_url')
      .eq('id', user.id)
      .single();
    
    setUserPlan(profileData?.plan || 'basic');
    setCustomLinkUrl(profileData?.custom_link_url || '');

    // 🔹 Configs EXISTANTES uniquement (pas de valeurs par défaut)
    const { data, error } = await supabase
      .from('card_configs')
      .select('scan_type, enabled')
      .eq('profile_id', user.id)
      .in('scan_type', scanOptions.map(o => o.scan_type));

    if (error) throw error;

    // 🔹 CRÉATION SÉCURISÉE DE LA MAP SANS VALEURS PAR DÉFAUT
    const configMap: Record<string, boolean> = {};
    
    // ✅ SEULEMENT les options EXISTANTES dans la BDD
    data?.forEach(cfg => {
      configMap[cfg.scan_type] = cfg.enabled;
    });
    
    // ✅ PAS DE VALEURS PAR DÉFAUT - les options absentes restent undefined
    setConfigs(configMap);
  } catch (err) {
    console.error('Erreur chargement configs:', err);
    toast.error('Impossible de charger les configurations');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchConfigs();
  }, []);

  // 🔑 REMPLACER L'EFFET REALTIME EXISTANT PAR CETTE VERSION ULTIME
useEffect(() => {
  const supabase = createClient();
  let cardChannel: any = null;
  let profileChannel: any = null;
  let reconnectTimeout: NodeJS.Timeout;
  let isMounted = true;

  const initRealtime = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      // 🔹 NETTOYAGE DES ANCIENS CANAUX
      if (cardChannel) supabase.removeChannel(cardChannel);
      if (profileChannel) supabase.removeChannel(profileChannel);

      // 🔹 CANAL CONFIGS CARTE - AVEC GESTION D'ERREURS AVANCÉE
      cardChannel = supabase
        .channel(`card-configs-${user.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'card_configs',
            filter: `profile_id=eq.${user.id}`
          },
          (payload: any) => {
            if (!isMounted) return;
            
            const { scan_type, enabled } = payload.new || {};
            if (!scan_type) return;

            // 🔹 IGNORER LES MISES À JOUR POUR L'OPTION EN COURS DE SAUVEGARDE
            if (saving === scan_type) {
              console.log(`⏭️ Ignoré mise à jour Realtime pour ${scan_type} (en cours de sauvegarde)`);
              return;
            }

            // 🔹 MISE À JOUR OPTIMISTE AVEC FEEDBACK VISUEL
            setConfigs(prev => {
              const wasEnabled = prev[scan_type];
              const newEnabled = !!enabled;
              
             // 🔹 ANIMATION SUBTILE SI CHANGEMENT EXTERNE
if (wasEnabled !== newEnabled) {
  setTimeout(() => {
    const element = document.querySelector(`[data-scan-type="${scan_type}"]`);
    if (element) {
      element.classList.add('animate-pulse-subtle'); // ✅ DÉJÀ ICI
      setTimeout(() => element.classList.remove('animate-pulse-subtle'), 300);
    }
  }, 100);
                
                // 🔹 TOAST DISCRET POUR L'UTILISATEUR
                if (wasEnabled !== undefined) {
                  toast.info(
                    `🔄 ${scan_type === 'profile' ? 'Profil' : scan_type.charAt(0).toUpperCase() + scan_type.slice(1)} ${newEnabled ? 'activé' : 'désactivé'} par un autre appareil`,
                    { duration: 2000, icon: <RefreshCw className="w-4 h-4 text-cyan-400" /> }
                  );
                }
              }
              
              return { ...prev, [scan_type]: newEnabled };
            });

            setLastRealtimeUpdate(new Date());
            setRealtimeError(null);
            realtimeRetryCount.current = 0; // Réinitialiser le compteur après succès
          }
        )
        .on('broadcast', { event: 'custom_event' }, (payload) => {
          console.log('📡 Broadcast reçu:', payload);
        })
        .subscribe((status) => {
  if (!isMounted) return;

  // ✅ CORRECTION : Conversion explicite en string + if/else
  const statusStr = String(status).toUpperCase();

  if (statusStr === 'SUBSCRIBED') {
    setIsRealtimeActive(true);
    setRealtimeError(null);
    realtimeRetryCount.current = 0;
    console.log('✅ Realtime activé - Écoute des mises à jour');
  } 
  else if (['CHANNEL_ERROR', 'CLOSED', 'TIMED_OUT'].includes(statusStr)) {
    setIsRealtimeActive(false);
    const errorMsg = statusStr === 'TIMED_OUT' 
      ? 'Délai de connexion dépassé' 
      : 'Erreur de connexion temps réel';
    
    setRealtimeError(errorMsg);
    
    if (realtimeRetryCount.current < MAX_RETRY_ATTEMPTS) {
      realtimeRetryCount.current++;
      console.warn(`⚠️ Realtime déconnecté (${statusStr}) - Tentative ${realtimeRetryCount.current}/${MAX_RETRY_ATTEMPTS}`);
      
      const delay = Math.min(1000 * Math.pow(2, realtimeRetryCount.current), 10000);
      reconnectTimeout = setTimeout(() => {
        if (isMounted && navigator.onLine) initRealtime();
      }, delay);
    } else {
      toast.error('❌ Connexion temps réel perdue', {
        description: 'Les modifications ne seront plus synchronisées en temps réel',
        duration: 5000,
        action: {
          label: 'Réessayer',
          onClick: () => {
            realtimeRetryCount.current = 0;
            initRealtime();
          }
        }
      });
    }
  } 
  else if (statusStr === 'SUBSCRIBING') {
    console.log('⏳ Connexion Realtime en cours...');
  }
});

     // 🔹 CANAL PROFILE (pour custom_link_url) - VERSION AMÉLIORÉE
      profileChannel = supabase
        .channel(`profile-${user.id}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload: any) => {
            if (!isMounted || saving === 'custom') return; // Ignorer si sauvegarde en cours
            
            const newUrl = payload.new?.custom_link_url;
            if (newUrl !== undefined && newUrl !== customLinkUrl) {
              setCustomLinkUrl(newUrl || '');
              setLastRealtimeUpdate(new Date());
              
              // 🔹 FEEDBACK VISUEL SPÉCIFIQUE POUR L'URL
              if (customLinkUrl) {
                toast.success('🔗 URL personnalisée mise à jour', {
                  description: 'Modifiée depuis un autre appareil',
                  duration: 2000
                });
              }
            }
          }
        )
        .subscribe();

      // 🔹 ÉCOUTEUR DE CONNEXION RÉSEAU
      const handleOnline = () => {
        if (!isRealtimeActive && isMounted) {
          console.log('🌐 Connexion réseau restaurée - Reconnexion Realtime...');
          initRealtime();
        }
      };

const handleOffline = () => {
        setIsRealtimeActive(false);
        setRealtimeError('Hors ligne');
        toast.warning('📴 Mode hors ligne', {
          description: 'Les modifications seront synchronisées à la reconnexion',
          duration: 3000
        });
      };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // 🔹 NETTOYAGE
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (cardChannel) supabase.removeChannel(cardChannel);
        if (profileChannel) supabase.removeChannel(profileChannel);
      };
    } catch (err) {
      console.error('💥 Erreur initialisation Realtime:', err);
      setRealtimeError('Échec initialisation temps réel');
      
      if (realtimeRetryCount.current < MAX_RETRY_ATTEMPTS) {
        realtimeRetryCount.current++;
        reconnectTimeout = setTimeout(() => {
          if (isMounted && navigator.onLine) initRealtime();
        }, 2000);
      }
    }
  };

  // 🔹 INITIALISATION INITIALE
  initRealtime();

    const interval = setInterval(() => {
      if (navigator.onLine) {
        initRealtime();
      }
    }, 45000);

   // 🔹 NETTOYAGE GLOBAL
  return () => {
    isMounted = false;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (cardChannel) supabase.removeChannel(cardChannel);
    if (profileChannel) supabase.removeChannel(profileChannel);
  };
}, [saving, customLinkUrl]); // Dépendances minimales pour éviter les reconnexions inutiles

  // 🔹 Rafraîchir les données
  const handleRefresh = async () => {
    toast.info('Rafraîchissement des données...', { duration: 2000 });
    await fetchConfigs();
  };

// 🔑 CORRECTION DÉFINITIVE DU TOGGLE - SUPPRIME LE ROLLBACK DANS FINALLY
const handleToggle = async (scanType: string) => {
  // 🔒 Vérifier si l'option est verrouillée
  const option = scanOptions.find(opt => opt.scan_type === scanType);
  if (option?.premium && !isPremium) {
    toast.warning('✨ Fonctionnalité Premium', {
      description: 'Débloquez toutes les options avec un abonnement Premium ou Entreprise',
      action: {
        label: 'Voir les plans',
        onClick: () => router.push('/dashboard/pricing')
      }
    });
    return;
  }

  // 🔹 NOUVELLE LOGIQUE : Toggle local SANS paramètre "enabled"
  const currentEnabled = configs[scanType];
  const newEnabled = !currentEnabled;
  
  setSaving(scanType);
  
  // 🔹 Optimistic update IMMÉDIAT avec nouveau état
  setConfigs(prev => ({ ...prev, [scanType]: newEnabled }));

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
          enabled: newEnabled, // ✅ Utilise le NOUVEL état
          updated_at: new Date().toISOString(),
          priority: scanOptions.findIndex(o => o.scan_type === scanType) + 1,
        },
        { onConflict: 'profile_id,scan_type' }
      );

    if (error) throw error;

    // 🔹 Feedback contextuel POUR LES DEUX ACTIONS
    toast.success(
      `✅ ${option?.label} ${newEnabled ? 'activé' : 'désactivé'} avec succès`,
      { duration: 1800 }
    );
    
    // 🔹 Mise à jour du dernier sync
    setLastRealtimeUpdate(new Date());
  } catch (err) {
    console.error('❌ Erreur sauvegarde toggle:', err);
    
    // 🔹 ROLLBACK UNIQUEMENT EN CAS D'ERREUR
    setConfigs(prev => ({ ...prev, [scanType]: currentEnabled }));
    
    toast.error(
      `❌ Échec ${newEnabled ? "d'activation" : 'de désactivation'} de ${option?.label}`,
      { duration: 3000 }
    );
  } finally {
    setSaving(null); // ✅ SEULEMENT reset saving - PAS DE ROLLBACK ICI
  }
};

  // 🔹 Sauvegarder l'URL personnalisée
  const handleSaveCustomUrl = async () => {
    if (!customLinkUrl.trim()) {
      toast.warning('⚠️ URL personnalisée vide');
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non trouvé");

      const { error } = await supabase
        .from('profiles')
        .update({ custom_link_url: customLinkUrl.trim() })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('✅ URL personnalisée enregistrée', { duration: 2000 });
    } catch (err) {
      console.error('Erreur sauvegarde URL:', err);
      toast.error('❌ Erreur lors de l\'enregistrement de l\'URL');
    }
  };

  // 🔹 Options activées pour la preview
  const enabledOptions = scanOptions.filter(opt => configs[opt.scan_type]);

  // 🔹 Helper : Badge de plan
  const getPlanBadge = () => {
    if (isPremium) {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
          <Crown className="w-3 h-3 mr-1" />
          {userPlan === 'premium' ? 'Premium' : 'Business'}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-gray-700 text-gray-300 border-gray-600">
        <User className="w-3 h-3 mr-1" />
        Basic
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full border-4 border-cyan-400 animate-spin"></div>
          <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full flex items-center justify-center">
            <Layout className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  function initRealtime() {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔹 En-tête moderne */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                  <QrCode className="w-6 h-6 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                  {t('title')}
                </h1>
              </div>
              <p className="text-gray-400 max-w-2xl">
                Personnalisez les fonctionnalités de votre carte NFC et QR Code. Activez uniquement ce dont vous avez besoin.
              </p>
            </div></div>
            
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
  {/* 🔹 STATISTIQUES EXISTANTES */}
  <div className="flex items-center gap-4 bg-white/5 rounded-xl p-3 border border-white/10">
    <div className="text-center">
      <div className="font-bold text-cyan-400">{stats.active}</div>
      <div className="text-xs text-gray-400">Activées</div>
    </div>
    <div className="w-px h-6 bg-white/10"></div>
    <div className="text-center">
      <div className="font-bold text-amber-400">{stats.locked}</div>
      <div className="text-xs text-gray-400">Verrouillées</div>
    </div>
  </div>
              {/* 🔹 INDICATEUR REALTIME ULTIME */}
  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
    <div className="flex flex-col items-center">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
        isRealtimeActive
          ? realtimeError 
            ? 'border-amber-500/50 bg-amber-900/30 text-amber-300' 
            : 'border-emerald-500/30 bg-emerald-900/30 text-emerald-300'
          : 'border-red-500/30 bg-red-900/30 text-red-300'
      }`}>
        <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
          isRealtimeActive
            ? realtimeError
              ? 'bg-amber-400 animate-pulse'
              : 'bg-emerald-400 animate-pulse'
            : 'bg-red-400'
        }`} />
        <span className="text-xs font-medium flex items-center gap-1">
          {isRealtimeActive 
            ? realtimeError 
              ? 'Instable' 
              : 'Temps réel' 
            : 'Hors ligne'}
          {lastRealtimeUpdate && isRealtimeActive && !realtimeError && (
            <span className="text-[10px] text-emerald-200/70">
              ({Math.floor((Date.now() - lastRealtimeUpdate.getTime()) / 1000)}s)
            </span>
          )}
        </span>
      </div>
      {realtimeError && (
        <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] mt-1 py-0.5">
          {realtimeError}
        </Badge>
      )}
    </div>
    
   {/* 🔹 BOUTON DE RECONNEXION RAPIDE */}
    {!isRealtimeActive && (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          realtimeRetryCount.current = 0;
          const cleanup = initRealtime();
          toast.info('🔄 Tentative de reconnexion...', { duration: 2000 });
          return cleanup;
        }}
        className="h-7 text-xs text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10"
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        Reconnecter
      </Button>
    )}
  </div>

  {/* 🔹 BADGE DE PLAN EXISTANT */}
  {getPlanBadge()}
</div>

          {/* 🔹 Barre d'actions rapide */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={loading}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </Button>
            <Button 
              onClick={() => setIsPreviewOpen(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('preview')}
            </Button>
          </div>
        </motion.div>

        {/* 🔹 Info card améliorée */}
        <Card className="glass-border bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border-blue-500/30 mb-8">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Sécurité renforcée
                </h3>
                <p className="text-sm text-blue-100 mt-1">
                  Chaque option activée crée un lien sécurisé vers votre profil. 
                  Désactivez les options inutilisées pour réduire votre surface d'attaque.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    🔒 Chiffrement AES-256
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    🌐 HTTPS obligatoire
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    👁️ Anonymisation IP
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🔹 Onglets de filtrage */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'active', 'locked'] as const).map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab 
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                : "border-white/20 text-gray-300 hover:bg-white/10"
              }
            >
              {tab === 'all' && <>Toutes ({stats.total})</>}
              {tab === 'active' && <>Activées ({stats.active})</>}
              {tab === 'locked' && (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Verrouillées ({stats.locked})
                </>
              )}
            </Button>
          ))}
        </div>

        {/* 🔹 Liste des options - VERSION CLIQUABLE INTÉGRALE */}
<div className="space-y-4">
  {filteredOptions.map((option, index) => {
    // Déterminer si l'option est verrouillée
    const isLocked = option.premium && !isPremium;
    
    return (
      <motion.div
        key={option.scan_type}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: isLocked ? 0 : -2 }}
        whileTap={{ scale: isLocked ? 1 : 0.995 }}
      >
        {/* 🔹 CONTENEUR CLIQUABLE INTÉGRAL */}
<div
  data-scan-type={option.scan_type}
  className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
    isLocked
      ? 'cursor-not-allowed opacity-90'
      : option.enabled
      ? 'cursor-pointer ring-2 ring-emerald-500/30 bg-gradient-to-r from-emerald-900/30 to-transparent hover:ring-emerald-500/50'
      : 'cursor-pointer hover:bg-white/5'
  }`}
  onClick={() => {
  if (isLocked) {
    toast.warning('✨ Fonctionnalité Premium', {
      description: 'Débloquez toutes les options avec un abonnement Premium ou Entreprise',
      action: {
        label: 'Voir les plans',
        onClick: () => router.push('/dashboard/pricing')
      }
    });
    return;
  }
  // ✅ TOGGLE TOUJOURS AUTORISÉ (l'input gère déjà stopPropagation)
  handleToggle(option.scan_type);
}}
>
          {/* 🔹 Overlay de clic (feedback visuel) */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          
          {/* 🔹 Carte principale */}
          <Card className="glass-border border-0 bg-transparent">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color} shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-lg group-hover:text-cyan-300 transition-colors">
                        {option.label}
                      </h3>
                      {option.enabled && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-fade-in">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activé
                        </Badge>
                      )}
                      {isLocked && (
                        <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30 animate-fade-in">
                          <Lock className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                    
                    {/* 🔹 Avantages Premium (uniquement si verrouillé) */}
                    {isLocked && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Crown className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-amber-200">
                            <p className="font-medium mb-1">Débloquez cette fonctionnalité :</p>
                            <ul className="space-y-1 ml-4 list-disc">
                              <li>Accès illimité à toutes les options</li>
                              <li>Analytics avancés en temps réel</li>
                              <li>Support prioritaire 24/7</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 🔹 Icône d'action (uniquement si non verrouillé) */}
                {!isLocked && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    {option.enabled ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-transform" />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 🔹 Champ URL personnalisée (uniquement pour custom ET activé) */}
          {option.scan_type === 'custom' && option.enabled && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="p-4 bg-white/5 border-t border-white/10"
    onClick={(e) => e.stopPropagation()} // ✅ CRITIQUE : Empêche le toggle quand on clique dans l'input
  >
              <Card className="glass-border bg-white/5 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Link className="w-4 h-4 text-pink-400" />
                    URL personnalisée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        id="custom-link-url"
                        placeholder="https://example.com/votre-lien-personnalise"
                        value={customLinkUrl}
                        onChange={(e) => setCustomLinkUrl(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-pink-500"
                        onClick={(e) => e.stopPropagation()} // 🔑 Important
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {customLinkUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomLinkUrl('');
                            }}
                            className="h-6 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveCustomUrl();
                          }}
                          className="h-6 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      🔗 Cette URL sera utilisée pour le scan de type "Lien personnalisé". 
                      Assurez-vous qu'elle commence par <span className="font-mono bg-white/10 px-1 rounded">https://</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  })}
</div>

        {/* 🔹 Confirmation visuelle */}
        {saving === null && stats.active > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="glass-border bg-emerald-900/20 border-emerald-500/30">
              <CardContent className="py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">✅ {stats.active} option{stats.active > 1 ? 's' : ''} activée{stats.active > 1 ? 's' : ''} • Vos modifications sont enregistrées en temps réel</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <DashboardQuickMenu onAction={handleQuickAction} actions={quickActions} />

        {/* 🔹 Modal preview - Design carte NFC premium */}
        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              onClick={() => setIsPreviewOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-md"
                onClick={e => e.stopPropagation()}
              >
                {/* 🔹 Bouton de fermeture */}
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-black/70 transition-all z-10 shadow-lg"
                  aria-label="Fermer la prévisualisation"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* 🔹 Carte NFC premium */}
                <div className="relative">
                  {/* 🔹 Puce NFC */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full border-2 border-gray-300 shadow-md z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full animate-pulse opacity-30"></div>
                  </div>
                  
                  {/* 🔹 Carte principale */}
                  <Card className="glass-border border-0 bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20">
                    {/* 🔹 Bande supérieure avec logo */}
                    <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-5 text-center">
                      <div className="flex justify-center gap-3 mb-3">
                        <Smartphone className="w-6 h-6 text-cyan-300" />
                        <div className="w-1 h-1 rounded-full bg-cyan-300 animate-pulse"></div>
                        <QrCode className="w-6 h-6 text-cyan-300" />
                      </div>
                      <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                        <Scan className="w-5 h-5 text-emerald-400" />
                        LUVIKA NFC
                      </h2>
                      <p className="text-cyan-200 text-sm mt-1">Digital Identity Card</p>
                    </div>

                    {/* 🔹 Contenu principal */}
                    <CardContent className="p-6">
                      {/* 🔹 Statut */}
                      <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm font-medium text-emerald-400">Carte active et sécurisée</span>
                      </div>

                      {/* 🔹 Options activées */}
                      {enabledOptions.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-red-400" />
                          </div>
                          <p className="text-gray-400 font-medium">
                            Aucune option activée
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Activez au moins une option pour personnaliser votre carte
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {enabledOptions.map((option, idx) => (
                            <motion.div
                              key={option.scan_type}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all"
                            >
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${option.color} group-hover:scale-110 transition-transform`}>
                                {option.previewIcon}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-white">{option.label}</div>
                                <div className="text-xs text-gray-400 line-clamp-1">{option.description}</div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* 🔹 QR Code placeholder */}
                      <div className="mt-6 p-4 bg-white/5 border-2 border-dashed border-cyan-500/30 rounded-xl flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                          <QrCode className="w-12 h-12 text-cyan-400 opacity-70" />
                        </div>
                        <p className="text-xs text-cyan-300 font-medium">
                          {enabledOptions.length > 0 
                            ? 'QR Code généré avec vos options activées' 
                            : 'Activez des options pour générer le QR Code'}
                        </p>
                      </div>
                    </CardContent>

                    {/* 🔹 Pied de page */}
                    <div className="bg-gradient-to-r from-gray-900 to-black p-4 border-t border-white/5">
                      <div className="flex justify-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      </div>
                      <p className="text-xs text-center text-gray-500">
                        {stats.active} option{stats.active > 1 ? 's' : ''} activée{stats.active > 1 ? 's' : ''} • LUVIKA NFC v2.0
                      </p>
                    </div>
                  </Card>

                  {/* 🔹 Effet de lumière */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 rounded-3xl pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent rounded-3xl opacity-20 animate-shimmer"></div>
                </div>

                {/* 🔹 Légende */}
                <div className="mt-6 text-center">
                  <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-sm px-4 py-1.5">
                    <Smartphone className="w-3 h-3 mr-1.5" />
                    Scannez avec un téléphone NFC ou QR Code
                  </Badge>
                  <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                    Cette prévisualisation montre exactement ce que verront les visiteurs lorsqu'ils scanneront votre carte NFC ou QR Code
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}