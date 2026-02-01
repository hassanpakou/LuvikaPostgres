// src/app/dashboard/entreprise/communication/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../../components/ui/card';
import { Megaphone, MessageSquare, Users, ArrowLeft } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Textarea } from '../../../../../components/ui/textarea';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function CommunicationPage() {
  const t = useTranslations('enterprise.modules.communication');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null); // ✅ Ajoutez cet état
  const [messages, setMessages] = useState<any[]>([]); // ✅ Pour afficher les messages reçus
  const router = useRouter();
  const supabase = createClient();

  // 🔹 useEffect : Récupération companyId
  useEffect(() => {
    const fetchCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (company) {
        setCompanyId(company.id);
      }
    };

    fetchCompany();
  }, []);

  // 🔹 useEffect : Écoute temps réel des messages
  useEffect(() => {
    if (!companyId) return;

    const handleNewMessage = (payload: any) => {
      setMessages(prev => [payload.new, ...prev]);
      // 🔔 Notification visuelle ou sonore
      if (typeof window !== 'undefined') {
        // Option 1 : Son
        const audio = new Audio('/sounds/message.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => console.log('Audio play failed:', err));
        
        // Option 2 : Notification browser (optionnel)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nouveau message', {
            body: payload.new.message,
            icon: '/logo.png'
          });
        }
      }
    };

    const channel = supabase
      .channel('comms')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public',
        table: 'internal_messages',
        filter: `company_id=eq.${companyId}`
      }, handleNewMessage)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId]);

  const handleBroadcast = async () => {
    if (!message.trim() || !companyId) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('internal_messages')
        .insert({
          company_id: companyId,
          sender_id: user.id,
          message: message.trim(),
          scope: 'all',
          created_at: new Date().toISOString()
        });

      setMessage('');
      alert(t('sent_success'));
    } catch (err) {
      console.error(err);
      alert(t('sent_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/entreprise')}
          className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      </div>
      
      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-rose-400" />
            {t('broadcast_title')}
          </CardTitle>
          <CardDescription>{t('broadcast_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('message_placeholder')}
            className="min-h-[120px] mb-4"
          />
          <Button 
            onClick={handleBroadcast} 
            disabled={loading || !message.trim()}
            className="w-full"
          >
            {loading ? t('sending') : t('send_broadcast')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}