// src/app/dashboard/entreprise/setup/[type]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Building, Store, Truck, Hotel, Pill, Scissors,
  Briefcase, ShoppingCart, Cpu, GraduationCap, Stethoscope, HeartPulse,
  Home, Dumbbell, Wine, Croissant, Book, Fuel, Wrench, Bus, Plane,
  Monitor, Camera, HardHat, Wheat, HandHeart, Landmark, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { createClient } from '@/src/lib/supabase/client';
import { toast } from 'sonner';

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; fields: { name: string; label: string; type: string; placeholder?: string }[] }> = {
  restaurant: {
    label: 'Restaurant',
    icon: <Building className="w-10 h-10 text-white" />,
    color: 'from-orange-500 to-red-500',
    fields: [
      { name: 'cuisine_type', label: 'Type de cuisine', type: 'text', placeholder: 'Italienne, Congolaise, Mixte...' },
      { name: 'delivery_available', label: 'Livraison disponible', type: 'text', placeholder: 'Oui / Non' },
      { name: 'avg_prep_time', label: 'Temps moyen de préparation', type: 'text', placeholder: '30 min' },
      { name: 'tables_count', label: 'Nombre de tables', type: 'number', placeholder: '20' },
      { name: 'reservation_available', label: 'Réservation possible', type: 'text', placeholder: 'Oui / Non' },
    ],
  },
  shop: {
    label: 'Boutique / Magasin',
    icon: <Store className="w-10 h-10 text-white" />,
    color: 'from-blue-500 to-cyan-500',
    fields: [
      { name: 'product_categories', label: 'Catégories de produits', type: 'text', placeholder: 'Vêtements, Électronique...' },
      { name: 'delivery_available', label: 'Livraison disponible', type: 'text', placeholder: 'Oui / Non' },
    ],
  },
  hotel: {
    label: 'Hôtel',
    icon: <Hotel className="w-10 h-10 text-white" />,
    color: 'from-purple-500 to-indigo-500',
    fields: [
      { name: 'rooms_count', label: 'Nombre de chambres', type: 'number', placeholder: '50' },
      { name: 'room_types', label: 'Types de chambres', type: 'text', placeholder: 'Simple, Double, Suite...' },
      { name: 'online_booking', label: 'Réservation en ligne', type: 'text', placeholder: 'Oui / Non' },
    ],
  },
  pharmacy: {
    label: 'Pharmacie',
    icon: <Pill className="w-10 h-10 text-white" />,
    color: 'from-red-500 to-rose-500',
    fields: [
      { name: 'delivery_available', label: 'Livraison de médicaments', type: 'text', placeholder: 'Oui / Non' },
      { name: 'prescription_required', label: 'Ordonnance obligatoire', type: 'text', placeholder: 'Oui / Non' },
      { name: 'guard_hours', label: 'Horaires de garde', type: 'text', placeholder: 'Lun-Sam 20h-8h' },
    ],
  },
  beauty: {
    label: 'Salon de beauté',
    icon: <Scissors className="w-10 h-10 text-white" />,
    color: 'from-pink-500 to-rose-500',
    fields: [
      { name: 'services_offered', label: 'Services proposés', type: 'text', placeholder: 'Coiffure, Manucure, Maquillage...' },
      { name: 'appointment_available', label: 'Rendez-vous en ligne', type: 'text', placeholder: 'Oui / Non' },
    ],
  },
  school: {
    label: 'Établissement scolaire',
    icon: <GraduationCap className="w-10 h-10 text-white" />,
    color: 'from-yellow-500 to-amber-500',
    fields: [
      { name: 'education_levels', label: 'Niveaux d\'études', type: 'text', placeholder: 'Maternelle, Primaire, Secondaire...' },
      { name: 'programs', label: 'Filières disponibles', type: 'text', placeholder: 'Scientifique, Littéraire...' },
    ],
  },
  tech: {
    label: 'Entreprise technologique',
    icon: <Cpu className="w-10 h-10 text-white" />,
    color: 'from-cyan-500 to-blue-500',
    fields: [
      { name: 'services', label: 'Services numériques', type: 'text', placeholder: 'Développement web, Mobile, IA...' },
      { name: 'technologies', label: 'Technologies utilisées', type: 'text', placeholder: 'React, Node.js, Python...' },
    ],
  },
};

export default function SetupCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as string;
  const supabase = createClient();

  const config = TYPE_CONFIG[type] || {
    label: 'Autre',
    icon: <MoreHorizontal className="w-10 h-10 text-white" />,
    color: 'from-gray-400 to-gray-500',
    fields: [
      { name: 'activity', label: 'Activité principale', type: 'text', placeholder: 'Décrivez votre activité...' },
      { name: 'services', label: 'Services proposés', type: 'text', placeholder: 'Vos services...' },
    ],
  };

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/sign-in'); return; }

      const { data: company } = await supabase.from('companies').select('*').eq('owner_id', user.id).single();
      if (!company) { router.push('/dashboard/entreprise'); return; }

      setCompanyId(company.id);

      const existing: Record<string, string> = {};
      // Champs spécifiques depuis company_config (JSONB)
      const savedConfig = company.company_config || {};
      config.fields.forEach(f => {
        existing[f.name] = savedConfig[f.name] || '';
      });
      // Champs communs
      ['phone', 'email', 'website', 'address', 'description', 'opening_hours'].forEach(f => {
        existing[f] = company[f] || '';
      });
      setFormData(existing);
    };
    init();
  }, [type]);

  const handleSave = async () => {
    setSaving(true);

    const updateData: Record<string, any> = {
      company_type: type,
      updated_at: new Date().toISOString(),
      phone: formData.phone || null,
      email: formData.email || null,
      website: formData.website || null,
      address: formData.address || null,
      description: formData.description || null,
      opening_hours: formData.opening_hours || null,
    };

    // Champs spécifiques → JSONB
    const specificFields: Record<string, string> = {};
    config.fields.forEach(f => {
      if (formData[f.name]) specificFields[f.name] = formData[f.name];
    });
    updateData.company_config = specificFields;

    const { error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId);

    if (error) {
      toast.error('Erreur lors de l\'enregistrement');
      console.error('Erreur Supabase:', error.message, error.details, error.hint);
    } else {
      toast.success('✅ Configuration enregistrée !');
      router.push('/dashboard/entreprise');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <Button variant="outline" onClick={() => router.push('/dashboard/entreprise')} className="mb-6 border-white/20 text-gray-300">
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
          {config.icon}
        </div>
        <h1 className="text-3xl font-bold text-white">Configurer — {config.label}</h1>
        <p className="text-gray-400 mt-2">Complétez les informations spécifiques à votre activité</p>
      </motion.div>

      <Card className="glass-border bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-white">Informations générales</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'phone', label: 'Téléphone' },
            { name: 'email', label: 'Email' },
            { name: 'website', label: 'Site web' },
            { name: 'address', label: 'Adresse', col: true },
            { name: 'description', label: 'Description', col: true },
            { name: 'opening_hours', label: 'Horaires d\'ouverture' },
          ].map(f => (
            <div key={f.name} className={f.col ? 'md:col-span-2' : ''}>
              <Label className="text-gray-300">{f.label}</Label>
              {f.name === 'description' || f.name === 'address' ? (
                <Textarea value={formData[f.name] || ''} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })} className="bg-white/5 border-white/20 text-white mt-1" rows={3} />
              ) : (
                <Input value={formData[f.name] || ''} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })} className="bg-white/5 border-white/20 text-white mt-1" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-border bg-white/5 border-white/10 mt-6">
        <CardHeader><CardTitle className="text-white">Spécificités — {config.label}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.fields.map(field => (
            <div key={field.name}>
              <Label className="text-gray-300">{field.label}</Label>
              <Input type={field.type} value={formData[field.name] || ''} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} className="bg-white/5 border-white/20 text-white mt-1" placeholder={field.placeholder} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-cyan-600 to-blue-600">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Enregistrement...' : 'Enregistrer la configuration'}
        </Button>
      </div>
    </div>
  );
}