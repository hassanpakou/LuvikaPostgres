// src/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Save, Image as ImageIcon, ExternalLink, Eye, Mail, Phone,
  Smartphone, Globe, Instagram, MapPin, Brush, Palette, User, Settings,
  AlertTriangle, CheckCircle, X, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/src/lib/supabase/client';

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
  website: string | null;
  address: string | null;
  theme: { primary: string; background: string };
  is_public: boolean;
  sections_visibility: Record<string, boolean>;
  plan: string;
  accepts_contact_requests: boolean;
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

  // 🔹 Récupère le profil
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

      setProfile(data);
      setAvatarPreview(data.avatar_url);
      setCoverPreview(data.cover_url);
      setLoading(false);
    };

    fetchProfile();
  }, [router, t]);

  // 🔹 Calcule la complétion
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
    ];
    const filled = fields.filter(f => f && f.toString().trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  };

  // 🔹 Gestion upload avatar
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

  // 🔹 Gestion upload cover
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

  // 🔹 Sauvegarde
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);

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
        instagram: profile.instagram?.replace(/^@/, ''),
        website: profile.website,
        address: profile.address,
        theme: profile.theme,
        is_public: profile.is_public,
        sections_visibility: profile.sections_visibility,
        accepts_contact_requests: profile.accepts_contact_requests,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select();

      if (error) throw error;

      setMessage({ type: 'success', text: t('save_success') });
      // Auto-hide après 3s
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
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Section Photo & Couverture */}
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
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : profile.full_name ? (
                  profile.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                ) : (
                  '?'
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 w-8 h-8 p-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex-1">
              <Label className="text-gray-300">{t('photo.avatar')}</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('photo.upload_avatar')}
                </Button>
                {profile.avatar_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAvatarPreview(null);
                      setProfile({ ...profile, avatar_url: null });
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
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
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-full h-32 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-gray-400">{t('photo.upload_cover')}</span>
              )}
            </div>
            <Input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverUpload}
              accept="image/*"
              className="hidden"
            />
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
            <Input
              value={profile.full_name || ''}
              onChange={e => setProfile({ ...profile, full_name: e.target.value })}
              placeholder={t('personal.full_name_placeholder')}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t('personal.username')}</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/10 bg-white/5 text-gray-400">
                @
              </span>
              <Input
                value={profile.username || ''}
                onChange={e => setProfile({ ...profile, username: e.target.value })}
                className="rounded-l-none"
                placeholder={t('personal.username_placeholder')}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t('personal.job_title')}</Label>
            <Input
              value={profile.job_title || ''}
              onChange={e => setProfile({ ...profile, job_title: e.target.value })}
              placeholder={t('personal.job_title_placeholder')}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{t('personal.company')}</Label>
            <Input
              value={profile.company || ''}
              onChange={e => setProfile({ ...profile, company: e.target.value })}
              placeholder={t('personal.company_placeholder')}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-gray-300">{t('personal.bio_short')}</Label>
            <Textarea
              value={profile.bio_short || ''}
              onChange={e => setProfile({ ...profile, bio_short: e.target.value })}
              placeholder={t('personal.bio_short_placeholder')}
              rows={2}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-gray-300">{t('personal.bio_long')}</Label>
            <Textarea
              value={profile.bio_long || ''}
              onChange={e => setProfile({ ...profile, bio_long: e.target.value })}
              placeholder={t('personal.bio_long_placeholder')}
              rows={4}
            />
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
            <Label className="text-gray-300 flex items-center gap-1">
              <Mail className="w-4 h-4" /> {t('contact.email')}
            </Label>
            <Input
              type="email"
              value={profile.email || ''}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              placeholder={t('contact.email_placeholder')}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-1">
              <Phone className="w-4 h-4" /> {t('contact.phone')}
            </Label>
            <Input
              value={profile.phone || ''}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              placeholder={t('contact.phone_placeholder')}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-1">
              <Smartphone className="w-4 h-4" /> WhatsApp
            </Label>
            <Input
              value={profile.whatsapp || ''}
              onChange={e => setProfile({ ...profile, whatsapp: e.target.value })}
              placeholder="ex: +243999123456"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-1">
              <Instagram className="w-4 h-4" /> Instagram
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-white/10 bg-white/5 text-gray-400">
                @
              </span>
              <Input
                value={profile.instagram?.replace(/^@/, '') || ''}
                onChange={e => setProfile({ ...profile, instagram: e.target.value })}
                className="rounded-l-none"
                placeholder="votre_nom"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-1">
              <Globe className="w-4 h-4" /> {t('contact.website')}
            </Label>
            <Input
              value={profile.website || ''}
              onChange={e => setProfile({ ...profile, website: e.target.value })}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {t('contact.address')}
            </Label>
            <Textarea
              value={profile.address || ''}
              onChange={e => setProfile({ ...profile, address: e.target.value })}
              placeholder={t('contact.address_placeholder')}
              rows={2}
            />
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
            {(['bio', 'contact', 'social', 'portfolio', 'certificates'] as const).map(section => (
              <div key={section} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-gray-300 capitalize">{section}</span>
                <Switch
                  checked={profile.sections_visibility?.[section] !== false}
                  onCheckedChange={checked =>
                    setProfile({
                      ...profile,
                      sections_visibility: {
                        ...profile.sections_visibility,
                        [section]: checked,
                      },
                    })
                  }
                />
              </div>
            ))}
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
            <Switch
              checked={profile.is_public}
              onCheckedChange={checked => setProfile({ ...profile, is_public: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">{t('advanced.contact_requests')}</Label>
              <p className="text-xs text-gray-400">{t('advanced.contact_requests_desc')}</p>
            </div>
            <Switch
              checked={profile.accepts_contact_requests}
              onCheckedChange={checked => setProfile({ ...profile, accepts_contact_requests: checked })}
            />
          </div>

          <div>
            <Label className="text-gray-300">{t('advanced.profile_url')}</Label>
            <div className="flex mt-1">
              <Input
                value={`https://luvika.me/${profile.username}`}
                readOnly
                className="rounded-r-none bg-white/5 border-r-0"
              />
              <Button
                variant="outline"
                size="icon"
                className="rounded-l-none border-l-0"
                onClick={() => {
                  navigator.clipboard.writeText(`https://luvika.me/${profile.username}`);
                  setMessage({ type: 'success', text: t('url_copied') });
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
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