// src/app/dashboard/nfc/add/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AddNFCPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data : { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/sign-in');

  // ✅ Récupère le plan actuel
  const { data } = await supabase
    .from('profiles')
    .select('subscription(plan)')
    .eq('id', user.id)
    .single();

  const currentPlan = data?.subscription?.[0]?.plan || 'freemium';
  const isPremium = currentPlan === 'premium' || currentPlan === 'entreprise';

  if (!isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br text-white px-4">
        <div className="text-center max-w-md w-full p-6 glass-border rounded-2xl border border-white/10">
          <div className="w-16 h-16 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center mb-5">
            <span className="text-3xl">💳</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-3">✨ Débloquez les cartes NFC</h1>
          
          <p className="text-gray-300 mb-6">
            Le plan <span className="font-semibold text-cyan-300">Freemium</span> permet 1 seule carte.  
            Passez à <span className="font-semibold text-cyan-400">Premium</span> ou <span className="font-semibold text-purple-400">Entreprise</span> pour :
          </p>

          <ul className="text-left space-y-2 mb-8 max-w-xs mx-auto text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✅</span>
              <span>Cartes NFC illimitées</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✅</span>
              <span>Statistiques avancées</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✅</span>
              <span>Support prioritaire</span>
            </li>
          </ul>

          <div className="space-y-4">
            <Link href="/pricing" className="block">
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 py-3 text-base">
                💰 Voir les plans & tarifs
              </Button>
            </Link>

            {/* ✅ Option : upgrade direct via API (sans nouveau compte) */}
            <form 
              action="/api/upgrade-checkout"
              method="POST"
              className="w-full"
            >
              <input type="hidden" name="user_id" value={user.id} />
              <input type="hidden" name="target_plan" value="premium" />
              <Button
                type="submit"
                variant="outline"
                className="w-full py-3 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
              >
                🔑 Passer à Premium (12 €/mois)
              </Button>
            </form>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Aucun nouveau compte requis — mise à niveau instantanée de votre compte actuel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mb-6 group">
          <span className="text-lg">←</span>
          <span className="group-hover:underline">Retour au tableau de bord</span>
        </Link>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">📱</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Ajouter une carte NFC</h1>
          <p className="text-gray-400">
            Associez une nouvelle carte à votre profil intelligent.
          </p>
        </div>

        <div className="glass-border rounded-2xl p-6 text-center border border-white/10">
          <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">👆</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-3">Prêt à scanner ?</h2>
          <p className="text-gray-300 mb-6">
            1. Activez le NFC sur votre téléphone<br />
            2. Approchez la carte vierge<br />
            3. Confirmez l’écriture
          </p>
          <Button 
            className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-cyan-500"
            onClick={() => {
              // ✅ À remplacer par useNFC() quand prêt
              alert('✨ Fonctionnalité NFC en développement — bientôt disponible !');
            }}
          >
            ➕ Ajouter une nouvelle carte
          </Button>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>❓ Besoin d’aide ? <Link href="/contact" className="text-cyan-400 hover:underline">Contactez-nous</Link></p>
        </div>
      </div>
    </div>
  );
}