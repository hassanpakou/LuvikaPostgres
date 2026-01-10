// src/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Save, Image as ImageIcon, ExternalLink, Eye, Mail, Phone,
  Smartphone, Globe, Instagram, MapPin, Brush, Palette, User, Settings,
  AlertTriangle, CheckCircle, X, RotateCcw, Cake, Tag, Link as LinkIcon,
  Briefcase, Github, Linkedin, Gitlab, FileText, Calendar, Plus, EyeOff
} from 'lucide-react';
import { SiTiktok } from "react-icons/si";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/src/lib/supabase/client';
import { supabase } from '@/lib/supabase';

// 🔹 Types (mis à jour — ton version finale)
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
};

// 🔹 Helpers
const isSectionLockedForFree = (section: string, plan: string): boolean => {
  const lockedSections = ['portfolio', 'certificates'];
  return lockedSections.includes(section) && plan === 'basic';
};

const getLockMessage = (section: string, t: any) => {
  switch (section) {
    case 'portfolio': return t('visibility.portfolio_locked');
    case 'certificates': return t('visibility.certificates_locked');
    default: return '';
  }
};

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');

  // 🔹 Fetch profil
  useEffect(() => {
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
        setMessage({ type: 'error', text: t('load_error') });
        return;
      }

      // 🔹 Valeurs par défaut pour les nouveaux champs
      const defaults = {
        hide_birth_year: false,
        disable_birthday_icon: false,
        verified: false,
        skills: [],
        ...data,
      };

      setProfile(defaults as Profile);
      setAvatarPreview(data.avatar_url);
      setCoverPreview(data.cover_url);
      setLoading(false);
    };

    fetchProfile();
  }, [router, t]);

  // 🔹 Complétion
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

  // 🔹 Upload avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: t('avatar_invalid') });
      return;
    }

    const supabase = createClient();
    const fileName = `avatars/${profile.id}/${Date.now()}_${file.name}`;
    setSaving(true);
    setMessage(null);

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarPreview(publicUrl);
      setProfile({ ...profile, avatar_url: publicUrl });
      setMessage({ type: 'success', text: t('avatar_uploaded') });
    } catch (err) {
      console.error('❌ Erreur upload avatar:', err);
      setMessage({ type: 'error', text: t('avatar_error') });
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Upload cover
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: t('cover_invalid') });
      return;
    }

    const supabase = createClient();
    const fileName = `covers/${profile.id}/${Date.now()}_${file.name}`;
    setSaving(true);
    setMessage(null);

    try {
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);

      setCoverPreview(publicUrl);
      setProfile({ ...profile, cover_url: publicUrl });
      setMessage({ type: 'success', text: t('cover_uploaded') });
    } catch (err) {
      console.error('❌ Erreur upload couverture:', err);
      setMessage({ type: 'error', text: t('cover_error') });
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Gestion compétences
  const addSkill = () => {
    if (!newSkill.trim() || !profile) return;
    const skill = newSkill.trim();
    const updated = [...(profile.skills || []), skill].slice(0, 10);
    setProfile({ ...profile, skills: updated });
    setNewSkill('');
  };

const removeSkill = (index: number) => {
  if (!profile) return;
  const current = profile.skills || []; // ✅ fallback à []
  const updated = current.filter((_, i) => i !== index);
  setProfile({ ...profile, skills: updated });
};

  // 🔹 Sauvegarde
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);
router.refresh(); // 👈 Force Next.js à recharger les données serveur/client

const { data: updatedProfile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', profile.id)
  .single();

if (updatedProfile) {
  setProfile(updatedProfile); // ✅ Rafraîchit le profil local immédiatement
}

setMessage({ type: 'success', text: t('save_success') });
    try {
      const supabase = createClient();
      const updates = {
        full_name: profile.full_name?.trim() || null,
        username: profile.username?.trim().toLowerCase() || null,
        avatar_url: avatarPreview,
        cover_url: coverPreview,
        bio_short: profile.bio_short,
        bio_long: profile.bio_long,
        job_title: profile.job_title,
        company: profile.company,
        email: profile.email,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        instagram: profile.instagram?.replace(/^@/, '') || null,
        // 🔹 ✅ Tous les nouveaux champs
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
        nickname: profile.nickname,
        pronouns: profile.pronouns,
        birth_day: profile.birth_day,
        birth_month: profile.birth_month,
        birth_year: profile.birth_year,
        city: profile.city,
        country: profile.country,
        timezone: profile.timezone,
        availability: profile.availability,
        skills: profile.skills,
        professional_status: profile.professional_status,
        website: profile.website,
        address: profile.address,
        theme: profile.theme,
        is_public: profile.is_public,
        sections_visibility: profile.sections_visibility,
        accepts_contact_requests: profile.accepts_contact_requests,
        hide_birth_year: profile.hide_birth_year,
        disable_birthday_icon: profile.disable_birthday_icon,
        verified: profile.verified,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select();

      if (error) throw error;

      setMessage({ type: 'success', text: t('save_success') });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('❌ Erreur sauvegarde:', err);
      setMessage({ type: 'error', text: err.message || t('save_error') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8 pb-24">
      {/* 🔹 En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Progress value={getCompletion()} className="w-32 h-2" />
              <span className="text-sm text-gray-400">{getCompletion()}%</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {profile.plan === 'premium' ? '⭐ Premium' : profile.plan === 'entreprise' ? '🏢 Entreprise' : '🆓 Basique'}
            </Badge>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-600 to-cyan-500">
          <Save className="w-4 h-4 mr-2" />
          {saving ? t('saving') : t('save')}
        </Button>
      </motion.div>

      {/* 🔹 Message feedback */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-300 border border-red-500/20'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{message.text}</span>
            <button
  type="button"
  onClick={() => setMessage(null)}
  className="ml-auto text-gray-400 hover:text-white"
  aria-label="Fermer le message"
  title="Fermer le message"
>
  <X className="w-4 h-4" />
</button>

          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Photo & Couverture */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="text-cyan-400" /> {t('photo.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 flex items-center justify-center text-xl font-bold text-white border-4 border-white/30 shadow-xl">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                ) : profile.full_name ? (
                  profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                ) : (
                  '?'
                )}
              </div>
              <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full" onClick={() => fileInputRef.current?.click()}>
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex-1">
              <Label className="text-gray-300">{t('photo.avatar')}</Label>
              <div className="mt-2 flex gap-2">
                <Input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                  <Upload className="w-4 h-4 mr-2" /> {t('photo.upload_avatar')}
                </Button>
                {profile.avatar_url && (
                  <Button variant="ghost" size="sm" onClick={() => { setAvatarPreview(null); setProfile({ ...profile, avatar_url: null }); }} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Couverture */}
          <div className="space-y-2">
            <Label className="text-gray-300">{t('photo.cover')}</Label>
            <div
              className="w-full h-32 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center bg-black/30 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-32 rounded-lg object-cover" />
              ) : (
                <span className="text-gray-400">{t('photo.upload_cover')}</span>
              )}
            </div>
            <Input type="file" ref={coverInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" />
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Identité personnelle */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="text-cyan-400" /> Identité personnelle
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Pseudo</Label>
            <Input value={profile.nickname || ''} onChange={e => setProfile({ ...profile, nickname: e.target.value })} placeholder="ex: N3st0r" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Pronoms</Label>
            <Input value={profile.pronouns || ''} onChange={e => setProfile({ ...profile, pronouns: e.target.value })} placeholder="il/elle, ils/elles..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-gray-300">Date de naissance</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-gray-400">Jour</Label>
                <Input type="number" min="1" max="31" value={profile.birth_day || ''} onChange={e => setProfile({ ...profile, birth_day: e.target.value ? parseInt(e.target.value) : null })} placeholder="JJ" className="text-center" />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Mois</Label>
                <Input type="number" min="1" max="12" value={profile.birth_month || ''} onChange={e => setProfile({ ...profile, birth_month: e.target.value ? parseInt(e.target.value) : null })} placeholder="MM" className="text-center" />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Année (optionnelle)</Label>
                <Input type="number" min="1900" max={new Date().getFullYear()} value={profile.birth_year || ''} onChange={e => setProfile({ ...profile, birth_year: e.target.value ? parseInt(e.target.value) : null })} placeholder="AAAA" className="text-center" />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Switch checked={profile.hide_birth_year || false} onCheckedChange={checked => setProfile({ ...profile, hide_birth_year: checked })} />
                  <Label className="text-xs text-gray-400">Masquer l'année</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-400" />
              <Label className="text-gray-300">Fonction anniversaire</Label>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={!profile.disable_birthday_icon} onCheckedChange={checked => setProfile({ ...profile, disable_birthday_icon: !checked })} />
                <span className="text-sm text-gray-400">Afficher 🎂 le jour J</span>
              </div>
              <Badge variant="secondary" className="bg-pink-500/10 text-pink-300 border-pink-500/20">Optionnel</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Infos personnelles */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="text-cyan-400" /> {t('personal.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">{t('personal.full_name')}</Label>
            <Input value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} placeholder={t('personal.full_name_placeholder')} />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t('personal.username')}</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/10 bg-white/5 text-gray-400">@</span>
              <Input value={profile.username || ''} onChange={e => setProfile({ ...profile, username: e.target.value })} className="rounded-l-none" placeholder={t('personal.username_placeholder')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t('personal.job_title')}</Label>
            <Input value={profile.job_title || ''} onChange={e => setProfile({ ...profile, job_title: e.target.value })} placeholder={t('personal.job_title_placeholder')} />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t('personal.company')}</Label>
            <Input value={profile.company || ''} onChange={e => setProfile({ ...profile, company: e.target.value })} placeholder={t('personal.company_placeholder')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-gray-300">{t('personal.bio_short')}</Label>
            <Textarea value={profile.bio_short || ''} onChange={e => setProfile({ ...profile, bio_short: e.target.value })} placeholder={t('personal.bio_short_placeholder')} rows={2} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-gray-300">{t('personal.bio_long')}</Label>
            <Textarea value={profile.bio_long || ''} onChange={e => setProfile({ ...profile, bio_long: e.target.value })} placeholder={t('personal.bio_long_placeholder')} rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Identité professionnelle */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="text-emerald-400" /> Identité professionnelle
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Titre professionnel</Label>
            <Input value={profile.job_title || ''} onChange={e => setProfile({ ...profile, job_title: e.target.value })} placeholder="Développeur Full-Stack" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Organisation</Label>
            <Input value={profile.company || ''} onChange={e => setProfile({ ...profile, company: e.target.value })} placeholder="LUVIKA" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-gray-300">Statut</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(['student', 'employed', 'freelance', 'open_to_work', 'other'] as const).map(status => (
                <Button
                  key={status}
                  variant={profile.professional_status === status ? "default" : "outline"}
                  size="sm"
                  className={profile.professional_status === status ? "bg-cyan-600 hover:bg-cyan-500" : ""}
                  onClick={() => setProfile({ ...profile, professional_status: status })}
                >
                  {status === 'student' && 'Étudiant'}
                  {status === 'employed' && 'En poste'}
                  {status === 'freelance' && 'Freelance'}
                  {status === 'open_to_work' && 'Ouvert'}
                  {status === 'other' && 'Autre'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Compétences */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="text-purple-400" /> Compétences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-gray-300">Ajouter des compétences (5-10 max)</Label>
            <div className="flex gap-2">
              <Input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="ex: React, Firebase..." onKeyDown={e => e.key === 'Enter' && addSkill()} className="flex-1" />
              <Button size="sm" onClick={addSkill} disabled={!newSkill.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {profile.skills && profile.skills.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-3">
    {profile.skills.map((skill, i) => (
      <Badge key={i} variant="secondary" className="bg-purple-500/20 text-purple-300">
        {skill}
        <button
          onClick={() => removeSkill(i)}
          className="ml-1 hover:text-white"
          aria-label="Supprimer cette compétence"
          title="Supprimer cette compétence"
        >
          <X className="w-3 h-3" />
        </button>
      </Badge>
    ))}
  </div>
)}        </div>
        </CardContent>
      </Card>

      {/* 🔹 Réseaux sociaux étendus */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="text-pink-400" /> Réseaux sociaux
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'instagram', label: 'Instagram', icon: Instagram, prefix: '@' },
            { key: 'tiktok', label: 'TikTok', icon: SiTiktok , prefix: '@' },
            { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
            { key: 'snapchat', label: 'Snapchat', icon: SnapchatIcon, prefix: '@' },
            { key: 'telegram', label: 'Telegram', icon: TelegramIcon, prefix: '@' },
            { key: 'github', label: 'GitHub', icon: Github },
            { key: 'gitlab', label: 'GitLab', icon: Gitlab },
            { key: 'behance', label: 'Behance', icon: BehanceIcon },
            { key: 'dribbble', label: 'Dribbble', icon: DribbbleIcon },
          ].map(({ key, label, icon: Icon, prefix = '' }) => (
            <div key={key} className="space-y-1">
              <Label className="text-gray-300 flex items-center gap-1">
                <Icon className="w-4 h-4 text-gray-400" />
                {label}
              </Label>
              <div className="flex">
                {prefix && <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-white/10 bg-white/5 text-gray-400">{prefix}</span>}
                <Input
                  value={profile[key as keyof Profile]?.toString().replace(new RegExp(`^${prefix}`), '') || ''}
                  onChange={e => setProfile({ ...profile, [key]: e.target.value ? `${prefix}${e.target.value}` : null })}
                  className={prefix ? "rounded-l-none" : ""}
                  placeholder={`Votre ${label.toLowerCase()}`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 🔹 Liens professionnels */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="text-blue-400" /> Liens professionnels
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'portfolio_url', label: 'Portfolio', icon: FolderIcon, placeholder: 'https://...' },
            { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/...' },
            { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/...' },
            { key: 'calendly', label: 'Calendly', icon: Calendar, placeholder: 'https://calendly.com/...' },
            { key: 'cv_url', label: 'CV PDF', icon: FileText, placeholder: 'URL de votre CV' },
          ].map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="space-y-1">
              <Label className="text-gray-300 flex items-center gap-1">
                <Icon className="w-4 h-4 text-blue-400" />
                {label}
              </Label>
              <Input
                value={profile[key as keyof Profile]?.toString() || ''}
                onChange={e => setProfile({ ...profile, [key]: e.target.value || null })}
                placeholder={placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 🔹 Localisation & disponibilité */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="text-amber-400" /> Localisation
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Ville</Label>
            <Input value={profile.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })} placeholder="Kinshasa" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Pays</Label>
            <Input value={profile.country || ''} onChange={e => setProfile({ ...profile, country: e.target.value })} placeholder="RDC" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Fuseau horaire</Label>
            <Input value={profile.timezone || ''} onChange={e => setProfile({ ...profile, timezone: e.target.value })} placeholder="GMT+1" />
          </div>
          <div className="space-y-2 md:col-span-3 pt-2 border-t border-white/10">
            <Label className="text-gray-300">Disponibilité</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {(['available', 'unavailable', 'by_appointment'] as const).map(status => (
                <Button
                  key={status}
                  variant={profile.availability === status ? "default" : "outline"}
                  size="sm"
                  className={profile.availability === status ? "bg-emerald-600 hover:bg-emerald-500" : ""}
                  onClick={() => setProfile({ ...profile, availability: status })}
                >
                  {status === 'available' && 'Disponible'}
                  {status === 'unavailable' && 'Indisponible'}
                  {status === 'by_appointment' && 'Sur RDV'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Contacts */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="text-cyan-400" /> {t('contact.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-1"><Mail className="w-4 h-4" /> {t('contact.email')}</Label>
            <Input type="email" value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder={t('contact.email_placeholder')} />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-1"><Phone className="w-4 h-4" /> {t('contact.phone')}</Label>
            <Input value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder={t('contact.phone_placeholder')} />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-1"><Smartphone className="w-4 h-4" /> WhatsApp</Label>
            <Input value={profile.whatsapp || ''} onChange={e => setProfile({ ...profile, whatsapp: e.target.value })} placeholder="ex: +243999123456" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-1"><Globe className="w-4 h-4" /> {t('contact.website')}</Label>
            <Input value={profile.website || ''} onChange={e => setProfile({ ...profile, website: e.target.value })} placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-1"><MapPin className="w-4 h-4" /> {t('contact.address')}</Label>
            <Textarea value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder={t('contact.address_placeholder')} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Visibilité */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="text-cyan-400" /> {t('visibility.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-400 text-sm">{t('visibility.description')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(['bio', 'contact', 'social', 'portfolio', 'certificates', 'identity', 'professional', 'skills', 'links', 'location'] as const).map(section => {
              const isLocked = isSectionLockedForFree(section, profile.plan);
              const isVisible = profile.sections_visibility?.[section] !== false;
              return (
                <div key={section} className={`flex items-center justify-between p-3 rounded-lg ${isLocked ? 'bg-gray-800/50 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'} transition-colors`}>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 capitalize">{section}</span>
                    {isLocked && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs px-2 py-0.5">🔒 Premium</Badge>}
                  </div>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={checked => setProfile({ ...profile, sections_visibility: { ...profile.sections_visibility, [section]: checked } })}
                    disabled={isLocked}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Options avancées */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="text-cyan-400" /> {t('advanced.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">{t('advanced.public_profile')}</Label>
              <p className="text-xs text-gray-400">{t('advanced.public_profile_desc')}</p>
            </div>
            <Switch checked={profile.is_public} onCheckedChange={checked => setProfile({ ...profile, is_public: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">{t('advanced.contact_requests')}</Label>
              <p className="text-xs text-gray-400">{t('advanced.contact_requests_desc')}</p>
            </div>
            <Switch checked={profile.accepts_contact_requests} onCheckedChange={checked => setProfile({ ...profile, accepts_contact_requests: checked })} />
          </div>
          <div>
            <Label className="text-gray-300">{t('advanced.profile_url')}</Label>
            <div className="flex mt-1">
              <Input value={`https://luvika.me/${profile.username}`} readOnly className="rounded-r-none bg-white/5 border-r-0" />
              <Button variant="outline" size="icon" className="rounded-l-none border-l-0" onClick={() => {
                navigator.clipboard.writeText(`https://luvika.me/${profile.username}`);
                setMessage({ type: 'success', text: t('url_copied') });
              }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 🔐 Confidentialité */}
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="text-red-400" /> Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Masquer l'année de naissance</Label>
              <p className="text-xs text-gray-400">Affiche seulement jour/mois</p>
            </div>
            <Switch checked={profile.hide_birth_year || false} onCheckedChange={checked => setProfile({ ...profile, hide_birth_year: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Désactiver l'icône anniversaire</Label>
              <p className="text-xs text-gray-400">Masque 🎂 le jour de l'anniversaire</p>
            </div>
            <Switch checked={profile.disable_birthday_icon || false} onCheckedChange={checked => setProfile({ ...profile, disable_birthday_icon: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Badge de vérification</Label>
              <p className="text-xs text-gray-400">Affiche à côté de votre nom<img 
      src="/badge.png" 
      alt="✅ Vérifié" 
      className="w-4 h-4 rounded-full"
      title="Profil vérifié"
    /></p>
            </div>
            <Switch
              checked={profile.verified || false}
              onCheckedChange={checked => profile.plan === 'entreprise' && setProfile({ ...profile, verified: checked })}
              disabled={profile.plan !== 'entreprise'}
            />
            {profile.plan !== 'entreprise' && <Badge variant="secondary" className="ml-2 bg-yellow-500/10 text-yellow-400">Entreprise</Badge>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 🔹 Icônes manquantes
const Copy = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12v-4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6m4-10h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
  </svg>
);

const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M21.927 9.208l-.863-.527A5.486 5.486 0 0 0 12 7a5.486 5.486 0 0 0-9.064 1.681l-.863.527a1 1 0 0 0-.066 1.72l.902.55a3.489 3.489 0 0 1 0 5.643l-.902.55a1 1 0 0 0 .066 1.72l.863.527A5.486 5.486 0 0 0 12 23a5.486 5.486 0 0 0 9.064-1.681l.863-.527a1 1 0 0 0 .066-1.72l-.902-.55a3.489 3.489 0 0 1 0-5.643l.902-.55a1 1 0 0 0-.066-1.72z"/></svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2zm4.333 13.5l-1.45 4.35c-.15.45-.6.6-1 .45L12 19l-6.5 3.5c-.4.2-.8-.1-.6-.5l1.5-6.5L3.5 12c-.2-.4 0-.8.4-.8l17-7c.4-.2.8.1.6.5l-2.5 12.5c-.1.5-.5.8-.9.6l-2.767-1.167z"/></svg>
);

const BehanceIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M0 0v24h24V0H0zm8.4 18.4H4.8V5.6h3.6c1.6 0 2.8.4 3.6 1.2s1.2 2 1.2 3.6s-.4 2.8-1.2 3.6s-2 1.2-3.6 1.2zm-1.2-1.6h2c1.2 0 2-.4 2.4-1.2s.6-2 .6-3.6s-.2-2.8-.6-3.6s-1.2-1.2-2.4-1.2H7.2v9.6zm5.6-10.4v1.6h-3.2v3.2h2.8v1.6h-2.8v3.2h3.2v1.6h-4.8V5.6h4.8v1.6z"/></svg>
);

const DribbbleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m-1.1 17.2c-4.8 0-7.1-4.7-7.4-8.2c.3-3.5 2.7-8.2 7.4-8.2c1.1 0 2.1.2 3.1.7c.9-.5 2-.8 3.2-.8c4.6 0 7 4.7 7.3 8.3c-.3 3.6-2.7 8.2-7.3 8.2c-1.1 0-2.2-.3-3.2-.7c-.9.5-1.9.7-2.9.7m-.7-13.3c-3.6 0-5.4 4-5.6 7c.2 3 2 7 5.6 7c3.7 0 5.5-4 5.7-7c-.2-3.1-2-7.1-5.7-7m-4.2 5.5c.2.2.2.5.1.7c-.1.2-.3.3-.6.2c-2.2-.9-3.8-3.2-3.9-3.4c-.1-.2-.1-.4.1-.6c.2-.2.5-.2.7-.1c.1.1 1.7 2.2 3.7 3.2m10.2 0c1.9-1 3.4-3 3.6-3.2c.2-.2.4-.2.6-.1c.2.2.2.4.1.6c-.2.2-1.8 2.6-4 3.5c-.2.1-.5 0-.7-.2c-.2-.2-.1-.5.1-.8m-9.7-3.7c.2.2.2.5.1.7c-.1.2-.3.3-.6.2c-1.3-.5-2.2-2.2-2.3-3.4c.2-2.5 2.1-4.1 2.8-4.6c.2-.1.4-.1.6.1c.2.2.2.4.1.6c-.3.5-1.7 2-1.9 4.4m9.2 0c.1-.6.2-1.1.2-1.8c-.1-2.1-1.1-3.5-1.8-4.1c-.2-.1-.2-.4-.1-.6c.2-.2.4-.2.6-.1c.7.5 2.3 2 2.5 4.3c0 .7.1 1.2.2 1.8c0 .2.1.4-.1.5c-.1.1-.3.1-.4-.1c-.2-.2-.3-.3-.5-.5c-.2-.3-.6-.4-.9-.2c-.3.2-.4.6-.2.9c.3.6 1.2 2.4 2.5 3.4c.2.1.2.4.1.6c-.2.2-.4.2-.6.1c-1.4-1-2.3-2.8-2.5-3.4c-.2-.3-.2-.7.1-.9c.2-.2.6-.4.9-.2c.3.2.4.6.2.9c-.2.3-.2.3-.3.5c-.1.1-.3.2-.5.1c-.2-.1-.3-.4-.1-.7m-4.8 1.8c.9-.1 2.8-1.1 3.9-2.7c.2-.2.5-.2.7-.1c.2.2.2.5.1.7c-.8 1.6-2.6 2.7-4.1 2.9c-.3 0-.5-.2-.5-.4c-.1-.1 0-.2.1-.4z"/></svg>
);

const FolderIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
  </svg>
);