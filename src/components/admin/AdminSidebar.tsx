'use client';

import Link from 'next/link';
import { LayoutDashboard, FileText, Users, CreditCard } from 'lucide-react';

const menu = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Demandes Upgrade', icon: FileText, href: '/admin/admin/upgrade-requests' },
  { name: 'Utilisateurs', icon: Users, href: '/admin/admin/users' },
  { name: 'Abonnements', icon: CreditCard, href: '/admin/admin/subscriptions' },
];

export function AdminSidebar() {
  return (
    <aside className="
      fixed left-0 top-0 h-screen w-64 z-40
      bg-slate-900/50
      backdrop-blur-xl
      border-r border-white/10
      shadow-xl shadow-black/40
    ">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <span className="text-white font-semibold text-lg">LUVIKA Admin</span>
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="
              flex items-center gap-3 px-4 py-3 rounded-lg
              text-slate-300 hover:text-white
              hover:bg-white/10 transition
            "
          >
            <item.icon className="w-5 h-5 text-cyan-300" />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
