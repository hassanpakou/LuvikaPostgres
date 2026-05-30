// src/app/dashboard/entreprise/cards/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import {
  Plus, Search, CreditCard, QrCode,
  CheckCircle, XCircle, Clock,
  MoreVertical, Trash2, ArrowLeft, Download,
  ChevronDown, ChevronUp, Edit, Upload, ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/src/lib/supabase/client';
import { toast } from 'sonner';

type OrgCard = {
  id: string;
  org_id: string;
  member_id: string | null;
  card_number: string;
  status: string;
  role_in_org: string | null;
  member_name: string | null;
  member_email: string | null;
  member_surname: string | null;
  member_given_name: string | null;
  member_phone: string | null;
  member_position: string | null;
  member_department: string | null;
  member_blood_group: string | null;
  member_nationality: string | null;
  member_access_level: string | null;
  member_work_hours: string | null;
  member_photo_url: string | null;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
};

export default function OrgCardsPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();

  const [cards, setCards] = useState<OrgCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<OrgCard | null>(null);
  const [selectedCardForQR, setSelectedCardForQR] = useState<OrgCard | null>(null);
  const [companyId, setCompanyId] = useState<string>('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const editPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const emptyForm = {
    full_name: '',
    email: '',
    role_in_org: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    member_surname: '',
    member_given_name: '',
    member_phone: '',
    member_position: '',
    member_department: '',
    member_blood_group: '',
    member_nationality: '',
    member_access_level: '',
    member_work_hours: '',
    member_photo_url: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luvika.vercel.app';

  useEffect(() => {
    if (showQRModal && selectedCardForQR && qrCanvasRef.current) {
      import('qrcode').then(QRCode => {
        QRCode.default.toCanvas(
          qrCanvasRef.current,
          `${baseUrl}/${locale}/card/${selectedCardForQR.card_number}`,
          { width: 200, color: { dark: '#1e293b', light: '#ffffff' } }
        );
      });
    }
  }, [showQRModal, selectedCardForQR, baseUrl, locale]);

  const fetchCards = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: company } = await supabase.from('companies').select('id').eq('owner_id', user.id).single();
    if (!company) return;
    setCompanyId(company.id);
    const { data, error } = await supabase.from('org_cards').select('*').eq('org_id', company.id).order('created_at', { ascending: false });
    if (error) { console.error('❌ Erreur fetchCards:', error); toast.error('Erreur lors du chargement des cartes'); }
    else setCards(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCards(); }, []);

  // 🔹 Upload photo vers Supabase Storage
  const uploadPhoto = async (file: File, cardNumber: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `org-cards/${cardNumber}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('org-photos').upload(fileName, file, { upsert: true });
    if (error) {
      console.error('❌ Erreur upload photo:', error);
      return null;
    }
    const { data: urlData } = supabase.storage.from('org-photos').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setShowAdvancedFields(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
  };

  // 🔹 Créer une carte
  const handleCreate = async () => {
    if (!formData.full_name || !formData.email) { toast.error('Nom et email requis'); return; }
    setCreating(true);
    const cardNumber = `ORG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const validUntil = formData.valid_until || null;

    let photoUrl = null;
    if (photoFile) {
      photoUrl = await uploadPhoto(photoFile, cardNumber);
    }

    const { error } = await supabase.from('org_cards').insert({
      org_id: companyId,
      card_number: cardNumber,
      member_name: formData.full_name.trim(),
      member_email: formData.email.trim(),
      role_in_org: formData.role_in_org || null,
      valid_from: formData.valid_from || new Date().toISOString(),
      valid_until: validUntil,
      member_surname: formData.member_surname || null,
      member_given_name: formData.member_given_name || null,
      member_phone: formData.member_phone || null,
      member_position: formData.member_position || null,
      member_department: formData.member_department || null,
      member_blood_group: formData.member_blood_group || null,
      member_nationality: formData.member_nationality || null,
      member_access_level: formData.member_access_level || null,
      member_work_hours: formData.member_work_hours || null,
      member_photo_url: photoUrl,
      status: 'inactive',
    });

    if (error) { toast.error(`Erreur : ${error.message}`); }
    else { toast.success('✅ Carte créée'); setShowCreateModal(false); resetForm(); fetchCards(); }
    setCreating(false);
  };

  // 🔹 Ouvrir le modal d'édition
  const openEditModal = (card: OrgCard) => {
    setSelectedCard(card);
    setFormData({
      full_name: card.member_name || '',
      email: card.member_email || '',
      role_in_org: card.role_in_org || '',
      valid_from: card.valid_from ? card.valid_from.split('T')[0] : new Date().toISOString().split('T')[0],
      valid_until: card.valid_until ? card.valid_until.split('T')[0] : '',
      member_surname: card.member_surname || '',
      member_given_name: card.member_given_name || '',
      member_phone: card.member_phone || '',
      member_position: card.member_position || '',
      member_department: card.member_department || '',
      member_blood_group: card.member_blood_group || '',
      member_nationality: card.member_nationality || '',
      member_access_level: card.member_access_level || '',
      member_work_hours: card.member_work_hours || '',
      member_photo_url: card.member_photo_url || '',
    });
    setEditPhotoFile(null);
    setEditPhotoPreview(card.member_photo_url || null);
    setShowEditModal(true);
    setShowMenu(null);
  };

  // 🔹 Sauvegarder les modifications
  const handleUpdate = async () => {
    if (!selectedCard || !formData.full_name || !formData.email) { toast.error('Nom et email requis'); return; }
    setSaving(true);

    let photoUrl = formData.member_photo_url;
    if (editPhotoFile) {
      const uploaded = await uploadPhoto(editPhotoFile, selectedCard.card_number);
      if (uploaded) photoUrl = uploaded;
    }

    const validUntil = formData.valid_until || null;

    const { error } = await supabase.from('org_cards').update({
      member_name: formData.full_name.trim(),
      member_email: formData.email.trim(),
      role_in_org: formData.role_in_org || null,
      valid_from: formData.valid_from || new Date().toISOString(),
      valid_until: validUntil,
      member_surname: formData.member_surname || null,
      member_given_name: formData.member_given_name || null,
      member_phone: formData.member_phone || null,
      member_position: formData.member_position || null,
      member_department: formData.member_department || null,
      member_blood_group: formData.member_blood_group || null,
      member_nationality: formData.member_nationality || null,
      member_access_level: formData.member_access_level || null,
      member_work_hours: formData.member_work_hours || null,
      member_photo_url: photoUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', selectedCard.id);

    if (error) { toast.error(`Erreur : ${error.message}`); }
    else { toast.success('✅ Carte mise à jour'); setShowEditModal(false); resetForm(); fetchCards(); }
    setSaving(false);
  };

  const updateStatus = async (cardId: string, newStatus: string) => {
    const { error } = await supabase.from('org_cards').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', cardId);
    if (error) toast.error(`Échec : ${error.message}`);
    else { toast.success(`Carte ${newStatus === 'active' ? 'activée' : newStatus}`); fetchCards(); }
    setShowMenu(null);
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm('Supprimer définitivement cette carte ?')) return;
    const { error } = await supabase.from('org_cards').delete().eq('id', cardId);
    if (error) toast.error(`Échec suppression : ${error.message}`);
    else toast.success('Carte supprimée');
    setShowMenu(null);
    fetchCards();
  };

  const exportCSV = () => {
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Poste', 'Département', 'Rôle', 'Statut', 'N° Carte', 'Valide du', 'Valide jusqu\'au', 'Créée le'];
    const rows = cards.map(c => [c.member_surname || c.member_name || '', c.member_given_name || '', c.member_email || '', c.member_phone || '', c.member_position || '', c.member_department || '', c.role_in_org || '', c.status, c.card_number, c.valid_from ? new Date(c.valid_from).toLocaleDateString('fr-FR') : '-', c.valid_until ? new Date(c.valid_until).toLocaleDateString('fr-FR') : 'Sans limite', new Date(c.created_at).toLocaleDateString('fr-FR')]);
    const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `membres-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success('✅ Export CSV téléchargé');
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = (card.card_number + card.member_name + card.member_email + card.member_surname + card.member_given_name + card.member_phone).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = { active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', inactive: 'bg-gray-500/20 text-gray-300 border-gray-500/30', suspended: 'bg-amber-500/20 text-amber-300 border-amber-500/30', revoked: 'bg-red-500/20 text-red-300 border-red-500/30' };
    const labels: Record<string, string> = { active: 'Active', inactive: 'Inactive', suspended: 'Suspendue', revoked: 'Révoquée' };
    return <Badge className={styles[status] || styles.inactive}>{labels[status] || status}</Badge>;
  };

  // 🔹 Composant pour le champ photo (création + édition)
  const PhotoUploadField = ({ preview, onFileChange }: { preview: string | null; onFileChange: (file: File) => void }) => (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-500 hover:border-cyan-400 transition-all cursor-pointer group bg-gray-800" onClick={() => photoInputRef.current?.click()}>
        {preview ? (
          <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-cyan-400 transition-colors">
            <ImageIcon className="w-6 h-6" />
            <span className="text-[10px] mt-1">Photo</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload className="w-5 h-5 text-white" />
        </div>
      </div>
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange(f); }} />
      <p className="text-[10px] text-gray-500">JPEG ou PNG, max 2 Mo</p>
    </div>
  );

  // 🔹 Composant formulaire (création + édition)
  const CardForm = ({ onSubmit, onCancel, submitLabel, isSubmitting, showPhoto = false, photoPreviewUrl, onPhotoChange }: {
    onSubmit: () => void;
    onCancel: () => void;
    submitLabel: string;
    isSubmitting: boolean;
    showPhoto?: boolean;
    photoPreviewUrl?: string | null;
    onPhotoChange?: (file: File) => void;
  }) => (
    <div className="space-y-4">
      {showPhoto && onPhotoChange && (
        <div className="flex justify-center mb-2">
          <PhotoUploadField preview={photoPreviewUrl || null} onFileChange={onPhotoChange} />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="text-sm text-gray-300 mb-1 block">Nom *</label><Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="bg-white/5 border-white/20 text-white" placeholder="Dupont" /></div>
        <div><label className="text-sm text-gray-300 mb-1 block">Prénom</label><Input value={formData.member_given_name} onChange={e => setFormData({ ...formData, member_given_name: e.target.value })} className="bg-white/5 border-white/20 text-white" placeholder="Jean" /></div>
      </div>
      <div><label className="text-sm text-gray-300 mb-1 block">Email *</label><Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="bg-white/5 border-white/20 text-white" placeholder="jean@organisation.org" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="text-sm text-gray-300 mb-1 block">Téléphone</label><Input value={formData.member_phone} onChange={e => setFormData({ ...formData, member_phone: e.target.value })} className="bg-white/5 border-white/20 text-white" placeholder="+243..." /></div>
        <div><label className="text-sm text-gray-300 mb-1 block">Poste / Fonction</label><Input value={formData.member_position} onChange={e => setFormData({ ...formData, member_position: e.target.value })} className="bg-white/5 border-white/20 text-white" placeholder="Directeur, Agent..." /></div>
      </div>
      <div><label className="text-sm text-gray-300 mb-1 block">Rôle</label><Input value={formData.role_in_org} onChange={e => setFormData({ ...formData, role_in_org: e.target.value })} className="bg-white/5 border-white/20 text-white" placeholder="Membre, Admin..." /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
        <div><label className="text-sm text-gray-300 mb-1 block">Valide du</label><Input type="date" value={formData.valid_from} onChange={e => setFormData({ ...formData, valid_from: e.target.value })} className="bg-white/5 border-white/20 text-white" /><p className="text-[10px] text-gray-500 mt-1">Date de début</p></div>
        <div><label className="text-sm text-gray-300 mb-1 block">Valide jusqu'au</label><Input type="date" value={formData.valid_until} onChange={e => setFormData({ ...formData, valid_until: e.target.value })} className="bg-white/5 border-white/20 text-white" min={formData.valid_from} /><p className="text-[10px] text-gray-500 mt-1">{formData.valid_until ? `Expire le ${new Date(formData.valid_until).toLocaleDateString('fr-FR')}` : 'Laissez vide = Sans limite'}</p></div>
      </div>
      <button onClick={() => setShowAdvancedFields(!showAdvancedFields)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all text-sm border border-white/10">
        {showAdvancedFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} Champs avancés (optionnels)
      </button>
      <AnimatePresence>
        {showAdvancedFields && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-300 mb-1 block">Département</label><Input value={formData.member_department} onChange={e => setFormData({ ...formData, member_department: e.target.value })} className="bg-white/5 border-white/20 text-white" placeholder="Informatique, RH..." /></div>
                <div><label className="text-sm text-gray-300 mb-1 block">Niveau d'accès</label><Input value={formData.member_access_level} onChange={e => setFormData({ ...formData, member_access_level: e.target.value })} className="bg-white/5 border-white/20 text-white" placeholder="Niveau 1, Admin..." /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-300 mb-1 block">Groupe sanguin</label><Input value={formData.member_blood_group} onChange={e => setFormData({ ...formData, member_blood_group: e.target.value })} className="bg-white/5 border-white/20 text-white" placeholder="O+, A-, B+..." /></div>
                <div><label className="text-sm text-gray-300 mb-1 block">Nationalité</label><Input value={formData.member_nationality} onChange={e => setFormData({ ...formData, member_nationality: e.target.value })} className="bg-white/5 border-white/20 text-white" placeholder="Congolaise..." /></div>
              </div>
              <div><label className="text-sm text-gray-300 mb-1 block">Horaires de service</label><Input value={formData.member_work_hours} onChange={e => setFormData({ ...formData, member_work_hours: e.target.value })} className="bg-white/5 border-white/20 text-white" placeholder="Lun-Ven 8h-16h" /></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onCancel} className="flex-1 border-white/20 text-gray-300">Annuler</Button>
        <Button onClick={onSubmit} disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600">{isSubmitting ? 'En cours...' : submitLabel}</Button>
      </div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* En-tête + Stats + Filtres + Liste : IDENTIQUE À AVANT */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div><Button variant="outline" onClick={() => router.push('/dashboard/entreprise')} className="mb-4 border-white/20 text-gray-300"><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Button><h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">Cartes Membres</h1><p className="text-gray-400 mt-1">Gérez les cartes d'identité de votre organisation</p></div>
        <div className="flex gap-2"><Button onClick={exportCSV} variant="outline" className="border-white/20 text-gray-300"><Download className="w-4 h-4 mr-2" /> Export CSV</Button><Button onClick={() => { resetForm(); setShowCreateModal(true); }} className="bg-gradient-to-r from-cyan-600 to-blue-600"><Plus className="w-4 h-4 mr-2" /> Nouvelle carte</Button></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[{ label: 'Total', value: cards.length, color: 'text-white' },{ label: 'Actives', value: cards.filter(c => c.status === 'active').length, color: 'text-emerald-400' },{ label: 'Suspendues', value: cards.filter(c => c.status === 'suspended').length, color: 'text-amber-400' },{ label: 'Révoquées', value: cards.filter(c => c.status === 'revoked').length, color: 'text-red-400' }].map((stat, i) => (<Card key={i} className="glass-border bg-white/5 border-white/10"><CardContent className="p-4 text-center"><p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p><p className="text-xs text-gray-400">{stat.label}</p></CardContent></Card>))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white/5 border-white/20 text-white" /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/20 text-white rounded-lg px-3 py-2 text-sm"><option value="all">Tous</option><option value="active">Actives</option><option value="inactive">Inactives</option><option value="suspended">Suspendues</option><option value="revoked">Révoquées</option></select>
      </div>
      <div className="space-y-3">
        {filteredCards.length === 0 ? (
          <div className="text-center py-16 glass-border bg-white/5 border border-dashed border-white/10 rounded-2xl"><CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" /><p className="text-gray-400">Aucune carte</p><Button onClick={() => { resetForm(); setShowCreateModal(true); }} className="mt-4 bg-gradient-to-r from-cyan-600 to-blue-600">Créer une première carte</Button></div>
        ) : filteredCards.map(card => (
          <Card key={card.id} className="glass-border bg-white/5 border-white/10 hover:border-cyan-500/30 transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {card.member_photo_url ? (
                  <img src={card.member_photo_url} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center"><CreditCard className="w-5 h-5 text-violet-400" /></div>
                )}
                <div>
                  <p className="font-medium text-white">{card.member_surname && card.member_given_name ? `${card.member_surname} ${card.member_given_name}` : card.member_name || 'Sans nom'}</p>
                  <p className="text-xs text-gray-400">{card.member_position && <span className="mr-2">{card.member_position}</span>}{card.card_number}</p>
                  {card.role_in_org && <Badge className="mt-1 bg-violet-500/15 text-violet-300 border-violet-500/20 text-[10px]">{card.role_in_org}</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(card.status)}
                <div className="relative">
                  <Button variant="ghost" size="sm" onClick={() => setShowMenu(showMenu === card.id ? null : card.id)} className="text-gray-400 hover:text-white"><MoreVertical className="w-4 h-4" /></Button>
                  <AnimatePresence>
                    {showMenu === card.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-10 w-48 bg-gray-800 border border-white/10 rounded-xl py-1 shadow-xl z-50">
                        <button onClick={() => { setShowMenu(null); setSelectedCardForQR(card); setShowQRModal(true); }} className="w-full text-left px-4 py-2 text-sm text-cyan-400 hover:bg-white/5 flex items-center gap-2"><QrCode className="w-4 h-4" /> Voir QR Code</button>
                        <button onClick={() => openEditModal(card)} className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-white/5 flex items-center gap-2"><Edit className="w-4 h-4" /> Modifier</button>
                        <hr className="border-white/5 my-1" />
                        {card.status !== 'active' && <button onClick={() => updateStatus(card.id, 'active')} className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-white/5 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Activer</button>}
                        {card.status === 'active' && <button onClick={() => updateStatus(card.id, 'suspended')} className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-white/5 flex items-center gap-2"><Clock className="w-4 h-4" /> Suspendre</button>}
                        <button onClick={() => updateStatus(card.id, 'revoked')} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"><XCircle className="w-4 h-4" /> Révoquer</button>
                        <hr className="border-white/5 my-1" />
                        <button onClick={() => deleteCard(card.id)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Supprimer</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal QR */}
<AnimatePresence>
  {showQRModal && selectedCardForQR && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowQRModal(false); setSelectedCardForQR(null); }}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="w-full max-w-sm glass-border bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-white/10 text-center" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-2">QR Code</h2>
        <p className="text-sm text-gray-400 mb-4">{selectedCardForQR.member_name} · {selectedCardForQR.card_number}</p>
        <div className="bg-white p-4 rounded-xl inline-block mb-4">
          <canvas id="org-card-qr-canvas" width="200" height="200" ref={qrCanvasRef} />
        </div>
        <p className="text-xs text-gray-500 mb-4">{baseUrl}/{locale}/card/{selectedCardForQR.card_number}</p>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              const canvas = qrCanvasRef.current;
              if (!canvas) return;
              const link = document.createElement('a');
              link.download = `carte-${selectedCardForQR.card_number}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
              toast.success('✅ QR Code téléchargé');
            }}
            variant="outline"
            className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          <Button onClick={() => { setShowQRModal(false); setSelectedCardForQR(null); }} variant="outline" className="flex-1 border-white/20 text-gray-300">
            Fermer
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Modal Création */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowCreateModal(false); resetForm(); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="w-full max-w-lg glass-border bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">Créer une carte membre</h2>
              <CardForm onSubmit={handleCreate} onCancel={() => { setShowCreateModal(false); resetForm(); }} submitLabel="Créer la carte" isSubmitting={creating} showPhoto photoPreviewUrl={photoPreview} onPhotoChange={(file) => { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Édition */}
      <AnimatePresence>
        {showEditModal && selectedCard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setShowEditModal(false); resetForm(); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="w-full max-w-lg glass-border bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-white mb-4">Modifier la carte</h2>
              <CardForm onSubmit={handleUpdate} onCancel={() => { setShowEditModal(false); resetForm(); }} submitLabel="Enregistrer" isSubmitting={saving} showPhoto photoPreviewUrl={editPhotoPreview} onPhotoChange={(file) => { setEditPhotoFile(file); setEditPhotoPreview(URL.createObjectURL(file)); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}