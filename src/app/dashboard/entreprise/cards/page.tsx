// src/app/dashboard/entreprise/cards/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../../../src/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { IdCard, ArrowLeft } from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../../components/ui/button';

export default function CardsPage() {
  const t = useTranslations('enterprise.modules.cards');
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchCards = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!company) return;

      const { data } = await supabase
        .from('cards')
        .select('*, employees(full_name, position)')
        .eq('company_id', company.id);

      setCards(data || []);
      setLoading(false);
    };

    fetchCards();
  }, []);

  const handleUpdateStatus = async (cardId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .update({ status: newStatus })
        .eq('id', cardId);
      
      if (error) throw error;
      
      setCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, status: newStatus } : c
      ));
      toast.success('✅ Statut de la carte mis à jour');
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('❌ Erreur lors de la mise à jour');
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
                <div className="flex items-center gap-2">
                  <Badge className={
                    card.status === 'active' ? 'bg-green-500/20 text-green-300' :
                    card.status === 'lost' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-300'
                  }>
                    {card.status}
                  </Badge>
                  <Select
                    value={card.status}
                    onValueChange={(value) => handleUpdateStatus(card.id, value)}
                  >
                    <SelectTrigger className="w-28 bg-white/5 border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">✅ Active</SelectItem>
                      <SelectItem value="lost">⚠️ Perdue</SelectItem>
                      <SelectItem value="deactivated">❌ Désactivée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}