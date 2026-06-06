// src/app/dashboard/entreprise/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, Settings, Building, CreditCard,
  Store, Truck, Hotel, Pill, Scissors, Briefcase, ShoppingCart,
  Cpu, GraduationCap, Stethoscope, HeartPulse, Home, Dumbbell,
  Wine, Croissant, Book, Fuel, Wrench, Bus, Plane, Monitor,
  Camera, HardHat, Wheat, HandHeart, Landmark, MoreHorizontal,
  ArrowRight, ArrowLeft, Menu, X, LogOut, User, Bell,
  UtensilsCrossed, BedDouble, Dumbbell as Gym, Sandwich, Car,
  ShoppingBag, Laptop, School, Heart, MapPin, DollarSign, Users2,
  Calendar, Package, TrendingUp, ClipboardList,
  Clock,
  FileText,
  Sparkles,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/src/lib/supabase/client';
import AnalyticsChart from '@/src/components/dashboard/AnalyticsChart';
import Loading from '@/src/components/system/Loading';
import { ThemeToggle } from '@/src/components/system/ThemeToggle';

// ✅ Contenu spécifique pour chaque type d'entreprise
const TYPE_CONTENT: Record<string, {
  title: string;
  description: string;
  quickActions: { label: string; icon: React.ReactNode; path: string; color: string }[];
  stats: { label: string; value: string; icon: React.ReactNode }[];
  tips: string[];
}> = {
  restaurant: {
    title: 'Gestion Restaurant',
    description: 'Gérez votre menu, réservations et commandes en ligne.',
    quickActions: [
      { label: 'Menu', icon: <UtensilsCrossed className="w-4 h-4" />, path: '/dashboard/entreprise/menu', color: 'from-orange-500/60 to-red-500/60' },
      { label: 'Réservations', icon: <Calendar className="w-4 h-4" />, path: '/dashboard/entreprise/reservations', color: 'from-amber-500/60 to-orange-500/60' },
      { label: 'Commandes', icon: <ShoppingBag className="w-4 h-4" />, path: '/dashboard/entreprise/orders', color: 'from-green-500/60 to-emerald-500/60' },
      { label: 'Avis clients', icon: <Star className="w-4 h-4" />, path: '/dashboard/entreprise/reviews', color: 'from-yellow-500/60 to-amber-500/60' },
    ],
    stats: [
      { label: 'Commandes du jour', value: '0', icon: <ShoppingBag className="w-4 h-4" /> },
      { label: 'Réservations', value: '0', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Note moyenne', value: '--', icon: <Star className="w-4 h-4" /> },
    ],
    tips: ['Mettez à jour votre menu régulièrement', 'Activez les commandes en ligne pour plus de visibilité', 'Répondez aux avis clients rapidement'],
  },
  hotel: {
    title: 'Gestion Hôtel',
    description: 'Configurez vos chambres, tarifs et réservations.',
    quickActions: [
      { label: 'Chambres', icon: <BedDouble className="w-4 h-4" />, path: '/dashboard/entreprise/rooms', color: 'from-purple-500/60 to-indigo-500/60' },
      { label: 'Réservations', icon: <Calendar className="w-4 h-4" />, path: '/dashboard/entreprise/reservations', color: 'from-blue-500/60 to-cyan-500/60' },
      { label: 'Tarifs', icon: <DollarSign className="w-4 h-4" />, path: '/dashboard/entreprise/pricing', color: 'from-green-500/60 to-emerald-500/60' },
      { label: 'Services', icon: <ClipboardList className="w-4 h-4" />, path: '/dashboard/entreprise/services', color: 'from-amber-500/60 to-orange-500/60' },
    ],
    stats: [
      { label: 'Taux d\'occupation', value: '0%', icon: <Home className="w-4 h-4" /> },
      { label: 'Réservations', value: '0', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Revenus/mois', value: '0 €', icon: <DollarSign className="w-4 h-4" /> },
    ],
    tips: ['Ajoutez des photos de qualité de vos chambres', 'Proposez des offres spéciales pour les séjours longs', 'Configurez le check-in/check-out en ligne'],
  },
  shop: {
    title: 'Gestion Boutique',
    description: 'Ajoutez vos produits, gérez votre stock et promotions.',
    quickActions: [
      { label: 'Produits', icon: <Package className="w-4 h-4" />, path: '/dashboard/entreprise/products', color: 'from-blue-500/60 to-cyan-500/60' },
      { label: 'Commandes', icon: <ShoppingBag className="w-4 h-4" />, path: '/dashboard/entreprise/orders', color: 'from-green-500/60 to-emerald-500/60' },
      { label: 'Promotions', icon: <TrendingUp className="w-4 h-4" />, path: '/dashboard/entreprise/promotions', color: 'from-pink-500/60 to-rose-500/60' },
      { label: 'Clients', icon: <Users2 className="w-4 h-4" />, path: '/dashboard/entreprise/customers', color: 'from-violet-500/60 to-purple-500/60' },
    ],
    stats: [
      { label: 'Produits actifs', value: '0', icon: <Package className="w-4 h-4" /> },
      { label: 'Ventes du mois', value: '0', icon: <ShoppingBag className="w-4 h-4" /> },
      { label: 'Clients', value: '0', icon: <Users2 className="w-4 h-4" /> },
    ],
    tips: ['Ajoutez des descriptions détaillées à vos produits', 'Utilisez des photos de qualité', 'Créez des promotions pour attirer les clients'],
  },
  tech: {
    title: 'Gestion Entreprise Tech',
    description: 'Présentez vos services numériques et portfolio.',
    quickActions: [
      { label: 'Services', icon: <Laptop className="w-4 h-4" />, path: '/dashboard/entreprise/services', color: 'from-cyan-500/60 to-blue-500/60' },
      { label: 'Portfolio', icon: <Briefcase className="w-4 h-4" />, path: '/dashboard/entreprise/portfolio', color: 'from-violet-500/60 to-purple-500/60' },
      { label: 'Équipe', icon: <Users2 className="w-4 h-4" />, path: '/dashboard/entreprise/team', color: 'from-emerald-500/60 to-teal-500/60' },
      { label: 'Projets', icon: <ClipboardList className="w-4 h-4" />, path: '/dashboard/entreprise/projects', color: 'from-amber-500/60 to-orange-500/60' },
    ],
    stats: [
      { label: 'Projets actifs', value: '0', icon: <ClipboardList className="w-4 h-4" /> },
      { label: 'Clients', value: '0', icon: <Users2 className="w-4 h-4" /> },
      { label: 'Taux satisfaction', value: '--', icon: <Star className="w-4 h-4" /> },
    ],
    tips: ['Mettez en avant vos projets récents', 'Ajoutez des témoignages clients', 'Proposez des démos de vos services'],
  },
  school: {
    title: 'Gestion École',
    description: 'Gérez vos classes, élèves et calendrier.',
    quickActions: [
      { label: 'Classes', icon: <School className="w-4 h-4" />, path: '/dashboard/entreprise/classes', color: 'from-yellow-500/60 to-amber-500/60' },
      { label: 'Élèves', icon: <Users2 className="w-4 h-4" />, path: '/dashboard/entreprise/students', color: 'from-blue-500/60 to-cyan-500/60' },
      { label: 'Emploi du temps', icon: <Calendar className="w-4 h-4" />, path: '/dashboard/entreprise/schedule', color: 'from-green-500/60 to-emerald-500/60' },
      { label: 'Notes', icon: <ClipboardList className="w-4 h-4" />, path: '/dashboard/entreprise/grades', color: 'from-purple-500/60 to-indigo-500/60' },
    ],
    stats: [
      { label: 'Élèves', value: '0', icon: <Users2 className="w-4 h-4" /> },
      { label: 'Classes', value: '0', icon: <School className="w-4 h-4" /> },
      { label: 'Taux réussite', value: '--', icon: <TrendingUp className="w-4 h-4" /> },
    ],
    tips: ['Publiez les emplois du temps en ligne', 'Activez les notifications pour les parents', 'Utilisez les cartes d\'identité pour les élèves'],
  },
  pharmacy: {
    title: 'Gestion Pharmacie',
    description: 'Gérez votre stock de médicaments et vos gardes.',
    quickActions: [
      { label: 'Stock', icon: <Package className="w-4 h-4" />, path: '/dashboard/entreprise/stock', color: 'from-red-500/60 to-rose-500/60' },
      { label: 'Gardes', icon: <Calendar className="w-4 h-4" />, path: '/dashboard/entreprise/gardes', color: 'from-blue-500/60 to-cyan-500/60' },
      { label: 'Commandes', icon: <ShoppingBag className="w-4 h-4" />, path: '/dashboard/entreprise/orders', color: 'from-green-500/60 to-emerald-500/60' },
      { label: 'Clients', icon: <Users2 className="w-4 h-4" />, path: '/dashboard/entreprise/customers', color: 'from-violet-500/60 to-purple-500/60' },
    ],
    stats: [
      { label: 'Produits en stock', value: '0', icon: <Package className="w-4 h-4" /> },
      { label: 'Ordonnances', value: '0', icon: <ClipboardList className="w-4 h-4" /> },
      { label: 'Clients fidèles', value: '0', icon: <Users2 className="w-4 h-4" /> },
    ],
    tips: ['Mettez à jour votre stock quotidiennement', 'Indiquez vos horaires de garde', 'Proposez la livraison à domicile'],
  },
  beauty: {
    title: 'Gestion Salon de Beauté',
    description: 'Proposez vos services, gérez vos rendez-vous.',
    quickActions: [
      { label: 'Services', icon: <Scissors className="w-4 h-4" />, path: '/dashboard/entreprise/services', color: 'from-pink-500/60 to-rose-500/60' },
      { label: 'Rendez-vous', icon: <Calendar className="w-4 h-4" />, path: '/dashboard/entreprise/appointments', color: 'from-fuchsia-500/60 to-pink-500/60' },
      { label: 'Clients', icon: <Users2 className="w-4 h-4" />, path: '/dashboard/entreprise/customers', color: 'from-violet-500/60 to-purple-500/60' },
      { label: 'Promotions', icon: <TrendingUp className="w-4 h-4" />, path: '/dashboard/entreprise/promotions', color: 'from-amber-500/60 to-orange-500/60' },
    ],
    stats: [
      { label: 'RDV aujourd\'hui', value: '0', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Clients', value: '0', icon: <Users2 className="w-4 h-4" /> },
      { label: 'Note moyenne', value: '--', icon: <Star className="w-4 h-4" /> },
    ],
    tips: ['Affichez vos disponibilités en temps réel', 'Proposez des forfaits fidélité', 'Partagez vos réalisations en photos'],
  },
  medical: {
    title: 'Gestion Cabinet Médical',
    description: 'Gérez vos patients, rendez-vous et dossiers.',
    quickActions: [
      { label: 'Patients', icon: <Users2 className="w-4 h-4" />, path: '/dashboard/entreprise/patients', color: 'from-sky-500/60 to-blue-500/60' },
      { label: 'Rendez-vous', icon: <Calendar className="w-4 h-4" />, path: '/dashboard/entreprise/appointments', color: 'from-cyan-500/60 to-blue-500/60' },
      { label: 'Dossiers', icon: <ClipboardList className="w-4 h-4" />, path: '/dashboard/entreprise/records', color: 'from-violet-500/60 to-purple-500/60' },
      { label: 'Ordonnances', icon: <FileText className="w-4 h-4" />, path: '/dashboard/entreprise/prescriptions', color: 'from-emerald-500/60 to-teal-500/60' },
    ],
    stats: [
      { label: 'Patients', value: '0', icon: <Users2 className="w-4 h-4" /> },
      { label: 'RDV aujourd\'hui', value: '0', icon: <Calendar className="w-4 h-4" /> },
      { label: 'En attente', value: '0', icon: <Clock className="w-4 h-4" /> },
    ],
    tips: ['Envoyez des rappels de rendez-vous automatiques', 'Sécurisez les dossiers patients', 'Proposez la téléconsultation'],
  },
};

// Contenu par défaut pour les autres types
const DEFAULT_CONTENT = {
  title: 'Configuration',
  description: 'Configurez les informations spécifiques à votre activité.',
  quickActions: [
    { label: 'Paramètres', icon: <Settings className="w-4 h-4" />, path: '/dashboard/entreprise/settings', color: 'from-gray-500/60 to-gray-600/60' },
    { label: 'Cartes Membres', icon: <CreditCard className="w-4 h-4" />, path: '/dashboard/entreprise/cards', color: 'from-violet-500/60 to-purple-500/60' },
  ],
  stats: [
    { label: 'Membres', value: '0', icon: <Users2 className="w-4 h-4" /> },
    { label: 'Cartes actives', value: '0', icon: <CreditCard className="w-4 h-4" /> },
  ],
  tips: ['Complétez votre profil entreprise', 'Ajoutez votre logo et vos informations', 'Créez des cartes pour vos membres'],
};

const COMPANY_TYPES_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  restaurant: { label: 'Restaurant', icon: <UtensilsCrossed className="w-4 h-4" />, color: 'from-orange-500/60 to-red-500/60' },
  shop: { label: 'Boutique', icon: <Store className="w-4 h-4" />, color: 'from-blue-500/60 to-cyan-500/60' },
  delivery: { label: 'Livraison', icon: <Truck className="w-4 h-4" />, color: 'from-green-500/60 to-emerald-500/60' },
  hotel: { label: 'Hôtel', icon: <Hotel className="w-4 h-4" />, color: 'from-purple-500/60 to-indigo-500/60' },
  pharmacy: { label: 'Pharmacie', icon: <Pill className="w-4 h-4" />, color: 'from-red-500/60 to-rose-500/60' },
  beauty: { label: 'Salon de beauté', icon: <Scissors className="w-4 h-4" />, color: 'from-pink-500/60 to-rose-500/60' },
  agency: { label: 'Agence', icon: <Briefcase className="w-4 h-4" />, color: 'from-amber-500/60 to-orange-500/60' },
  supermarket: { label: 'Supermarché', icon: <ShoppingCart className="w-4 h-4" />, color: 'from-emerald-500/60 to-teal-500/60' },
  tech: { label: 'Tech', icon: <Cpu className="w-4 h-4" />, color: 'from-cyan-500/60 to-blue-500/60' },
  school: { label: 'École', icon: <GraduationCap className="w-4 h-4" />, color: 'from-yellow-500/60 to-amber-500/60' },
  medical: { label: 'Cabinet médical', icon: <Stethoscope className="w-4 h-4" />, color: 'from-sky-500/60 to-blue-500/60' },
  clinic: { label: 'Clinique', icon: <HeartPulse className="w-4 h-4" />, color: 'from-red-600/60 to-rose-600/60' },
  realestate: { label: 'Immobilier', icon: <Home className="w-4 h-4" />, color: 'from-violet-500/60 to-purple-500/60' },
  gym: { label: 'Salle de sport', icon: <Dumbbell className="w-4 h-4" />, color: 'from-lime-500/60 to-green-500/60' },
  bar: { label: 'Bar / Lounge', icon: <Wine className="w-4 h-4" />, color: 'from-fuchsia-500/60 to-pink-500/60' },
  bakery: { label: 'Boulangerie', icon: <Croissant className="w-4 h-4" />, color: 'from-amber-400/60 to-yellow-500/60' },
  library: { label: 'Librairie', icon: <Book className="w-4 h-4" />, color: 'from-stone-500/60 to-neutral-500/60' },
  gasstation: { label: 'Station-service', icon: <Fuel className="w-4 h-4" />, color: 'from-slate-500/60 to-gray-500/60' },
  repair: { label: 'Réparation', icon: <Wrench className="w-4 h-4" />, color: 'from-zinc-500/60 to-gray-600/60' },
  transport: { label: 'Transport', icon: <Bus className="w-4 h-4" />, color: 'from-teal-500/60 to-cyan-500/60' },
  travel: { label: 'Voyage', icon: <Plane className="w-4 h-4" />, color: 'from-sky-400/60 to-blue-400/60' },
  cybercafe: { label: 'Cybercafé', icon: <Monitor className="w-4 h-4" />, color: 'from-indigo-500/60 to-blue-500/60' },
  photography: { label: 'Photo', icon: <Camera className="w-4 h-4" />, color: 'from-gray-500/60 to-slate-500/60' },
  construction: { label: 'Construction', icon: <HardHat className="w-4 h-4" />, color: 'from-amber-600/60 to-orange-600/60' },
  farm: { label: 'Ferme', icon: <Wheat className="w-4 h-4" />, color: 'from-green-600/60 to-emerald-600/60' },
  ngo: { label: 'ONG', icon: <HandHeart className="w-4 h-4" />, color: 'from-rose-500/60 to-pink-500/60' },
  bank: { label: 'Banque', icon: <Landmark className="w-4 h-4" />, color: 'from-blue-700/60 to-indigo-700/60' },
  other: { label: 'Autre', icon: <MoreHorizontal className="w-4 h-4" />, color: 'from-gray-400/60 to-gray-500/60' },
};

export default function EnterpriseDashboard() {
  const t = useTranslations('enterprise');
  const router = useRouter();
  const supabase = createClient();
  const realtimeChannels = useRef<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [companyType, setCompanyType] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [stats, setStats] = useState({ totalCards: 0, activeCards: 0, suspendedCards: 0, revokedCards: 0, profileId: '', companyId: '' });

  const fetchStats = async (companyId: string, userId: string) => {
    try {
      const { data: orgCards } = await supabase.from('org_cards').select('status').eq('org_id', companyId);
      setStats({
        totalCards: (orgCards || []).length,
        activeCards: (orgCards || []).filter((c: any) => c.status === 'active').length,
        suspendedCards: (orgCards || []).filter((c: any) => c.status === 'suspended').length,
        revokedCards: (orgCards || []).filter((c: any) => c.status === 'revoked').length,
        profileId: userId, companyId
      });
    } catch (err) { console.error('Erreur chargement stats:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/auth/sign-in'); return; }
        const [{ data: profile }, { data: company }] = await Promise.all([
          supabase.from('profiles').select('plan, full_name').eq('id', user.id).single(),
          supabase.from('companies').select('*').eq('owner_id', user.id).maybeSingle()
        ]);
        setUserName(profile?.full_name || user.email?.split('@')[0] || 'Utilisateur');
        if (!company && profile?.plan?.toLowerCase() !== 'entreprise') { router.push('/dashboard'); return; }
        if (!company) { router.push('/dashboard'); return; }
        setCompanyName(company.name || '');
        setCompanyType(company.company_type || null);
        if (!company.company_type) { setShowTypeModal(true); }
        await fetchStats(company.id, user.id);
        const channel = supabase.channel(`org-cards-${company.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'org_cards', filter: `org_id=eq.${company.id}` },
            () => fetchStats(company.id, user.id)).subscribe();
        realtimeChannels.current = [channel];
      } catch (err) { console.error('Init échouée:', err); router.push('/dashboard'); }
    };
    init();
    return () => { realtimeChannels.current.forEach(ch => ch?.unsubscribe?.()); };
  }, []);

  const typeInfo = companyType ? COMPANY_TYPES_MAP[companyType] : null;
  const contentType = companyType ? (TYPE_CONTENT[companyType] || DEFAULT_CONTENT) : null;

  if (loading) return <Loading />;

  const statCards = [
    { title: "Total cartes", value: stats.totalCards, color: "from-blue-500/60 to-cyan-500/60" },
    { title: "Actives", value: stats.activeCards, color: "from-emerald-500/60 to-teal-500/60" },
    { title: "Suspendues", value: stats.suspendedCards, color: "from-amber-500/60 to-orange-500/60" },
    { title: "Révoquées", value: stats.revokedCards, color: "from-red-500/60 to-rose-500/60" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br bg-transparent">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <main className="space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/[0.08] to-purple-500/[0.08] mb-4 border border-indigo-500/[0.08]">
              <Building className="w-7 h-7 text-indigo-300/70" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white/90 to-cyan-200/70 bg-clip-text text-transparent">
              {companyName || t('title')}
            </h1>
            <div className="mt-3 flex items-center justify-center gap-2">
              {typeInfo ? (
                <Badge className={`px-3 py-1 text-xs bg-gradient-to-r ${typeInfo.color} text-white/80 border-0 font-light`}>
                  <span className="mr-1.5">{typeInfo.icon}</span>
                  {typeInfo.label}
                </Badge>
              ) : (
                <Button onClick={() => setShowTypeModal(true)} className="h-7 text-xs bg-gradient-to-r from-amber-600/80 to-orange-600/80 text-white font-light rounded-lg">
                  Définir la catégorie
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* ✅ Contenu spécifique au type d'entreprise */}
          {contentType && (
            <div className="space-y-6">
              {/* Description */}
              <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
                <h2 className="text-lg font-semibold text-white/80 mb-2">{contentType.title}</h2>
                <p className="text-gray-400/60 text-sm font-light">{contentType.description}</p>
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {contentType.quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(action.path)}
                    className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all text-center group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform`}>
                      {action.icon}
                    </div>
                    <span className="text-xs text-white/70 font-light">{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Stats spécifiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {contentType.stats.map((stat, i) => (
                  <div key={i} className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-gray-400/60">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400/60 font-light">{stat.label}</p>
                      <p className="text-lg font-semibold text-white/80">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conseils */}
              <div className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400/60" />
                  Conseils pour votre activité
                </h3>
                <ul className="space-y-2">
                  {contentType.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400/60 font-light">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 mt-1.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Statistiques générales (toujours visibles) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((stat, index) => (
              <div key={index} className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-300">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <CreditCard className="w-4 h-4 text-white/80" />
                </div>
                <p className="text-gray-400/60 text-xs font-light mb-0.5">{stat.title}</p>
                <p className="text-xl font-semibold text-white/80">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Graphique */}
          <div className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06]">
            <AnalyticsChart profileId={stats.profileId} />
          </div>

           v
        </main>
      </div>

      {/* Modal choix du type */}
      {showTypeModal && (
        <CompanyTypeModal companyId={stats.companyId} onClose={() => setShowTypeModal(false)}
          onSaved={(type) => { setCompanyType(type); setShowTypeModal(false); window.location.reload(); }} />
      )}
    </div>
  );
}

// Modal choix du type (inchangé)
function CompanyTypeModal({ companyId, onClose, onSaved }: { companyId: string; onClose: () => void; onSaved: (type: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('companies').update({ company_type: selected, updated_at: new Date().toISOString() }).eq('id', companyId);
    if (error) { setSaving(false); return; }
    onSaved(selected);
  };
  const types = Object.entries(COMPANY_TYPES_MAP);
  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] max-h-[80vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-white/80 mb-4">Choisissez votre catégorie</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {types.map(([id, info]) => (
            <div key={id} onClick={() => setSelected(id)} className={`cursor-pointer p-3 rounded-xl text-center border transition-all duration-200 ${selected === id ? 'border-cyan-400/30 bg-cyan-500/[0.06]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'}`}>
              <div className={`w-8 h-8 mx-auto mb-1.5 rounded-lg bg-gradient-to-br ${info.color} flex items-center justify-center`}>{info.icon}</div>
              <p className="text-[11px] text-white/60 font-light">{info.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
            <ThemeToggle />

          <Button variant="ghost" onClick={onClose} className="flex-1 h-8 text-xs text-gray-400/60 hover:text-gray-300/80 hover:bg-white/[0.04] font-light rounded-lg">Plus tard</Button>
          <Button onClick={handleSave} disabled={!selected || saving} className="flex-1 h-8 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-light rounded-lg">
            {saving ? 'Enregistrement...' : 'Confirmer'}
          </Button>
        </div>
      </div>
    </div>
  );
}