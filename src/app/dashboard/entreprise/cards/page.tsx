// src/app/dashboard/entreprise/cards/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IdCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export default function CardsPage() {
  const t = useTranslations('enterprise.modules.cards');
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCards = async () => {
      const { data : { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data : company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      // Hypothèse : table `cards` liée à `employees`
      const {  data } = await supabase
        .from('cards')
        .select('*, employees(full_name, position)')
        .eq('company_id', company.id);

      setCards(data || []);
      setLoading(false);
    };

    fetchCards();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map(card => (
          <Card key={card.id} className="glass-border">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <IdCard className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <CardTitle>{card.employees?.full_name || '—'}</CardTitle>
                <p className="text-sm text-gray-400">{card.employees?.position || '—'}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">ID: {card.card_id}</span>
                <Badge className={
                  card.status === 'active' ? 'bg-green-500/20 text-green-300' :
                  card.status === 'lost' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-gray-500/20 text-gray-300'
                }>
                  {card.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}