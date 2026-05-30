// src/app/dashboard/entreprise/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { 
  LayoutDashboard, Settings, TrendingUp, Building, CreditCard,
  Store, Truck, Hotel, Pill, Scissors, Briefcase, ShoppingCart,
  Cpu, GraduationCap, Stethoscope, HeartPulse, Home, Dumbbell,
  Wine, Croissant, Book, Fuel, Wrench, Bus, Plane, Monitor,
  Camera, HardHat, Wheat, HandHeart, Landmark, MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { createClient } from '../../../../src/lib/supabase/client';
import AnalyticsChart from '../../../components/dashboard/AnalyticsChart';

type Module = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
};

const COMPANY_TYPES_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  restaurant: { label: 'Restaurant', icon: <Building className="w-6 h-6" />, color: 'from-orange-500 to-red-500' },
  shop: { label: 'Boutique / Magasin', icon: <Store className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500' },
  delivery: { label: 'Livraison', icon: <Truck className="w-6 h-6" />, color: 'from-green-500 to-emerald-500' },
  hotel: { label: 'Hôtel', icon: <Hotel className="w-6 h-6" />, color: 'from-purple-500 to-indigo-500' },
  pharmacy: { label: 'Pharmacie', icon: <Pill className="w-6 h-6" />, color: 'from-red-500 to-rose-500' },
  beauty: { label: 'Salon de beauté', icon: <Scissors className="w-6 h-6" />, color: 'from-pink-500 to-rose-500' },
  agency: { label: 'Agence de services', icon: <Briefcase className="w-6 h-6" />, color: 'from-amber-500 to-orange-500' },
  supermarket: { label: 'Supermarché', icon: <ShoppingCart className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500' },
  tech: { label: 'Entreprise tech', icon: <Cpu className="w-6 h-6" />, color: 'from-cyan-500 to-blue-500' },
  school: { label: 'Établissement scolaire', icon: <GraduationCap className="w-6 h-6" />, color: 'from-yellow-500 to-amber-500' },
  medical: { label: 'Cabinet médical', icon: <Stethoscope className="w-6 h-6" />, color: 'from-sky-500 to-blue-500' },
  clinic: { label: 'Clinique / Hôpital', icon: <HeartPulse className="w-6 h-6" />, color: 'from-red-600 to-rose-600' },
  realestate: { label: 'Agence immobilière', icon: <Home className="w-6 h-6" />, color: 'from-violet-500 to-purple-500' },
  gym: { label: 'Salle de sport', icon: <Dumbbell className="w-6 h-6" />, color: 'from-lime-500 to-green-500' },
  bar: { label: 'Bar / Lounge', icon: <Wine className="w-6 h-6" />, color: 'from-fuchsia-500 to-pink-500' },
  bakery: { label: 'Boulangerie', icon: <Croissant className="w-6 h-6" />, color: 'from-amber-400 to-yellow-500' },
  library: { label: 'Librairie', icon: <Book className="w-6 h-6" />, color: 'from-stone-500 to-neutral-500' },
  gasstation: { label: 'Station-service', icon: <Fuel className="w-6 h-6" />, color: 'from-slate-500 to-gray-500' },
  repair: { label: 'Atelier de réparation', icon: <Wrench className="w-6 h-6" />, color: 'from-zinc-500 to-gray-600' },
  transport: { label: 'Transport', icon: <Bus className="w-6 h-6" />, color: 'from-teal-500 to-cyan-500' },
  travel: { label: 'Agence de voyage', icon: <Plane className="w-6 h-6" />, color: 'from-sky-400 to-blue-400' },
  cybercafe: { label: 'Cybercafé', icon: <Monitor className="w-6 h-6" />, color: 'from-indigo-500 to-blue-500' },
  photography: { label: 'Studio photo', icon: <Camera className="w-6 h-6" />, color: 'from-gray-500 to-slate-500' },
  construction: { label: 'Construction', icon: <HardHat className="w-6 h-6" />, color: 'from-amber-600 to-orange-600' },
  farm: { label: 'Ferme / Agricole', icon: <Wheat className="w-6 h-6" />, color: 'from-green-600 to-emerald-600' },
  ngo: { label: 'ONG / Organisation', icon: <HandHeart className="w-6 h-6" />, color: 'from-rose-500 to-pink-500' },
  bank: { label: 'Banque / Microfinance', icon: <Landmark className="w-6 h-6" />, color: 'from-blue-700 to-indigo-700' },
  other: { label: 'Autre', icon: <MoreHorizontal className="w-6 h-6" />, color: 'from-gray-400 to-gray-500' },
};

export default function EnterpriseDashboard() {
  const t = useTranslations('enterprise');
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();
  const realtimeChannels = useRef<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [companyType, setCompanyType] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [stats, setStats] = useState({
    totalCards: 0,
    activeCards: 0,
    suspendedCards: 0,
    revokedCards: 0,
    profileId: '',
    companyId: ''
  });

  const modules: Module[] = [
    {
      id: 'dashboard',
      title: t('modules.dashboard.title'),
      description: t('modules.dashboard.desc'),
      icon: <LayoutDashboard className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      path: '/dashboard/entreprise'
    },
    {
      id: 'org-cards',
      title: 'Cartes Membres',
      description: 'Créez et gérez les cartes d\'identité officielles de votre organisation',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'from-violet-500 to-purple-500',
      path: '/dashboard/entreprise/cards'
    },
    {
      id: 'settings',
      title: t('modules.settings.title'),
      description: t('modules.settings.desc'),
      icon: <Settings className="w-6 h-6" />,
      color: 'from-gray-500 to-gray-600',
      path: '/dashboard/entreprise/settings'
    }
  ];

  const fetchAndUpdateStats = async (companyId: string, userId: string) => {
    try {
      const { data: orgCards } = await supabase
        .from('org_cards')
        .select('status')
        .eq('org_id', companyId);

      setStats({
        totalCards: (orgCards || []).length,
        activeCards: (orgCards || []).filter((c: any) => c.status === 'active').length,
        suspendedCards: (orgCards || []).filter((c: any) => c.status === 'suspended').length,
        revokedCards: (orgCards || []).filter((c: any) => c.status === 'revoked').length,
        profileId: userId,
        companyId
      });
    } catch (err) {
      console.error('❌ Erreur chargement stats:', err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  const openTypeModal = () => setShowTypeModal(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/auth/sign-in'); return; }
        setLoading(true);

        const [{ data: profile }, { data: company }] = await Promise.all([
          supabase.from('profiles').select('plan').eq('id', user.id).single(),
          supabase.from('companies').select('*').eq('owner_id', user.id).maybeSingle()
        ]);

        const plan = profile?.plan?.toLowerCase();
        if (!company && plan !== 'entreprise') { router.push('/dashboard'); return; }
        if (!company) { alert('Votre compte entreprise est en cours de configuration...'); router.push('/dashboard'); return; }

        setCompanyName(company.name || '');
        setCompanyType(company.company_type || null);

        // ✅ Si pas de type → rediriger vers le choix
        if (!company.company_type) {
          setShowTypeModal(true);
        }

        await fetchAndUpdateStats(company.id, user.id);

        const orgCardsChannel = supabase
          .channel(`org-cards-${company.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'org_cards', filter: `org_id=eq.${company.id}` },
            () => fetchAndUpdateStats(company.id, user.id))
          .subscribe();

        realtimeChannels.current = [orgCardsChannel];
      } catch (err: any) {
        console.error('❌ Init échouée:', err);
        router.push('/dashboard');
      }
    };
    init();
    return () => { realtimeChannels.current.forEach(ch => ch?.unsubscribe?.()); };
  }, []);

  const typeInfo = companyType ? COMPANY_TYPES_MAP[companyType] : null;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 flex justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[2px] h-8 bg-gradient-to-b from-cyan-300 to-blue-500 origin-bottom animate-spin-slow"></div>
                </div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-sm opacity-70 animate-pulse"></div>
                <div className="absolute inset-6 rounded-full bg-slate-950"></div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Chargement...</h3>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête avec type d'entreprise */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 mb-6 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
          <Building className="w-10 h-10 text-indigo-300" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-200 via-cyan-200 to-purple-200 bg-clip-text text-transparent">
          {companyName || t('title')}
        </h1>
        
        {/* ✅ Catégorie / Type d'entreprise */}
        <div className="mt-4 flex items-center justify-center gap-3">
          {typeInfo ? (
            <Badge className={`px-4 py-2 text-sm bg-gradient-to-r ${typeInfo.color} text-white border-0 shadow-lg`}>
              <span className="mr-2">{typeInfo.icon}</span>
              {typeInfo.label}
            </Badge>
          ) : (
            <Button onClick={openTypeModal} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              ⚠️ Définir votre catégorie
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
        <p className="text-gray-300 mt-4 max-w-3xl mx-auto text-lg">
          {t('subtitle')}
        </p>
      </div>

      {/* Stats spécifiques selon le type */}
      {typeInfo && (
        <div className="glass-border bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            {typeInfo.icon}
            Configuration {typeInfo.label}
          </h3>
          <p className="text-gray-400 text-sm">
            {companyType === 'restaurant' && '🍽️ Gérez votre menu, vos réservations et vos commandes en ligne.'}
            {companyType === 'shop' && '🛍️ Ajoutez vos produits, gérez votre stock et vos promotions.'}
            {companyType === 'hotel' && '🏨 Configurez vos chambres, vos tarifs et vos réservations.'}
            {companyType === 'pharmacy' && '💊 Gérez votre stock de médicaments et vos gardes.'}
            {companyType === 'beauty' && '💇‍♀️ Proposez vos services, gérez vos rendez-vous.'}
            {companyType === 'school' && '🎓 Gérez vos classes, vos élèves et votre calendrier.'}
            {companyType === 'tech' && '💻 Présentez vos services numériques et votre portfolio.'}
            {!['restaurant', 'shop', 'hotel', 'pharmacy', 'beauty', 'school', 'tech'].includes(companyType || '') && 
              '⚙️ Configurez les informations spécifiques à votre activité.'}
          </p>
          <Button 
            onClick={() => router.push(`/dashboard/entreprise/setup/${companyType}`)}
            className="mt-4 bg-gradient-to-r from-cyan-600 to-blue-600"
          >
            Configurer
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Statistiques des cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total cartes", value: stats.totalCards, color: "from-blue-500 to-cyan-500" },
          { title: "Cartes actives", value: stats.activeCards, color: "from-emerald-500 to-teal-500" },
          { title: "Suspendues", value: stats.suspendedCards, color: "from-amber-500 to-orange-500" },
          { title: "Révoquées", value: stats.revokedCards, color: "from-red-500 to-rose-500" }
        ].map((stat, index) => (
          <Card key={index} className="glass-border overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphique */}
      {!loading && (
        <div className="glass-border bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <AnalyticsChart profileId={stats.profileId} />
        </div>
      )}

      {/* Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card 
            key={module.id}
            className="glass-border overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-white/5"
            onClick={() => router.push(module.path)}
          >
            <CardHeader className="pb-4 pt-6 px-6">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {module.icon}
              </div>
              <CardTitle className="text-white text-lg font-semibold group-hover:text-cyan-300 transition-colors">
                {module.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <p className="text-gray-400 text-sm leading-relaxed">{module.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de choix du type (intégré directement) */}
      {showTypeModal && (
        <CompanyTypeInlineModal
          companyId={stats.companyId}
          onClose={() => setShowTypeModal(false)}
          onSaved={(type) => {
            setCompanyType(type);
            setShowTypeModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

// 🔹 Modal inline pour le choix du type (version simplifiée)
function CompanyTypeInlineModal({ companyId, onClose, onSaved }: { companyId: string; onClose: () => void; onSaved: (type: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('companies').update({ company_type: selected, updated_at: new Date().toISOString() }).eq('id', companyId);
    if (error) { alert('Erreur'); setSaving(false); return; }
    onSaved(selected);
  };

  const types = Object.entries(COMPANY_TYPES_MAP);

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/10 shadow-2xl max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-4">Choisissez votre catégorie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {types.map(([id, info]) => (
            <div
              key={id}
              onClick={() => setSelected(id)}
              className={`cursor-pointer p-4 rounded-xl text-center border transition-all ${
                selected === id ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:border-white/30'
              }`}
            >
              <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center`}>
                {info.icon}
              </div>
              <p className="text-xs text-white font-medium">{info.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-white/20 text-gray-300">Plus tard</Button>
          <Button onClick={handleSave} disabled={!selected || saving} className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600">
            {saving ? 'Enregistrement...' : 'Confirmer'}
          </Button>
        </div>
      </div>
    </div>
  );
}