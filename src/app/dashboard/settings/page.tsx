// src/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Save, Image as ImageIcon, ExternalLink, Eye, Mail, Phone,
  Smartphone, Globe, Instagram, MapPin, Brush, Palette, User, Settings, Crown,
  AlertTriangle, CheckCircle, X, RotateCcw, Cake, Tag, Link as LinkIcon,
  Briefcase, Github, Linkedin, Gitlab, FileText, Calendar, Plus, EyeOff, Lock, ShieldCheck,
  Wifi, WifiOff, RefreshCw, Bell, BellOff, AlertCircle, ArrowLeft, ChevronRight,
  ChevronDown, ChevronUp, Check, Sparkles, Star, Zap, Gift, Trophy, Award,
  XCircle,
  Menu
} from 'lucide-react';
import { SiTiktok } from "react-icons/si";
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Switch } from '../../../../components/ui/switch';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { createClient } from '../../../../src/lib/supabase/client';
import DashboardQuickMenu from '@/src/components/dashboard/DashboardQuickMenu';

// 🔹 Icônes manquantes (définies avant utilisation)
const Copy = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12v-4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6m4-10h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
  </svg>
);

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

const FolderIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
  </svg>
);

// 🔹 Types
type Profile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio_short: string | null;
  bio_long: string | null;
  job_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  likes_count?: number;
  nfc_cards?: { status: string }[];
  // 🔹 ✅ Nouveaux réseaux sociaux
  tiktok: string | null;
  linkedin: string | null;
  snapchat: string | null;
  telegram: string | null;
  github: string | null;
  gitlab: string | null;
  behance: string | null;
  dribbble: string | null;
  calendly: string | null;
  portfolio_url: string | null;
  cv_url: string | null;
  // 🔹 ✅ Identité personnelle
  nickname: string | null;
  pronouns: string | null;
  birth_day: number | null;
  birth_month: number | null;
  birth_year: number | null;
  // 🔹 ✅ Localisation & disponibilité
  city: string | null;
  country: string | null;
  timezone: string | null;
  availability: 'available' | 'unavailable' | 'by_appointment' | null;
  // 🔹 ✅ Compétences
  skills: string[] | null;
  // 🔹 ✅ Statut professionnel
  professional_status: 'student' | 'employed' | 'freelance' | 'open_to_work' | 'other' | null;
  website: string | null;
  address: string | null;
  theme: { primary: string; background: string };
  is_public: boolean;
  sections_visibility: Record<string, boolean>;
  plan: string;
  accepts_contact_requests: boolean;
  // 🔹 ✅ Paramètres de confidentialité
  hide_birth_year: boolean;
  disable_birthday_icon: boolean;
  verified: boolean;
  enable_connection_alerts?: boolean | null;
};

// 🔹 Couleurs LUVIKA
const LUVIKA_COLORS = {
  primary: '#0ea5e9',
  secondary: '#06b6d4',
  accent: '#f59e0b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  premium: '#8b5cf6',
  business: '#ec4899',
};

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    professional: true,
    social: true,
    location: true,
    privacy: true,
    account: false,
  });
const [isRealtimeActive, setIsRealtimeActive] = useState(false);
const [lastRealtimeUpdate, setLastRealtimeUpdate] = useState<Date | null>(null);
const [realtimeError, setRealtimeError] = useState<string | null>(null);

  // 🔹 Quick actions menu
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

  // 🔹 Fetch profil
  const fetchProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('❌ Erreur chargement profil:', error);
      toast.error(t('load_error'));
      return;
    }

    // 🔹 Valeurs par défaut pour les nouveaux champs
    const defaults = {
      hide_birth_year: false,
      disable_birthday_icon: false,
      verified: false,
      skills: [],
      enable_connection_alerts: true,
      ...data,
    };

    setProfile(defaults as Profile);
    setLoading(false);
  };

  useEffect(() => {
  if (!profile?.id) return;
  
  const supabase = createClient();
  
  const channel = supabase
    .channel(`profile-settings-${profile.id}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${profile.id}`,
      },
      (payload) => {
        // 🔹 Mise à jour silencieuse du profil si modifié ailleurs
        setProfile((prev) => prev ? { ...prev, ...payload.new } : prev);
        setLastRealtimeUpdate(new Date());
        console.log('🔄 Profil mis à jour depuis un autre appareil');
        toast.info('🔄 Profil synchronisé depuis un autre appareil', { duration: 2000 });
      }
    )
    .subscribe((status) => {
      setIsRealtimeActive(status === 'SUBSCRIBED');
      if (status === 'CHANNEL_ERROR') setRealtimeError('Erreur de connexion');
      else if (status === 'TIMED_OUT') setRealtimeError('Délai de connexion dépassé');
      else setRealtimeError(null);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [profile?.id]);

  useEffect(() => {
    fetchProfile();
  }, [router, t]);

  // 🔹 Calcul de la complétion du profil
  const getCompletion = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.full_name,
      profile.username,
      profile.job_title,
      profile.bio_short,
      profile.email,
      profile.phone,
      profile.address,
      profile.website,
      profile.instagram,
      profile.avatar_url,
      profile.nickname,
      profile.pronouns,
      profile.birth_day,
      profile.city,
      profile.skills?.length ? true : null,
    ].filter(f => f != null && f !== '');

    return Math.min(100, Math.round((fields.length / 15) * 100));
  };

  // 🔹 Gestion de l'expansion des sections
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

    // 🔹 Fonction d'upload d'image (CORRIGÉE)
const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>, 
  type: 'avatar' | 'cover'
) => {
  const file = e.target.files?.[0];
  if (!file || !profile) return;

  // 1️⃣ Déterminer le bon bucket et la taille max
  const bucketName = type === 'avatar' ? 'avatars' : 'covers';
  const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

  // Vérification taille
  if (file.size > maxSize) {
    toast.error(`Fichier trop lourd (max ${type === 'avatar' ? '5MB' : '10MB'})`);
    return;
  }

  // Vérification format
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    toast.error('Format non supporté (utilisez JPG, PNG, WebP ou GIF)');
    return;
  }

  try {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    
    // 2️⃣ Nom du fichier unique : user-id-type-timestamp.ext
    const fileName = `${profile.id}-${type}-${Date.now()}.${fileExt}`;

    // 3️⃣ Upload vers le BON bucket (avatars ou covers)
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Erreur upload:', uploadError);
      throw uploadError;
    }

    // 4️⃣ Récupérer l'URL publique (CORRECTION ICI)
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error('Impossible de récupérer l\'URL publique');
    }

    // 5️⃣ Mettre à jour l'état local
    setProfile({
      ...profile,
      [type === 'avatar' ? 'avatar_url' : 'cover_url']: urlData.publicUrl,
    });

    toast.success(`${type === 'avatar' ? '✅ Avatar' : '✅ Couverture'} téléchargé avec succès !`);

    // 6️⃣ Reset input
    e.target.value = '';

  } catch (err: any) {
    console.error('❌ Erreur upload:', err);
    toast.error(`Échec de l'upload: ${err.message || 'Erreur inconnue'}`);
  }
};
 const handleSave = async () => {
  if (!profile) return;

  if (!isRealtimeActive) {
    toast.warning('⚠️ Mode hors ligne - Les modifications seront synchronisées à la reconnexion', {
      duration: 4000,
    });
  }

  setSaving(true);

  try {
    const supabase = createClient();
    
    // 🔹 Préparer les updates avec valeurs par défaut sûres
    const updates = {
      full_name: profile.full_name?.trim() || null,
      username: profile.username?.trim().toLowerCase() || null,
      avatar_url: profile.avatar_url || null,
      cover_url: profile.cover_url || null,
      bio_short: profile.bio_short || null,
      bio_long: profile.bio_long || null,
      job_title: profile.job_title || null,
      company: profile.company || null,
      email: profile.email || null,
      phone: profile.phone || null,
      whatsapp: profile.whatsapp || null,
      instagram: profile.instagram?.replace(/^@/, '') || null,
      tiktok: profile.tiktok?.replace(/^@/, '') || null,
      linkedin: profile.linkedin?.replace(/^https?:\/\//, '') || null,
      snapchat: profile.snapchat?.replace(/^@/, '') || null,
      telegram: profile.telegram?.replace(/^@/, '') || null,
      github: profile.github?.replace(/^https?:\/\//, '') || null,
      gitlab: profile.gitlab?.replace(/^https?:\/\//, '') || null,
      behance: profile.behance?.replace(/^https?:\/\//, '') || null,
      dribbble: profile.dribbble?.replace(/^https?:\/\//, '') || null,
      calendly: profile.calendly?.replace(/^https?:\/\//, '') || null,
      portfolio_url: profile.portfolio_url?.replace(/^https?:\/\//, '') || null,
      cv_url: profile.cv_url?.replace(/^https?:\/\//, '') || null,
      nickname: profile.nickname || null,
      pronouns: profile.pronouns || null,
      birth_day: profile.birth_day || null,
      birth_month: profile.birth_month || null,
      birth_year: profile.birth_year || null,
      city: profile.city || null,
      country: profile.country || null,
      timezone: profile.timezone || null,
      availability: profile.availability || null,
      skills: profile.skills || [], // ✅ tableau vide par défaut
      professional_status: profile.professional_status || null,
      website: profile.website || null,
      address: profile.address || null,
      theme: profile.theme || { primary: '#0ea5e9', background: '#0f172a' },
      is_public: profile.is_public ?? true,
      sections_visibility: profile.sections_visibility || {},
      accepts_contact_requests: profile.accepts_contact_requests ?? true,
      hide_birth_year: profile.hide_birth_year ?? false,
      disable_birthday_icon: profile.disable_birthday_icon ?? false,
      // ❌ verified: profile.verified, // Ne pas inclure
      enable_connection_alerts: profile.enable_connection_alerts ?? true,
    };

    console.log('📤 Sauvegarde du profil:', updates);

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw error;
    }

    toast.success('✅ Profil mis à jour avec succès !', {
      duration: 3000,
    });

    router.refresh();
  } catch (err: any) {
    console.error('❌ Erreur sauvegarde:', err);
    const message = err?.message || err?.error_description || err?.details || 'Erreur inconnue';
    toast.error(`❌ Échec de la sauvegarde : ${message}`);
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900/20">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full border-4 border-cyan-400 animate-spin"></div>
          <div className="absolute inset-4 bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // 🔹 Helper : Icône de badge selon le plan
  const getPlanBadge = () => {
    switch (profile.plan) {
      case 'premium':
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        );
      case 'entreprise':
        return (
          <Badge variant="secondary" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
            <Briefcase className="w-3 h-3 mr-1" />
            Business
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-700 text-gray-300 border-gray-600">
            <User className="w-3 h-3 mr-1" />
            Basic
          </Badge>
        );
    }
  };

  // 🔹 Helper : Statut professionnel avec icône
  const getProfessionalStatusBadge = () => {
    const status = profile.professional_status;
    if (!status) return null;

    const statusConfig = {
      student: { icon: <Award className="w-3 h-3" />, label: 'Étudiant', color: 'bg-blue-500/20 text-blue-300' },
      employed: { icon: <CheckCircle className="w-3 h-3" />, label: 'En poste', color: 'bg-green-500/20 text-green-300' },
      freelance: { icon: <Zap className="w-3 h-3" />, label: 'Freelance', color: 'bg-purple-500/20 text-purple-300' },
      'open_to_work': { icon: <Sparkles className="w-3 h-3" />, label: 'Ouvert', color: 'bg-yellow-500/20 text-yellow-300' },
      other: { icon: <User className="w-3 h-3" />, label: 'Autre', color: 'bg-gray-500/20 text-gray-300' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} border-0`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  function handleQuickAction(id: string): void {
    throw new Error('Function not implemented.');
  }

  return (
      <div className="max-w-7xl mx-auto">
        {/* 🔹 En-tête moderne */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
    isRealtimeActive
      ? realtimeError 
        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
      : 'bg-red-500/20 text-red-300 border border-red-500/30'
  }`}>
    <div className={`w-2 h-2 rounded-full ${
      isRealtimeActive ? (realtimeError ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-red-400'
    } animate-pulse`} />
    <span>{isRealtimeActive ? (realtimeError ? 'Instable' : 'Temps réel') : 'Hors ligne'}</span>
    {lastRealtimeUpdate && isRealtimeActive && !realtimeError && (
      <span className="text-[10px] opacity-70">
        ({Math.floor((Date.now() - lastRealtimeUpdate.getTime()) / 1000)}s)
      </span>
    )}
  </div>
  {!isRealtimeActive && (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => window.location.reload()}
      className="h-7 text-xs text-cyan-300 hover:text-cyan-200"
    >
      <RefreshCw className="w-3 h-3 mr-1" />
      Reconnecter
    </Button>
  )}
</div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                  <Settings className="w-6 h-6 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
                  {t('title')}
                </h1>
              </div>
              <p className="text-gray-400 max-w-2xl">
                Gérez vos informations personnelles, professionnelles et vos préférences de confidentialité
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* 🔹 Progression du profil */}
              <div className="w-full sm:w-auto">
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Complétion du profil</span>
                      <span className="text-sm font-bold text-white">{getCompletion()}%</span>
                    </div>
                    <Progress 
  value={getCompletion()} 
  className="h-2 bg-white/10" 
  indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-500"
/>

                  </div>
                  {getCompletion() < 100 && (
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-300 border-yellow-500/20">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      À compléter
                    </Badge>
                  )}
                </div>
              </div>

              {/* 🔹 Badge de plan */}
              {getPlanBadge()}
            </div>
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
              onClick={handleSave} 
              disabled={saving}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? t('contact.saving') : t('contact.save')}
            </Button>
          </div>
        </motion.div>

        {/* 🔹 Layout en deux colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 🔹 Colonne de gauche : Navigation */}
          <div className="lg:col-span-1 space-y-4">
            {/* 🔹 Carte de navigation */}
            <Card className="glass-border bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <Menu className="w-4 h-4 text-cyan-400" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-1">
                  {[
                    { id: 'profile', label: 'Profil', icon: User },
                    { id: 'personal', label: 'Informations personnelles', icon: User },
                    { id: 'professional', label: 'Identité professionnelle', icon: Briefcase },
                    { id: 'social', label: 'Réseaux sociaux', icon: Instagram },
                    { id: 'location', label: 'Localisation', icon: MapPin },
                    { id: 'privacy', label: 'Confidentialité', icon: ShieldCheck },
                    { id: 'account', label: 'Gestion du compte', icon: Lock },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          // Scroll to section
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                          activeTab === item.id
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* 🔹 Statut professionnel */}
            <Card className="glass-border bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Statut professionnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getProfessionalStatusBadge() || (
                  <p className="text-sm text-gray-400">Non défini</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 🔹 Colonne de droite : Contenu */}
          <div className="lg:col-span-2 space-y-6">
            {/* 🔹 Section Profil */}
            <section id="profile" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="text-cyan-400" />
                  Profil
                </h2>
                <button
                  onClick={() => toggleSection('profile')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedSections.profile ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {expandedSections.profile && (
                <Card className="glass-border bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                      Photo de profil et couverture
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profile.plan === 'basic' ? (
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-yellow-500/20">
                        <div className="flex items-center gap-3 text-yellow-400 mb-3">
                          <Lock className="w-5 h-5" />
                          <span className="font-bold text-lg">Fonctionnalité Premium</span>
                        </div>
                        <p className="text-gray-400 mb-4">
                          Débloquez les photos de profil et de couverture avec un abonnement Premium.
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400"
                          onClick={() => router.push('/dashboard/pricing')}
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Passer à Premium
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Avatar */}
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 flex items-center justify-center text-2xl font-bold text-white border-4 border-white/30 shadow-2xl shadow-cyan-500/20">
                              {profile.avatar_url ? (
                                <img 
                                  src={profile.avatar_url} 
                                  alt="Avatar" 
                                  className="w-32 h-32 rounded-full object-cover"
                                />
                              ) : profile.full_name ? (
                                profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                              ) : (
                                '?'
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="bg-white/20 hover:bg-white/30 text-white"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Changer
                              </Button>
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label className="text-gray-300 font-medium">Photo de profil</Label>
                            <div className="flex gap-2">
                              <Input
  type="file"
  ref={fileInputRef}
  accept="image/*"
  className="hidden"
  onChange={(e) => handleImageUpload(e, 'avatar')} // <--- AJOUTER CECI
/>
                              <Button 
                                variant="outline" 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Télécharger une photo
                              </Button>
                              {profile.avatar_url && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setProfile({ ...profile, avatar_url: null })}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              Format: JPG, PNG • Taille max: 5 Mo • Dimensions recommandées: 400x400px
                            </p>
                          </div>
                        </div>

                        {/* Couverture */}
                        <div className="space-y-2">
                          <Label className="text-gray-300 font-medium">Photo de couverture</Label>
                          <div
                            className="w-full h-48 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-black/30 cursor-pointer hover:bg-white/5 transition-colors relative overflow-hidden"
                            onClick={() => coverInputRef.current?.click()}
                          >
                            {profile.cover_url ? (
                              <img 
                                src={profile.cover_url} 
                                alt="Cover" 
                                className="w-full h-48 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="text-center text-gray-400 p-4">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="font-medium">Ajouter une photo de couverture</p>
                                <p className="text-sm mt-1">Cliquez pour télécharger</p>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button 
                                variant="ghost" 
                                className="bg-white/20 hover:bg-white/30 text-white"
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Changer
                              </Button>
                            </div>
                          </div>
                          <Input
  type="file"
  ref={coverInputRef}
  accept="image/*"
  className="hidden"
  onChange={(e) => handleImageUpload(e, 'cover')} // <--- AJOUTER CECI
/>
                          <p className="text-xs text-gray-400">
                            Format: JPG, PNG • Taille max: 10 Mo • Dimensions recommandées: 1200x400px
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </section>

            {/* 🔹 Section Informations personnelles */}
            <section id="personal" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="text-cyan-400" />
                  Informations personnelles
                </h2>
                <button
                  onClick={() => toggleSection('personal')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedSections.personal ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {expandedSections.personal && (
                <Card className="glass-border bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                      Identité et coordonnées
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Nom complet</Label>
                      <Input 
                        value={profile.full_name || ''} 
                        onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                        placeholder="ex: Jean Dupont"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Pseudo</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/20 bg-white/5 text-gray-400">
                          @
                        </span>
                        <Input 
                          value={profile.username || ''} 
                          onChange={e => setProfile({ ...profile, username: e.target.value })}
                          className="rounded-l-none bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                          placeholder="votre-pseudo"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Email</Label>
                      <Input 
                        type="email"
                        value={profile.email || ''} 
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        placeholder="email@example.com"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Téléphone</Label>
                      <Input 
                        value={profile.phone || ''} 
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+243 999 123 456"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-300">Bio courte</Label>
                      <Textarea 
                        value={profile.bio_short || ''} 
                        onChange={e => setProfile({ ...profile, bio_short: e.target.value })}
                        placeholder="Décrivez-vous en quelques mots..."
                        rows={2}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 resize-none"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-300">Bio complète</Label>
                      <Textarea 
                        value={profile.bio_long || ''} 
                        onChange={e => setProfile({ ...profile, bio_long: e.target.value })}
                        placeholder="Parlez-nous de vous, vos passions, vos objectifs..."
                        rows={4}
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* 🔹 Section Identité professionnelle */}
            <section id="professional" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="text-emerald-400" />
                  Identité professionnelle
                </h2>
                <button
                  onClick={() => toggleSection('professional')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedSections.professional ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {expandedSections.professional && (
                <Card className="glass-border bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                      Votre carrière et compétences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Titre professionnel</Label>
                        <Input 
                          value={profile.job_title || ''} 
                          onChange={e => setProfile({ ...profile, job_title: e.target.value })}
                          placeholder="Développeur Full-Stack"
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Organisation</Label>
                        <Input 
                          value={profile.company || ''} 
                          onChange={e => setProfile({ ...profile, company: e.target.value })}
                          placeholder="LUVIKA"
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Statut professionnel</Label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {(['student', 'employed', 'freelance', 'open_to_work', 'other'] as const).map(status => (
                          <Button
                            key={status}
                            variant={profile.professional_status === status ? "default" : "outline"}
                            size="sm"
                            className={profile.professional_status === status 
                              ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                              : "border-white/20 text-gray-300 hover:bg-white/10"
                            }
                            onClick={() => setProfile({ ...profile, professional_status: status })}
                          >
                            {status === 'student' && '🎓 Étudiant'}
                            {status === 'employed' && '💼 En poste'}
                            {status === 'freelance' && '⚡ Freelance'}
                            {status === 'open_to_work' && '✨ Ouvert'}
                            {status === 'other' && 'Autre'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Compétences (max 10)</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={profile.skills?.join(', ') || ''} 
                          onChange={e => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                          placeholder="React, Node.js, TypeScript, Firebase..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                        />
                      </div>
                      {profile.skills && profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profile.skills.map((skill, i) => (
                            <Badge 
                              key={i} 
                              variant="secondary" 
                              className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* 🔹 Section Réseaux sociaux */}
            <section id="social" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Instagram className="text-pink-400" />
                  Réseaux sociaux
                </h2>
                <button
                  onClick={() => toggleSection('social')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedSections.social ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {expandedSections.social && (
                <Card className="glass-border bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                      Vos liens sociaux
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'instagram', label: 'Instagram', icon: Instagram, prefix: '@', color: 'text-pink-400' },
                      { key: 'tiktok', label: 'TikTok', icon: SiTiktok, prefix: '@', color: 'text-black dark:text-white' },
                      { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400' },
                      { key: 'snapchat', label: 'Snapchat', icon: SnapchatIcon, prefix: '@', color: 'text-yellow-400' },
                      { key: 'telegram', label: 'Telegram', icon: TelegramIcon, prefix: '@', color: 'text-blue-400' },
                      { key: 'github', label: 'GitHub', icon: Github, color: 'text-gray-400' },
                      { key: 'gitlab', label: 'GitLab', icon: Gitlab, color: 'text-orange-400' },
                      { key: 'behance', label: 'Behance', icon: BehanceIcon, color: 'text-blue-400' },
                      { key: 'dribbble', label: 'Dribbble', icon: DribbbleIcon, color: 'text-pink-400' },
                    ].map(({ key, label, icon: Icon, prefix = '', color }) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-gray-300 flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${color}`} />
                          {label}
                        </Label>
                        <div className="flex">
                          {prefix && (
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/20 bg-white/5 text-gray-400">
                              {prefix}
                            </span>
                          )}
                          <Input
                            value={profile[key as keyof Profile]?.toString().replace(new RegExp(`^${prefix}`), '') || ''}
                            onChange={e => setProfile({ ...profile, [key]: e.target.value ? `${prefix}${e.target.value}` : null })}
                            className={`${prefix ? "rounded-l-none" : ""} bg-white/5 border-white/20 text-white placeholder:text-gray-500`}
                            placeholder={`votre-${label.toLowerCase()}`}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </section>

            {/* 🔹 Section Localisation */}
            <section id="location" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="text-amber-400" />
                  Localisation
                </h2>
                <button
                  onClick={() => toggleSection('location')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedSections.location ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {expandedSections.location && (
                <Card className="glass-border bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                      Où vous trouver
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Ville</Label>
                      <Input 
                        value={profile.city || ''} 
                        onChange={e => setProfile({ ...profile, city: e.target.value })}
                        placeholder="Kinshasa"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Pays</Label>
                      <Input 
                        value={profile.country || ''} 
                        onChange={e => setProfile({ ...profile, country: e.target.value })}
                        placeholder="RDC"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Fuseau horaire</Label>
                      <Input 
                        value={profile.timezone || ''} 
                        onChange={e => setProfile({ ...profile, timezone: e.target.value })}
                        placeholder="GMT+1"
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3 pt-4 border-t border-white/10">
                      <Label className="text-gray-300">Disponibilité</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {(['available', 'unavailable', 'by_appointment'] as const).map(status => (
                          <Button
                            key={status}
                            variant={profile.availability === status ? "default" : "outline"}
                            size="sm"
                            className={profile.availability === status 
                              ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white"
                              : "border-white/20 text-gray-300 hover:bg-white/10"
                            }
                            onClick={() => setProfile({ ...profile, availability: status })}
                          >
                            {status === 'available' && '✅ Disponible'}
                            {status === 'unavailable' && '❌ Indisponible'}
                            {status === 'by_appointment' && '📅 Sur RDV'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* 🔹 Section Confidentialité */}
            <section id="privacy" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-purple-400" />
                  Confidentialité
                </h2>
                <button
                  onClick={() => toggleSection('privacy')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedSections.privacy ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {expandedSections.privacy && (
                <Card className="glass-border bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                      Paramètres de confidentialité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-1">Profil public</h3>
                          <p className="text-sm text-gray-300">
                            Rendez votre profil visible ou invisible aux visiteurs
                          </p>
                        </div>
                        <Switch
                          checked={profile.is_public === true}
                          onCheckedChange={checked => setProfile({ ...profile, is_public: checked })}
                          className="data-[state=checked]:bg-purple-500"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-cyan-900/20 border border-cyan-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Bell className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-1">Alertes de connexion</h3>
                          <p className="text-sm text-gray-300">
                            Recevez une notification à chaque nouvelle connexion sur un nouvel appareil
                          </p>
                        </div>
                        <Switch
                          checked={profile.enable_connection_alerts === true}
                          onCheckedChange={checked => setProfile({ ...profile, enable_connection_alerts: checked })}
                          className="data-[state=checked]:bg-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-amber-900/20 border border-amber-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-1">Demandes de contact</h3>
                          <p className="text-sm text-gray-300">
                            Autorisez les visiteurs à vous contacter via votre profil
                          </p>
                        </div>
                        <Switch
                          checked={profile.accepts_contact_requests === true}
                          onCheckedChange={checked => setProfile({ ...profile, accepts_contact_requests: checked })}
                          className="data-[state=checked]:bg-amber-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* 🔹 Section Gestion du compte */}
            <section id="account" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Lock className="text-red-400" />
                  Gestion du compte
                </h2>
                <button
                  onClick={() => toggleSection('account')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {expandedSections.account ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {expandedSections.account && (
                <Card className="glass-border bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">
                      Options de compte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 🔸 Désactiver le compte */}
                    <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-500/30">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <EyeOff className="w-5 h-5 text-amber-400" />
                            <Label className="text-gray-300 font-medium">
                              Désactiver temporairement mon compte
                            </Label>
                          </div>
                          <p className="text-sm text-gray-400 mb-4">
                            Rendez votre profil invisible sans perdre vos données. Vous pourrez le réactiver à tout moment.
                          </p>
                          <ul className="text-xs text-amber-300/90 space-y-1 ml-6 list-disc">
                            <li>Votre profil deviendra invisible aux visiteurs</li>
                            <li>Vos données resteront sauvegardées</li>
                            <li>Vous pourrez réactiver votre compte à tout moment</li>
                          </ul>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (confirm('⚠️ Êtes-vous sûr de vouloir désactiver votre compte ?\n\nVotre profil deviendra invisible mais vos données seront conservées.')) {
                              // TODO: Implémenter la désactivation
                              toast.info('Fonctionnalité à venir');
                            }
                          }}
                          className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                        >
                          <EyeOff className="w-4 h-4 mr-2" />
                          Désactiver le compte
                        </Button>
                      </div>
                    </div>

      {/* Quick Menu */}
      <DashboardQuickMenu 
        onAction={handleQuickAction} 
        actions={quickActions} 
      />
                    {/* 🔸 Supprimer le compte */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-500/30">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <Label className="text-gray-300 font-medium">
                              Supprimer définitivement mon compte
                            </Label>
                          </div>
                          <p className="text-sm text-gray-400 mb-4">
                            Supprimez toutes vos données de manière irréversible. Cette action ne peut pas être annulée.
                          </p>
                          <ul className="text-xs text-red-300/90 space-y-1 ml-6 list-disc">
                            <li>Suppression définitive de toutes vos données</li>
                            <li>Suppression de votre profil et historique</li>
                            <li>Annulation de tous les abonnements actifs</li>
                            <li>❌ Action irréversible</li>
                          </ul>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            const confirmText = prompt(
                              '⚠️ SUPPRESSION DÉFINITIVE\n\n' +
                              'Cette action supprimera TOUTES vos données de manière irréversible :\n' +
                              '- Votre profil et identité numérique\n' +
                              '- Vos cartes NFC et historique de scans\n' +
                              '- Vos événements et participants\n' +
                              '- Vos paramètres et préférences\n\n' +
                              'Tapez exactement "JE CONFIRME LA SUPPRESSION" pour continuer :'
                            );
                            
                            if (confirmText === 'JE CONFIRME LA SUPPRESSION') {
                              // TODO: Implémenter la suppression
                              toast.error('Fonctionnalité à venir - Contactez le support');
                            }
                          }}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Supprimer le compte
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        </div>
      </div>

  );
}
