// src/app/dashboard/entreprise/communication/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../../components/ui/card';
import { Megaphone, MessageSquare, Users } from 'lucide-react';
import { Button } from '../../../../../components/ui/button';
import { Textarea } from '../../../../../components/ui/textarea';
import { useTranslations } from 'next-intl';

export default function CommunicationPage() {
  const t = useTranslations('enterprise.modules.communication');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data : company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      await supabase
        .from('internal_messages')
        .insert({
          company_id: company.id,
          sender_id: user.id,
          message: message.trim(),
          scope: 'all', // ou 'department', 'role'
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
      <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      
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