//src/app/dashboard/parameters/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  EyeOff,
  Fingerprint,
  Calendar,
  Cake,
  ShieldCheck,
  Lock,
  Settings,
  Link,
  Copy,
  Loader2,
  XCircle,
  AlertCircle,
  CheckCircle,
  Shield,
  Timer,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import DashboardQuickMenu from '@/src/components/dashboard/DashboardQuickMenu';

import { createClient } from '@/src/lib/supabase/client';

// 🔐 Type pour le profil
type Profile = {
  id: string;
  username?: string | null;
  hide_birth_year?: boolean | null;
  disable_birthday_icon?: boolean | null;
  verified?: boolean | null;
  plan?: string | null;
  is_public?: boolean | null;
  accepts_contact_requests?: boolean | null;
  [key: string]: any;
};

// 🔐 Type pour les credentials WebAuthn
interface WebAuthnCredential {
  id: string;
  type: string;
  transports?: string[];
}

// 🔐 Hook personnalisé pour l'authentification biométrique
function useBiometricAuth() {
  const [status, setStatus] = useState<'checking' | 'unsupported' | 'available' | 'enabled' | 'error'>('checking');
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      // Vérifier le support de base WebAuthn
      if (
        typeof PublicKeyCredential === 'undefined' ||
        typeof window === 'undefined' ||
        !window.PublicKeyCredential
      ) {
        setStatus('unsupported');
        setIsSupported(false);
        return;
      }

      // Vérifier si un authentificateur plateforme (biométrie intégrée) est disponible
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);
        
        if (available) {
          // Déterminer le type d'appareil
          const platform = navigator.platform.toLowerCase();
          let device = 'Appareil compatible';
          
          if (/iphone|ipad|ipod/.test(platform)) device = 'Face ID / Touch ID';
          else if (/mac/.test(platform)) device = 'Face ID / Touch ID';
          else if (/android/.test(platform)) device = 'Empreinte digitale';
          
          setDeviceInfo(device);
          setStatus('available');
        } else {
          setStatus('unsupported');
        }
      } catch (err) {
        console.warn('Biometric check failed:', err);
        setStatus('unsupported');
      }

      // Vérifier si déjà enregistré
      try {
        const res = await fetch('/api/auth/biometric/status');
        if (res.ok) {
          const { enabled } = await res.json();
          if (enabled) {
            setIsEnabled(true);
            setStatus('enabled');
          }
        }
      } catch (err) {
        console.warn('Failed to check biometric status:', err);
      }
    };

    checkSupport();
  }, []);

  const setupBiometricAuth = async () => {
    if (status !== 'available') return;

    try {
      // 1. Obtenir les options d'enregistrement depuis le serveur
      const registerRes = await fetch('/api/auth/biometric/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!registerRes.ok) throw new Error('Échec de l\'initialisation');

      const { options } = await registerRes.json();

      // 2. Appeler l'API WebAuthn du navigateur
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          user: {
            ...options.user,
            id: Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0)),
          },
          excludeCredentials: options.excludeCredentials?.map((cred: WebAuthnCredential) => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
          })),
        },
      }) as PublicKeyCredential;

      // 3. Préparer la réponse pour le serveur
      const response = credential.response as AuthenticatorAttestationResponse;
      const clientDataJSON = new Uint8Array(response.clientDataJSON);
      const attestationObject = new Uint8Array(response.attestationObject);

      // 4. Envoyer au serveur pour vérification et sauvegarde
      const verifyRes = await fetch('/api/auth/biometric/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          response: {
            clientDataJSON: btoa(String.fromCharCode(...clientDataJSON)),
            attestationObject: btoa(String.fromCharCode(...attestationObject)),
          },
          type: credential.type,
          clientExtensionResults: credential.getClientExtensionResults(),
        }),
      });

      if (!verifyRes.ok) {
        const error = await verifyRes.json();
        throw new Error(error.message || 'Échec de l\'enregistrement');
      }

      setIsEnabled(true);
      setStatus('enabled');
      toast.success('✅ Biométrie activée avec succès !', {
        description: `Connectez-vous désormais avec ${deviceInfo || 'votre biométrie'}`,
      });
    } catch (error: any) {
      console.error('Biometric setup error:', error);
      
      // Gérer les erreurs utilisateur courantes
      if (error.name === 'AbortError') {
        toast.warning('Opération annulée', { description: 'Vous avez annulé l\'enregistrement biométrique' });
      } else if (error.name === 'NotAllowedError') {
        toast.error('Refusé', { description: 'Autorisation biométrique refusée dans les paramètres système' });
      } else {
        toast.error('❌ Échec de la configuration', { 
          description: error.message || 'Impossible d\'activer la biométrie sur cet appareil' 
        });
      }
      
      setStatus('available');
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      // 1. Obtenir les options d'authentification
      const authRes = await fetch('/api/auth/biometric/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!authRes.ok) throw new Error('Échec de l\'initialisation');

      const { options } = await authRes.json();

      // 2. Appeler WebAuthn pour l'authentification
      const assertion = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          allowCredentials: options.allowCredentials?.map((cred: WebAuthnCredential) => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
          })),
        },
      }) as PublicKeyCredential;

      // 3. Préparer la réponse
      const response = assertion.response as AuthenticatorAssertionResponse;
      const clientDataJSON = new Uint8Array(response.clientDataJSON);
      const authenticatorData = new Uint8Array(response.authenticatorData);
      const signature = new Uint8Array(response.signature);

      // 4. Vérifier auprès du serveur
      const verifyRes = await fetch('/api/auth/biometric/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: assertion.id,
          rawId: Array.from(new Uint8Array(assertion.rawId)),
          response: {
            clientDataJSON: btoa(String.fromCharCode(...clientDataJSON)),
            authenticatorData: btoa(String.fromCharCode(...authenticatorData)),
            signature: btoa(String.fromCharCode(...signature)),
            userHandle: response.userHandle 
              ? btoa(String.fromCharCode(...new Uint8Array(response.userHandle)))
              : null,
          },
          type: assertion.type,
          clientExtensionResults: assertion.getClientExtensionResults(),
        }),
      });

      if (!verifyRes.ok) {
        const error = await verifyRes.json();
        throw new Error(error.message || 'Échec de l\'authentification');
      }

      toast.success('✅ Authentification réussie !', {
        description: 'Vous êtes connecté avec votre biométrie',
      });
      
      // Rafraîchir la session Supabase
      const supabase = createClient();
      await supabase.auth.refreshSession();
      
      return true;
    } catch (error: any) {
      console.error('Biometric auth error:', error);
      
      if (error.name === 'AbortError') {
        toast.warning('Annulé', { description: 'Authentification biométrique annulée' });
      } else if (error.name === 'NotAllowedError') {
        toast.error('Refusé', { description: 'Veuillez autoriser l\'authentification biométrique' });
      } else {
        toast.error('❌ Échec de l\'authentification', {
          description: error.message || 'Impossible de vérifier votre identité biométrique'
        });
      }
      
      return false;
    }
  };

  const disableBiometricAuth = async () => {
    try {
      const res = await fetch('/api/auth/biometric/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Échec de la désactivation');

      setIsEnabled(false);
      setStatus('available');
      toast.success('✅ Biométrie désactivée', {
        description: 'Vous devrez utiliser votre mot de passe pour vous connecter',
      });
    } catch (error: any) {
      console.error('Disable biometric error:', error);
      toast.error('❌ Échec de la désactivation', {
        description: error.message || 'Impossible de désactiver la biométrie'
      });
    }
  };

  return {
    status,
    isSupported,
    isEnabled,
    deviceInfo,
    setupBiometricAuth,
    authenticateWithBiometric,
    disableBiometricAuth,
  };
}

// 🔐 Page complète des paramètres
export default function ParametersPage() {
  const t = useTranslations('dashboard.settings');
  const router = useRouter();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔐 Hook biométrique
  const {
    status: biometricStatus,
    deviceInfo,
    setupBiometricAuth,
    disableBiometricAuth,
  } = useBiometricAuth();

  // Quick actions menu
  const quickActions = [
    {
      id: 'save',
      label: 'Enregistrer',
      icon: <Save className="w-4 h-4" />,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'refresh',
      label: 'Actualiser',
      icon: <RefreshCw className="w-4 h-4" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'back',
      label: 'Retour',
      icon: <ArrowLeft className="w-4 h-4" />,
      color: 'from-gray-500 to-gray-600',
    },
  ];

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'save') handleSave();
    if (actionId === 'refresh') fetchProfile();
    if (actionId === 'back') router.push('/dashboard');
  };

  // Charger le profil
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
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

  // Sauvegarder les modifications
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
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="border-white/20 text-gray-300 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('save')}
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Message d'information */}
      <Card className="glass-border bg-blue-500/10 border-blue-500/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-sm text-blue-200">
              <p className="font-medium">Sécurité renforcée</p>
              <p>Vos paramètres de confidentialité et sécurité sont protégés. Toutes les modifications sont sauvegardées dans votre compte.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 🔐 Confidentialité */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="text-red-400" /> {t('privacy.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 🔸 Biométrie - NOUVEAU */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-6 p-4 rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/20">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Fingerprint className="w-5 h-5 text-purple-400" />
                  <Label className="text-gray-300 font-medium">{t('privacy.biometric_auth')}</Label>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  {t('privacy.biometric_auth_desc')}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {biometricStatus === 'checking' && (
                    <Badge variant="secondary" className="bg-gray-800 text-gray-400">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Vérification...
                    </Badge>
                  )}
                  {biometricStatus === 'unsupported' && (
                    <Badge variant="secondary" className="bg-red-900/40 text-red-300 border border-red-500/30">
                      <XCircle className="w-3 h-3 mr-1" /> Non supporté
                    </Badge>
                  )}
                  {biometricStatus === 'available' && (
                    <Badge variant="secondary" className="bg-yellow-900/40 text-yellow-300 border border-yellow-500/30">
                      <AlertCircle className="w-3 h-3 mr-1" /> {deviceInfo || 'Disponible'}
                    </Badge>
                  )}
                  {biometricStatus === 'enabled' && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" /> Activé • {deviceInfo}
                    </Badge>
                  )}
                </div>
                
                <div className="text-xs text-purple-300/80 space-y-1">
                  <p>✅ Sécurité de niveau bancaire (FIDO2)</p>
                  <p>✅ Aucune donnée biométrique stockée sur nos serveurs</p>
                  <p>✅ Fonctionne avec Face ID, Touch ID et empreintes Android</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-start mt-4 md:mt-0">
                {biometricStatus === 'enabled' ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={disableBiometricAuth}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                    disabled={biometricStatus !== 'enabled'}
                  >
                    <Lock className="w-4 h-4 mr-1" /> Désactiver
                  </Button>
                ) : biometricStatus === 'available' ? (
                  <Button
                    size="sm"
                    onClick={setupBiometricAuth}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                    disabled={biometricStatus !== 'available'}
                  >
                    <Fingerprint className="w-4 h-4 mr-1" /> Configurer
                  </Button>
                ) : biometricStatus === 'unsupported' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="border-gray-700 text-gray-500 cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Non disponible
                  </Button>
                ) : null}
                
                {biometricStatus === 'checking' && (
                  <div className="mt-2">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🔸 Masquer l'année de naissance */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div>
              <Label className="text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                {t('privacy.hide_birth_year')}
              </Label>
              <p className="text-xs text-gray-400 mt-1">{t('privacy.hide_birth_year_desc')}</p>
            </div>
            <Switch 
              checked={profile.hide_birth_year === true} 
              onCheckedChange={checked => setProfile({ ...profile, hide_birth_year: checked })} 
            />
          </div>

          {/* 🔸 Désactiver l'icône anniversaire */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div>
              <Label className="text-gray-300 flex items-center gap-2">
                <Cake className="w-4 h-4 text-amber-400" />
                {t('privacy.disable_birthday_icon')}
              </Label>
              <p className="text-xs text-gray-400 mt-1">{t('privacy.disable_birthday_icon_desc')}</p>
            </div>
            <Switch 
              checked={profile.disable_birthday_icon === true} 
              onCheckedChange={checked => setProfile({ ...profile, disable_birthday_icon: checked })} 
            />
          </div>

          {/* 🔸 Badge de vérification — RÉSERVÉ AUX ENTREPRISES */}
          <div className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
            profile.plan === 'entreprise' 
              ? 'bg-white/5 hover:bg-white/10' 
              : 'bg-gray-800/50 cursor-not-allowed'
          }`}>
            <div>
              <Label className="text-gray-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {t('privacy.verified_badge')}
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-400">{t('privacy.verified_badge_desc')}</p>
                {profile.verified && (
                  <img 
                    src="/badge.png"
                    alt="✅ Vérifié" 
                    className="w-5 h-5 rounded-full border border-emerald-400/30"
                    title={t('privacy.verified_tooltip')}
                  />
                )}
              </div>
            </div>
            
            {profile.plan === 'entreprise' ? (
              <Switch 
                checked={profile.verified === true}
                onCheckedChange={checked => setProfile({ ...profile, verified: checked })}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-yellow-400" />
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs px-2 py-0.5">
                  {t('privacy.enterprise_only')}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 🔹 ⚙️ Options avancées */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="text-cyan-400" /> {t('advanced.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div>
              <Label className="text-gray-300">{t('advanced.public_profile')}</Label>
              <p className="text-xs text-gray-400">{t('advanced.public_profile_desc')}</p>
            </div>
            <Switch 
              checked={profile.is_public === true} 
              onCheckedChange={checked => setProfile({ ...profile, is_public: checked })} 
            />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div>
              <Label className="text-gray-300">{t('advanced.contact_requests')}</Label>
              <p className="text-xs text-gray-400">{t('advanced.contact_requests_desc')}</p>
            </div>
            <Switch 
              checked={profile.accepts_contact_requests === true} 
              onCheckedChange={checked => setProfile({ ...profile, accepts_contact_requests: checked })} 
            />
          </div>
          
          <div className="p-3 rounded-xl bg-white/5">
            <Label className="text-gray-300 flex items-center gap-2 mb-2">
              <Link className="w-4 h-4 text-cyan-400" /> {t('advanced.profile_url')}
            </Label>
            <div className="flex mt-1">
              <Input 
                value={`https://luvika.me/${profile.username}`} 
                readOnly 
                className="rounded-r-none bg-white/10 border-r-0 border-white/20 text-cyan-300 font-mono" 
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-l-none border-l-0 border-white/20 hover:bg-white/10" 
                onClick={() => {
                  navigator.clipboard.writeText(`https://luvika.me/${profile.username}`);
                  toast.success(t('url_copied'));
                }}
              >
                <Copy className="w-4 h-4 text-gray-300" />
              </Button>
            </div>
          </div>
          
          {/* 🔸 NOUVEAU: Options de sécurité avancées */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <Label className="text-gray-300 flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-rose-400" /> Sécurité avancée
            </Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-900/20">
                <div>
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-rose-400" /> Session automatique
                  </Label>
                  <p className="text-xs text-gray-400 mt-1">
                    Déconnexion automatique après 15 min d'inactivité
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-900/20">
                <div>
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" /> Alertes de connexion
                  </Label>
                  <p className="text-xs text-gray-400 mt-1">
                    Recevoir une notification à chaque nouvelle connexion
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Menu */}
      <DashboardQuickMenu 
        onAction={handleQuickAction} 
        actions={quickActions} 
      />
    </div>
  );
}