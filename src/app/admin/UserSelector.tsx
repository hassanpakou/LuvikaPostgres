// src/app/(admin)/UserSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, ChevronDown, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

// ✅ Déplacé dans un fichier séparé pour cohérence
export type User = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  subscription_plan: 'basic' | 'premium' | 'entreprise';
};

type Props = {
  onSelect: (user: User | null) => void;
  selectedUser: User | null;
  displayField?: 'email' | 'username' | 'full_name';
};

export default function UserSelector({
  onSelect,
  selectedUser,
  displayField = 'email',
}: Props) {
  const t = useTranslations();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 🔹 Chargement utilisateurs
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const url = search 
          ? `/api/admin/users?search=${encodeURIComponent(search)}`
          : '/api/admin/users';
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('❌ Erreur chargement utilisateurs:', err.message || err);
        setUsers([]);
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

  const getPrimaryText = (user: User) => {
    switch (displayField) {
      case 'email': return user.email;
      case 'username': return `@${user.username}`;
      default: return user.full_name;
    }
  };

  const getSecondaryText = (user: User) => {
    const parts = [];
    if (displayField !== 'full_name' && user.full_name) parts.push(user.full_name);
    if (displayField !== 'username') parts.push(`@${user.username}`);
    if (displayField !== 'email') parts.push(user.email);
    return parts.join(' • ');
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-white/5 border border-white/10 hover:bg-white/10 text-left"
      >
        <div className="flex-1 truncate">
          {selectedUser ? (
            <div>
              <div className="font-medium text-white truncate">
                {getPrimaryText(selectedUser)}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {getSecondaryText(selectedUser)}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">{t('admin.user_selector.placeholder')}</span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          {selectedUser && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
              {t(`admin.plans.${selectedUser.subscription_plan}`)}
            </Badge>
          )}
          {selectedUser ? (
            <X
              className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer"
              onClick={clearSelection}
            />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full glass-border backdrop-blur-xl rounded-lg shadow-2xl border border-white/10 max-h-60 overflow-auto">
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('admin.user_selector.search')}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                autoFocus
              />
            </div>
          </div>

          <div className="p-1">
            {loading ? (
              <div className="px-4 py-3 text-gray-400 text-center">
                {t('admin.user_selector.loading')}
              </div>
            ) : users.length === 0 ? (
              <div className="px-4 py-3 text-gray-400 text-center">
                {t('admin.user_selector.no_results')}
              </div>
            ) : (
              users.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left hover:bg-white/10 rounded-md"
                  onClick={() => handleSelect(user)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {getPrimaryText(user)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {getSecondaryText(user)}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-300 text-xs">
                    {t(`admin.plans.${user.subscription_plan || 'basic'}`)}
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

// 🔹 Composant Badge — déplacé pour réutilisation
export function Badge({ 
  children, 
  className = '', 
  variant = 'default' 
}: { 
  children: React.ReactNode; 
  className?: string;
  variant?: 'default' | 'secondary';
}) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}