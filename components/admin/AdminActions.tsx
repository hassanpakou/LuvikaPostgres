// src/components/admin/AdminActions.tsx
'use client'; // ✅ Obligatoire pour useState

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Package, Users, CreditCard, Shield, Scan, BarChart3 } from 'lucide-react';
import UserSelector from '../../src/app/(admin)/UserSelector';

type User = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  subscription_plan: 'basic' | 'premium' | 'entreprise';
};

export default function AdminActions() {
  const t = useTranslations();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSendWelcomeEmail = async () => {
    if (!selectedUser) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/admin/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUser.id }),
      });

      const result = await res.json();
      
      if (res.ok) {
        alert(t('admin.actions.email_success'));
      } else {
        throw new Error(result.error || t('admin.actions.email_error'));
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      alert(`❌ ${err.message || t('admin.actions.error_generic')}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              {t('admin.stats.total_users')}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,248</div>
            <p className="text-xs text-green-400">+12% depuis le mois</p>
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              {t('admin.stats.active_subscriptions')}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">872</div>
            <p className="text-xs text-green-400">+8% depuis le mois</p>
          </CardContent>
        </Card>

        <Card className="glass-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              {t('admin.stats.total_scans')}
            </CardTitle>
            <Scan className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">24,561</div>
            <p className="text-xs text-green-400">+24% depuis le mois</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Send className="h-5 w-5" />
            {t('admin.actions.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 glass-border">
              <div>
                <h3 className="font-medium text-white">{t('admin.actions.welcome_email.title')}</h3>
                <p className="text-sm text-gray-400">
                  {t('admin.actions.welcome_email.description')}
                </p>
                <div className="mt-3 max-w-xs">
                  <UserSelector 
                    onSelect={setSelectedUser} 
                    selectedUser={selectedUser} 
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleSendWelcomeEmail}
                disabled={!selectedUser || isSending}
                className="bg-gradient-to-r from-blue-600 to-cyan-500"
              >
                {isSending ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2">⚙️</span>
                    {t('admin.actions.sending')}
                  </span>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t('admin.actions.welcome_email.button')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { icon: CreditCard, key: 'subscriptions' },
          { icon: Shield, key: 'nfc' },
          { icon: Users, key: 'users' },
          { icon: BarChart3, key: 'analytics' },
          // ✅ Ajouté : Commandes
          { icon: Package, key: 'orders' },
        ].map(({ icon: Icon, key }) => (
          <Card key={key} className="glass-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-300">
                <Icon className="h-5 w-5" />
                {t(`admin.modules.${key}.title`)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                {t(`admin.modules.${key}.description`)}
              </p>
              <Button 
                variant="outline" 
                className="w-full border-blue-500 text-blue-300 hover:bg-blue-500/10"
                asChild
              >
                <a href={`/admin/${key}`}>
                  {t(`admin.modules.${key}.action`)}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
         </div>
  );
}