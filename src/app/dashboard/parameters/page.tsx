// src/app/dashboard/parameters/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  EyeOff, Fingerprint, Loader2, XCircle, AlertCircle,
  CheckCircle, Lock, Settings, Link, Copy, Shield, Timer, Smartphone,
  ArrowLeft, ShieldCheck, RefreshCw, Save, AlertTriangle,
  HelpCircle, Info, Pause, Trash,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DashboardQuickMenu from '@/src/components/dashboard/DashboardQuickMenu';
import { createClient } from '@/src/lib/supabase/client';

type Profile = {
  id: string;
  username?: string | null;
  hide_birth_year?: boolean | null;
  disable_birthday_icon?: boolean | null;
  verified?: boolean | null;
  plan?: string | null;
  is_public?: boolean | null;
  accepts_contact_requests?: boolean | null;
  enable_connection_alerts?: boolean | null;
  deactivated?: boolean | null;
  [key: string]: any;
};

// Hook biométrique (simulation fonctionnelle sans appel backend)
function useBiometricAuth() {
  const [status, setStatus] = useState<'checking' | 'unsupported' | 'available' | 'enabled'>('checking');
  const [deviceInfo, setDeviceInfo] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      try {
        if (!window.PublicKeyCredential) {
          setStatus('unsupported');
          setDeviceInfo('Navigateur non compatible');
          return;
        }
        // Simulation – en production, appelez votre API
        setStatus('available');
        setDeviceInfo('Biométrie (bientôt disponible)');
      } catch {
        setStatus('unsupported');
      }
    };
    checkSupport();
  }, []);

  const setupBiometricAuth = () => {
    toast.info('🔐 Fonctionnalité biométrique à venir', {
      description: 'Cette fonctionnalité sera disponible dans une prochaine mise à jour.',
    });
  };

  const disableBiometricAuth = () => {
    toast.info('🔓 Fonctionnalité biométrique à venir', {
      description: 'La désactivation sera possible ultérieurement.',
    });
  };

  return { status, deviceInfo, setupBiometricAuth, disableBiometricAuth };
}

export default function ParametersPage() {
  const t = useTranslations('dashboard.settings');
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmChecked, setDeleteConfirmChecked] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { status: biometricStatus, deviceInfo, setupBiometricAuth, disableBiometricAuth } = useBiometricAuth();

  const quickActions = [
    { id: 'save', label: 'Enregistrer', icon: <Save className="w-4 h-4" />, color: 'from-emerald-500 to-teal-500' },
    { id: 'refresh', label: 'Actualiser', icon: <RefreshCw className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'back', label: 'Retour', icon: <ArrowLeft className="w-4 h-4" />, color: 'from-gray-500 to-gray-600' },
  ];

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'save') handleSave();
    if (actionId === 'refresh') fetchProfile();
    if (actionId === 'back') router.push('/dashboard');
  };

  // Récupération du profil
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/login');
        return;
      }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      if (data) {
        setProfile({
          ...data,
          enable_connection_alerts: data.enable_connection_alerts ?? true,
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('❌ Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Sauvegarde
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          hide_birth_year: profile.hide_birth_year,
          disable_birthday_icon: profile.disable_birthday_icon,
          verified: profile.verified,
          is_public: profile.is_public,
          accepts_contact_requests: profile.accepts_contact_requests,
          enable_connection_alerts: profile.enable_connection_alerts,
        })
        .eq('id', profile.id);
      if (error) throw error;
      toast.success('✅ Paramètres enregistrés avec succès !');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('❌ Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  // REALTIME – Connexion Supabase
  useEffect(() => {
    let realtimeChannel: any = null;
    let mounted = true;

    const setupRealtime = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      realtimeChannel = supabase
        .channel(`profile-changes-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => {
            if (!mounted) return;
            setProfile(prev => prev ? { ...prev, ...payload.new } : prev);
            toast.info('📡 Profil mis à jour', { description: 'Les modifications ont été synchronisées', duration: 2000 });
          }
        )
        .subscribe((status) => {
          if (!mounted) return;
          if (status === 'SUBSCRIBED') {
            setIsRealtimeActive(true);
            toast.success('🔌 Connexion temps réel établie', { duration: 2000 });
          } else if (status === 'CHANNEL_ERROR') {
            setIsRealtimeActive(false);
            toast.error('⚠️ Temps réel indisponible', { duration: 3000 });
          }
        });
    };

    setupRealtime();

    // Gestionnaire de reconnexion réseau
    const handleOnline = () => {
      if (mounted && !isRealtimeActive) {
        setupRealtime();
        toast.info('🔄 Reconnexion au service temps réel', { duration: 2000 });
      }
    };
    window.addEventListener('online', handleOnline);

    return () => {
      mounted = false;
      if (realtimeChannel) realtimeChannel.unsubscribe();
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Désactivation du compte
  const handleDeactivateAccount = async () => {
    if (!deactivationReason.trim()) {
      toast.warning('⚠️ Veuillez indiquer une raison');
      return;
    }
    setDeactivating(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Utilisateur non authentifié');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ deactivated: true, deactivation_reason: deactivationReason })
        .eq('id', user.id);
      if (updateError) throw updateError;

      await supabase.auth.signOut();
      toast.success('✅ Compte désactivé', {
        description: 'Votre compte a été temporairement désactivé. Contactez le support pour le réactiver.',
        duration: 6000,
      });
      router.push('/');
    } catch (error: any) {
      console.error('Deactivation error:', error);
      toast.error('❌ Échec de la désactivation', { description: error.message || 'Veuillez réessayer plus tard' });
    } finally {
      setDeactivating(false);
      setShowDeactivateModal(false);
      setDeactivationReason('');
    }
  };

  // Suppression définitive (avec fallback si l'API n'existe pas)
  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.warning('⚠️ Veuillez entrer votre mot de passe');
      return;
    }
    if (!deleteConfirmChecked) {
      toast.warning('⚠️ Veuillez confirmer la suppression irréversible');
      return;
    }
    setDeleting(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Utilisateur non authentifié');

      // Vérification du mot de passe
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: deletePassword,
      });
      if (signInError) throw new Error('Mot de passe incorrect');

      // Tentative d'appel à l'API de suppression
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Échec de la suppression');
      }

      await supabase.auth.signOut();
      toast.success('✅ Compte supprimé', {
        description: 'Toutes vos données ont été supprimées définitivement.',
        duration: 8000,
      });
      router.push('/');
    } catch (error: any) {
      console.error('Deletion error:', error);
      toast.error('❌ Échec de la suppression', {
        description: error.message || 'Vérifiez votre mot de passe et réessayez',
      });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeletePassword('');
      setDeleteConfirmChecked(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{t('parameters.title')}</h1>
          <p className="text-gray-400">{t('parameters.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
              isRealtimeActive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-gray-500/30 bg-gray-500/10 text-gray-300'
            }`}>
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isRealtimeActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-xs font-medium">{isRealtimeActive ? 'Temps réel' : 'Hors ligne'}</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="border-white/20 text-gray-300 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('back')}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('saving')}</> : <><Save className="w-4 h-4 mr-2" /> {t('save')}</>}
          </Button>
        </div>
      </motion.div>

      {/* Message info */}
      <Card className="glass-border bg-blue-500/10 border-blue-500/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-medium">Sécurité renforcée</p>
              <p>Vos paramètres de confidentialité et sécurité sont protégés. Toutes les modifications sont sauvegardées dans votre compte.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidentialité / Biométrie */}
      <Card className="glass-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><EyeOff className="text-red-400" /> Confidentialité</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-6 p-4 rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/20">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2"><Fingerprint className="w-5 h-5 text-purple-400" /><Label className="text-gray-300 font-medium">Authentification biométrique</Label></div>
              <p className="text-sm text-gray-300 mb-3">Utilisez votre empreinte digitale, Face ID ou Windows Hello pour vous connecter rapidement et en toute sécurité.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {biometricStatus === 'checking' && <Badge variant="secondary" className="bg-gray-800 text-gray-400"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Vérification...</Badge>}
                {biometricStatus === 'unsupported' && <Badge variant="secondary" className="bg-red-900/40 text-red-300 border border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Non supporté</Badge>}
                {biometricStatus === 'available' && <Badge variant="secondary" className="bg-yellow-900/40 text-yellow-300 border border-yellow-500/30"><AlertCircle className="w-3 h-3 mr-1" /> {deviceInfo || 'Disponible'}</Badge>}
              </div>
              <div className="text-xs text-purple-300/80 space-y-1">
                <p>✅ Sécurité de niveau bancaire (FIDO2)</p>
                <p>✅ Aucune donnée biométrique stockée sur nos serveurs</p>
              </div>
            </div>
            <div className="flex flex-col items-end justify-start mt-4 md:mt-0">
              {biometricStatus === 'available' ? (
                <Button size="sm" onClick={setupBiometricAuth} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">Configurer</Button>
              ) : (
                <Button size="sm" variant="outline" disabled className="border-gray-700 text-gray-500 cursor-not-allowed">Non disponible</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options avancées */}
      <Card className="glass-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="text-cyan-400" /> {t('advanced.title')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div><Label className="text-gray-300">{t('advanced.public_profile')}</Label><p className="text-xs text-gray-400">{t('advanced.public_profile_desc')}</p></div>
            <Switch checked={profile.is_public === true} onCheckedChange={checked => setProfile({ ...profile, is_public: checked })} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div><Label className="text-gray-300">{t('advanced.contact_requests')}</Label><p className="text-xs text-gray-400">{t('advanced.contact_requests_desc')}</p></div>
            <Switch checked={profile.accepts_contact_requests === true} onCheckedChange={checked => setProfile({ ...profile, accepts_contact_requests: checked })} />
          </div>
          <div className="p-3 rounded-xl bg-white/5">
            <Label className="text-gray-300 flex items-center gap-2 mb-2"><Link className="w-4 h-4 text-cyan-400" /> {t('advanced.profile_url')}</Label>
            <div className="flex mt-1">
              <Input value={`https://luvika.me/${profile.username}`} readOnly className="rounded-r-none bg-white/10 border-r-0 border-white/20 text-cyan-300 font-mono" />
              <Button variant="outline" size="icon" className="rounded-l-none border-l-0 border-white/20 hover:bg-white/10" onClick={() => { navigator.clipboard.writeText(`https://luvika.me/${profile.username}`); toast.success(t('url_copied')); }}>
                <Copy className="w-4 h-4 text-gray-300" />
              </Button>
            </div>
          </div>

          {/* Alertes de connexion */}
          <div id="connection-alerts" className="flex items-center justify-between p-3 rounded-lg bg-amber-900/20 border border-amber-500/20">
            <div>
              <Label className="text-gray-300 flex items-center gap-2"><Smartphone className="w-4 h-4 text-amber-400" /> Alertes de connexion</Label>
              <p className="text-xs text-gray-400 mt-1 flex items-start gap-1"><AlertCircle className="w-3 h-3 mt-0.5" /> Recevoir une notification à chaque nouvelle connexion sur un nouvel appareil</p>
            </div>
            <div className="flex items-center gap-3">
              {profile.enable_connection_alerts ? (
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Activé</Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/20"><XCircle className="w-3 h-3 mr-1" /> Désactivé</Badge>
              )}
              <Switch
                checked={profile.enable_connection_alerts === true}
                onCheckedChange={(checked) => {
                  setProfile({ ...profile, enable_connection_alerts: checked });
                  if (checked) {
                    toast.success('🔔 Alertes activées', { description: 'Vous recevrez une notification pour chaque nouvelle connexion', duration: 3000 });
                  } else {
                    toast.info('🔕 Alertes désactivées', { description: 'Aucune notification ne sera envoyée pour les nouvelles connexions', duration: 3000 });
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestion du compte */}
      <Card className="glass-border border-rose-500/20 bg-gradient-to-br from-rose-900/15 to-pink-900/5">
        <CardHeader><CardTitle className="flex items-center gap-2 text-rose-400"><Shield className="w-5 h-5" /> Gestion du compte</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="p-4 rounded-xl bg-amber-900/15 border border-amber-500/20">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2"><Timer className="w-5 h-5 text-amber-400" /><Label className="text-gray-300 font-medium">Désactiver temporairement</Label></div>
                <p className="text-sm text-gray-300 mb-3">Votre profil sera masqué, vous ne recevrez plus de notifications, et vous ne pourrez pas vous connecter. <span className="font-medium text-amber-300">Vous pourrez le réactiver à tout moment</span> en contactant le support.</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" /><span>Vos données sont conservées en sécurité</span></li>
                  <li className="flex items-start gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" /><span>Réactivation possible sur demande</span></li>
                </ul>
              </div>
              <div className="mt-4 md:mt-0"><Button variant="outline" onClick={() => setShowDeactivateModal(true)} className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10">Désactiver le compte</Button></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-900/15 border border-red-500/20">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2"><XCircle className="w-5 h-5 text-red-400" /><Label className="text-gray-300 font-medium flex items-center gap-1.5">Supprimer définitivement <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">Irréversible</Badge></Label></div>
                <p className="text-sm text-gray-300 mb-3"><span className="font-bold text-red-300">Action irréversible :</span> Toutes vos données seront supprimées définitivement.</p>
                <ul className="text-xs text-gray-400 space-y-1.5 ml-4 list-disc">
                  <li>Profil public et informations personnelles</li>
                  <li>Cartes NFC, QR Codes et historique de scans</li>
                  <li>Portfolios, certifications, compétences</li>
                  <li>Événements, contacts, messages</li>
                </ul>
                <p className="text-xs text-red-300 mt-3 font-medium flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Cette action ne peut pas être annulée.</p>
              </div>
              <div className="mt-4 md:mt-0"><Button variant="destructive" onClick={() => setShowDeleteModal(true)} className="bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30">Supprimer le compte</Button></div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-start gap-3 p-3 bg-blue-900/15 rounded-lg">
              <HelpCircle className="w-4 h-4 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-200">Besoin d'aide ?</p>
                <p className="text-xs text-blue-300 mt-0.5">Contactez notre équipe support : <a href="mailto:support@luvika.me" className="text-cyan-300 hover:underline">support@luvika.me</a></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DashboardQuickMenu onAction={handleQuickAction} actions={quickActions} />

      {/* Modales */}
      <AnimatePresence>
        {showDeactivateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeactivateModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={e => e.stopPropagation()} className="w-full max-w-md glass-border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-amber-900/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5"><div className="p-2 bg-amber-500/15 rounded-lg"><Timer className="w-6 h-6 text-amber-400" /></div><div><h3 className="text-xl font-bold text-white">Désactiver votre compte</h3><p className="text-sm text-amber-200">Votre profil sera temporairement masqué.</p></div></div>
              <div className="space-y-4 mb-6">
                <div><Label htmlFor="deactivate-reason" className="text-gray-300 mb-1.5 block">Raison (optionnelle)</Label><Textarea id="deactivate-reason" value={deactivationReason} onChange={e => setDeactivationReason(e.target.value)} placeholder="Ex: Pause temporaire, changement de projet..." className="min-h-[100px] bg-white/5 border-white/10 focus:border-amber-400/50 text-white" /></div>
                <div className="p-3 bg-amber-900/20 border border-amber-500/20 rounded-lg"><p className="text-xs text-amber-200 flex items-start gap-1.5"><Info className="w-3 h-3 mt-0.5" /> Vos données restent sécurisées. Pour réactiver, contactez support@luvika.me.</p></div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeactivateModal(false)} className="border-white/20 text-gray-300 hover:bg-white/10">Annuler</Button>
                <Button onClick={handleDeactivateAccount} disabled={deactivating} className="bg-gradient-to-r from-amber-500 to-orange-600">{deactivating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Désactivation...</> : <>Confirmer la désactivation</>}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={e => e.stopPropagation()} className="w-full max-w-md glass-border border-red-500/30 bg-gradient-to-br from-red-900/20 to-red-900/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5"><div className="p-2 bg-red-500/15 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-400" /></div><div><h3 className="text-xl font-bold text-white">Suppression définitive</h3><p className="text-sm text-red-200">Action irréversible. Confirmez avec votre mot de passe.</p></div></div>
              <div className="space-y-5 mb-6">
                <div><Label htmlFor="delete-password" className="text-gray-300 mb-1.5 block">Mot de passe</Label><Input id="delete-password" type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 focus:border-red-400/50 text-white" /></div>
                <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-500/20 rounded-lg"><Checkbox id="delete-confirm" checked={deleteConfirmChecked} onCheckedChange={c => setDeleteConfirmChecked(c as boolean)} className="mt-0.5 border-red-400/50" /><Label htmlFor="delete-confirm" className="text-xs text-red-200">Je comprends que toutes mes données seront supprimées définitivement et que cette action ne peut pas être annulée.</Label></div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-white/20 text-gray-300 hover:bg-white/10">Annuler</Button>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting || !deleteConfirmChecked || deletePassword.length < 6} className="bg-gradient-to-r from-red-600 to-rose-700">{deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Suppression...</> : <>Supprimer définitivement</>}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}