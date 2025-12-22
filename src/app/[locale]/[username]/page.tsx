// src/app/[locale]/[username]/page.tsx
// Profil public — Server Component (rapide + sécurisé)

import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr'; // ✅ Utilise @supabase/ssr
//import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Phone, Mail, MapPin, ExternalLink, MessageCircle, UserCheck } from 'lucide-react';
import LikeButton from '../../../components/profile/LikeButton';
// ✅ Fonction WhatsApp — sans espaces
const getWhatsAppLink = (phone: string, name: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=Bonjour ${encodeURIComponent(name)}, je vous contacte via LUVIKA.`;
};

// ✅ Fonction SMS
const getSMSLink = (phone: string) => {
  return `sms:${phone}`;
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>; // ✅
}) {
  const { locale, username } = await params; // ✅ Destructure les deux
    if (!['fr', 'ln', 'en'].includes(locale)) notFound();
  const decodedUsername = decodeURIComponent(username);

  
  // 🔐 Crée le client Supabase avec @supabase/ssr
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

  // 🔍 Récupère le profil
  const { data: {  profile, error }} = await supabase
    .from('profiles')
    .select(`
      *,
      nfc_cards!inner(status, lost_reason),
      subscriptions!inner(plan, active)
    `)
    .eq('username', decodedUsername) // ✅ decodedUsername
    .single();

  if (error || !profile) notFound();

  // 🔐 Vérifie visibilité
  const { data: {  session }} = await supabase.auth.getSession();
  const isOwner = session?.user?.id === profile.id;
  const isAdmin = session?.user?.user_metadata?.role === 'admin';
  if (!profile.is_public && !isOwner && !isAdmin) notFound();

  // Statut carte
  const activeOrLostCards = profile.nfc_cards?.filter(
    (card: any) => card.status === 'active' || card.status === 'lost'
  ) || [];
  const hasLostCard = activeOrLostCards.some((card: any) => card.status === 'lost');

  // 🔥 Enregistre le scan (fire-and-forget)
  fetch('/api/scans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile_id: profile.id,
      scan_type: 'qr_profile',
    }),
  }).catch(console.warn);

  return (
    <div className="min-h-screen bg-gradient-to-br from-night-blue-900 to-black text-white">
      {/* En-tête */}
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
      </header>
{/* 👇 Ajoute ceci juste après le titre ou dans une section dédiée */}
<div className="mt-4">
  <LikeButton profileId={profile.id} initialLikes={profile.likes_count || 0} />
</div>
      <main className="container mx-auto px-4 pb-12 max-w-4xl">
        {/* Contact */}
        <Card className="glass-border mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="text-blue-300" size={20} />
              Me contacter
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.email && (
                <Button
                  variant="outline"
                  className="justify-start border-white/10 hover:bg-white/5"
                  onClick={() => window.location.href = `mailto:${profile.email}`}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {profile.email}
                </Button>
              )}

              {profile.phone && (
                <Button
                  variant="outline"
                  className="justify-start border-white/10 hover:bg-white/5"
                  onClick={() => window.location.href = getSMSLink(profile.phone)}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {profile.phone}
                </Button>
              )}

              {profile.whatsapp && (
                <Button
                  variant="outline"
                  className="justify-start border-white/10 hover:bg-white/5"
                  onClick={() => window.open(getWhatsAppLink(profile.whatsapp, profile.full_name), '_blank')}
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-green-400" />
                  WhatsApp
                </Button>
              )}

              {profile.address && (
                <Button
                  variant="outline"
                  className="justify-start border-white/10 hover:bg-white/5"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(profile.address)}`, '_blank')} // ✅ sans espaces
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {profile.address}
                </Button>
              )}
            </div>

            {/* Sauvegarder contact */}
            
            <Button
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400"
              onClick={async () => {
                const vCard = `
BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name}
ORG:${profile.company || ''}
TITLE:${profile.job_title || ''}
TEL;TYPE=WORK,VOICE:${profile.phone || ''}
TEL;TYPE=CELL,VOICE:${profile.whatsapp || ''}
EMAIL:${profile.email || ''}
ADR;TYPE=WORK:;;${profile.address || ''};;;;
URL:${profile.website || ''}
NOTE:Contact via LUVIKA — luvika.me/${decodedUsername}
END:VCARD
`.trim().replace(/\n/g, '\r\n');

                const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${profile.username}.vcf`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }, 100);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Sauvegarder le contact (.vcf)
            </Button>
          </CardContent>
        </Card>

        {/* Liens */}
        {(profile.website || profile.instagram || profile.portfolio_url) && (
          <Card className="glass-border mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Liens</h2>
              <div className="space-y-3">
                {profile.website && (
                  <Link href={profile.website} target="_blank" className="block">
                    <Button variant="outline" className="w-full justify-between border-white/10 hover:bg-white/5">
                      Site web
                      <ExternalLink size={16} />
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
                      Instagram: @{profile.instagram}
                      <ExternalLink size={16} />
                    </Button>
                  </Link>
                )}
                {profile.portfolio_url && (
                  <Link href={profile.portfolio_url} target="_blank" className="block">
                    <Button variant="outline" className="w-full justify-between border-white/10 hover:bg-white/5">
                      Portfolio
                      <ExternalLink size={16} />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bio longue */}
        {profile.bio_long && (
          <Card className="glass-border">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-3">À propos</h2>
              <p className="text-gray-300 whitespace-pre-line">{profile.bio_long}</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Partagé via LUVIKA — Révèle qui tu es.</p>
          <p className="mt-1">
            <Link href="/" className="hover:text-blue-300 flex items-center justify-center gap-1">
              luvika.dev
              <ExternalLink size={12} />
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}