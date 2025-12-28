// src/app/[locale]/[username]/page.tsx
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Mail, Phone, MapPin, ExternalLink, MessageCircle, UserCheck } from 'lucide-react';
import LikeButton from '../../../components/profile/LikeButton';
import ScanTracker from '../../../components/profile/ScanTracker';
import ProfileActions from '../../../components/profile/ProfileActions';

const getWhatsAppLink = (phone: string, name: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=Bonjour%20${encodeURIComponent(name)},%20je%20vous%20contacte%20via%20LUVIKA.`;
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  if (!['fr', 'ln', 'en'].includes(locale)) notFound();

  const decodedUsername = decodeURIComponent(username).toLowerCase();

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set({ name, value, ...options }); },
        remove(name, options) { cookieStore.delete({ name, ...options }); },
      },
    }
  );

  // ✅ Recherche robuste
  let {  data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', decodedUsername.trim())
    .maybeSingle();

  if (!profile && !error) {
    const fallback = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${decodedUsername.trim()}%`)
      .limit(1)
      .maybeSingle();
    profile = fallback.data;
    error = fallback.error;
  }

  if (error || !profile) {
    console.error('❌ Profil introuvable:', { username: decodedUsername });
    notFound();
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  const currentUser = user as User | null;
  const isOwner = currentUser?.id === profile.id;
  const isAdmin = currentUser?.user_metadata?.role === 'admin';

  if (!profile.is_public && !isOwner && !isAdmin) {
    notFound();
  }

  const activeOrLostCards = (profile.nfc_cards || []).filter(
    (card: any) => card.status === 'active' || card.status === 'lost'
  );
  const hasLostCard = activeOrLostCards.some((card: any) => card.status === 'lost');

  return (
    <div suppressHydrationWarning={true} className="min-h-screen bg-gradient-to-br text-white">
      <header className="py-6 px-4 text-center relative">
        {hasLostCard && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-900/50 border border-yellow-500/30 text-yellow-200 px-4 py-2 rounded-full max-w-md">
            ⚠️ Cette carte a été déclarée perdue. Veuillez contacter directement la personne.
          </div>
        )}
        <div className="mt-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-bold mb-4">
            {profile.full_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{profile.full_name}</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gray-300">{profile.job_title}</span>
            {profile.subscriptions?.[0]?.active && (
              <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {profile.subscriptions[0].plan === 'premium' ? 'Premium' : 'Entreprise'}
              </Badge>
            )}
          </div>
          {profile.bio_short && (
            <p className="text-gray-300 max-w-2xl mx-auto mb-4">{profile.bio_short}</p>
          )}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <span className={`w-3 h-3 rounded-full ${hasLostCard ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            <span>{hasLostCard ? 'Carte déclarée perdue' : 'Carte active'}</span>
          </div>
        </div>

        <div className="mt-6">
          <LikeButton profileId={profile.id} initialLikes={profile.likes_count || 0} />
          {profile.id && <ScanTracker profileId={profile.id} />}
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12 max-w-4xl">
        <Card className="glass-border mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="text-blue-300" size={20} />
              Me contacter
            </h2>
            {/* ✅ Actions déplacées vers Client Component */}
            <ProfileActions profile={profile} />
          </CardContent>
        </Card>

        {(profile.website || profile.instagram || profile.portfolio_url) && (
          <Card className="glass-border mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Liens</h2>
              <div className="space-y-3">
                {profile.website && (
                  <Link href={profile.website} target="_blank" className="block">
                    <Button variant="outline" className="w-full justify-between border-white/10 hover:bg-white/5">
                      Site web <ExternalLink size={16} />
                    </Button>
                  </Link>
                )}
                {profile.instagram && (
                  <Link 
                    href={`https://instagram.com/${profile.instagram}`} // ✅ sans espaces
                    target="_blank" 
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-between border-white/10 hover:bg-white/5">
                      Instagram: @{profile.instagram} <ExternalLink size={16} />
                    </Button>
                  </Link>
                )}
                {profile.portfolio_url && (
                  <Link href={profile.portfolio_url} target="_blank" className="block">
                    <Button variant="outline" className="w-full justify-between border-white/10 hover:bg-white/5">
                      Portfolio <ExternalLink size={16} />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {profile.bio_long && (
          <Card className="glass-border">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-3">À propos</h2>
              <p className="text-gray-300 whitespace-pre-line">{profile.bio_long}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Partagé via LUVIKA — Révèle qui tu es.</p>
          <p className="mt-1">
            <Link href="/" className="hover:text-blue-300 flex items-center justify-center gap-1">
              luvika.dev <ExternalLink size={12} />
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}