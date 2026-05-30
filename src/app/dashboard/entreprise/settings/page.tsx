// src/app/dashboard/entreprise/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Input } from '../../../../../components/ui/input';
import { Textarea } from '../../../../../components/ui/textarea';
import { Label } from '../../../../../components/ui/label';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { 
  Settings, MapPin, Globe, LinkIcon, Building2, Mail, Phone, FileText, 
  ArrowLeft, Clock, Save, Upload, ImageIcon, Store, Truck, Hotel, Pill, 
  Scissors, Briefcase, ShoppingCart, Cpu, GraduationCap, Stethoscope, HeartPulse,
  Home, Dumbbell, Wine, Croissant, Book, Fuel, Wrench, Bus, Plane,
  Monitor, Camera, HardHat, Wheat, HandHeart, Landmark, MoreHorizontal
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant', shop: 'Boutique / Magasin', delivery: 'Livraison',
  hotel: 'Hôtel', pharmacy: 'Pharmacie', beauty: 'Salon de beauté',
  agency: 'Agence de services', supermarket: 'Supermarché', tech: 'Entreprise tech',
  school: 'Établissement scolaire', medical: 'Cabinet médical', clinic: 'Clinique / Hôpital',
  realestate: 'Agence immobilière', gym: 'Salle de sport', bar: 'Bar / Lounge',
  bakery: 'Boulangerie', library: 'Librairie', gasstation: 'Station-service',
  repair: 'Atelier de réparation', transport: 'Transport', travel: 'Agence de voyage',
  cybercafe: 'Cybercafé', photography: 'Studio photo', construction: 'Construction',
  farm: 'Ferme / Agricole', ngo: 'ONG / Organisation', bank: 'Banque / Microfinance',
  other: 'Autre',
};

export default function SettingsPage() {
  const t = useTranslations('enterprise.modules.settings');
  const [company, setCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', country: '',
    website: '', description: '', logo_url: '', opening_hours: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('companies').select('*').eq('owner_id', user.id).single();
      if (data) {
        setCompany(data);
        setFormData({
          name: data.name || '', email: data.email || '', phone: data.phone || '',
          address: data.address || '', city: data.city || '', country: data.country || '',
          website: data.website || '', description: data.description || '',
          logo_url: data.logo_url || '', opening_hours: data.opening_hours || '',
        });
        setPhotoPreview(data.logo_url || null);
      }
      setLoading(false);
    };
    fetchCompany();
  }, []);

  const uploadLogo = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `logos/${company.id}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('org-photos').upload(fileName, file, { upsert: true });
    if (error) { console.error('❌ Upload logo:', error); return null; }
    const { data: urlData } = supabase.storage.from('org-photos').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let logoUrl = formData.logo_url;
      if (photoFile) {
        const uploaded = await uploadLogo(photoFile);
        if (uploaded) logoUrl = uploaded;
      }

      const { error } = await supabase.from('companies').update({
        name: formData.name.trim(), email: formData.email.trim(),
        phone: formData.phone.trim(), address: formData.address.trim(),
        city: formData.city.trim(), country: formData.country.trim(),
        website: formData.website.trim(), description: formData.description.trim(),
        logo_url: logoUrl, opening_hours: formData.opening_hours.trim(),
        updated_at: new Date().toISOString(),
      }).eq('id', company.id);

      if (error) throw error;
      toast.success(t('save_success'));
      setPhotoFile(null);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      toast.error(t('save_error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-gray-400 flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        {t('loading')}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-24 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.push('/dashboard/entreprise')} className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      </div>

      {/* Type d'entreprise */}
      {company?.company_type && (
        <Card className="glass-border bg-white/5 border-white/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Catégorie</p>
              <p className="text-white font-semibold">{TYPE_LABELS[company.company_type] || company.company_type}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/entreprise/setup/${company.company_type}`)} className="border-white/20 text-gray-300 text-xs">
              Configurer
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            {t('company_info')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-dashed border-gray-500 hover:border-cyan-400 cursor-pointer group bg-gray-800" onClick={() => document.getElementById('logo-input')?.click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-cyan-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </div>
              <input id="logo-input" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
              <div>
                <Label>{t('logo_url') || 'Logo'}</Label>
                <p className="text-xs text-gray-500">JPEG ou PNG, max 2 Mo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2"><Building2 className="w-4 h-4" />{t('name')}</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <Label className="flex items-center gap-2"><Mail className="w-4 h-4" />{t('email')}</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <Label className="flex items-center gap-2"><Phone className="w-4 h-4" />{t('phone')}</Label>
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <Label className="flex items-center gap-2"><Clock className="w-4 h-4" />Horaires d'ouverture</Label>
                <Input value={formData.opening_hours} onChange={e => setFormData({...formData, opening_hours: e.target.value})} placeholder="Lun-Ven 8h-18h" />
              </div>
              <div className="md:col-span-2">
                <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" />{t('address')}</Label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div>
                <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" />{t('city')}</Label>
                <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div>
                <Label className="flex items-center gap-2"><Globe className="w-4 h-4" />{t('country')}</Label>
                <Input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
              </div>
              <div>
                <Label className="flex items-center gap-2"><LinkIcon className="w-4 h-4" />{t('website')}</Label>
                <Input type="url" placeholder="https://exemple.com" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <Label className="flex items-center gap-2"><FileText className="w-4 h-4" />{t('description')}</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600">
              <Save className="w-4 h-4 mr-2" />
              {saving ? t('saving') : t('save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}