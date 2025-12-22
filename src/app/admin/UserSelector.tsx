// src/components/admin/UserSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type User = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  subscription_plan: 'basic' | 'premium' | 'entreprise';
};

export default function UserSelector({
  onSelect,
  selectedUser,
}: {
  onSelect: (user: User | null) => void;
  selectedUser: User | null;
}) {
  const t = useTranslations();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 🔍 Récupère les utilisateurs (à remplacer par un appel API sécurisé)
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        // ✅ Remplace par ton API route admin (ex: /api/admin/users)
        const res = await fetch('/api/admin/users?search=' + encodeURIComponent(search));
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  const handleSelect = (user: User) => {
    onSelect(user);
    setIsOpen(false);
    setSearch('');
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-white/5 border border-white/10 hover:bg-white/10"
      >
        {selectedUser ? (
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">
              {selectedUser.full_name} (@{selectedUser.username})
            </span>
            <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-300">
              {t(`admin.plans.${selectedUser.subscription_plan}`)}
            </Badge>
          </div>
        ) : (
          <span className="text-gray-400">{t('admin.user_selector.placeholder')}</span>
        )}
        {selectedUser ? (
          <X className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer" onClick={clearSelection} />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full glass-border max-h-60 overflow-auto">
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('admin.user_selector.search')}
                className="pl-10 bg-white/5 border-white/10 text-white"
                autoFocus
              />
            </div>
          </div>
          
          <div className="p-1">
            {loading ? (
              <div className="px-4 py-2 text-gray-400">{t('admin.user_selector.loading')}</div>
            ) : users.length === 0 ? (
              <div className="px-4 py-2 text-gray-400">{t('admin.user_selector.no_results')}</div>
            ) : (
              users.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left hover:bg-white/5"
                  onClick={() => handleSelect(user)}
                >
                  <div>
                    <div className="font-medium text-white">{user.full_name}</div>
                    <div className="text-sm text-gray-400">@{user.username} • {user.email}</div>
                  </div>
                  <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-300">
                    {t(`admin.plans.${user.subscription_plan}`)}
                  </Badge>
                </Button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant simple pour Badge (si pas déjà créé)
const Badge = ({ children, className, variant }: { 
  children: React.ReactNode; 
  className?: string;
  variant?: 'default' | 'secondary';
}) => {
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${className}`}>
      {children}
    </span>
  );
};