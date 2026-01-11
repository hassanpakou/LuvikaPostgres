'use client';

import Link from 'next/link';
import { LayoutDashboard, FileText, Users, CreditCard, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

const menu = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Demandes Upgrade', icon: FileText, href: '/admin/admin/upgrade-requests' },
  { name: 'Utilisateurs', icon: Users, href: '/admin/admin/users' },
  { name: 'Abonnements', icon: CreditCard, href: '/admin/admin/subscriptions' },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  return (
    <>
      {/* Fond animé subtil */}
      <div className="fixed left-0 top-0 h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 animate-gradient-x -z-10"></div>

      <aside
        className={`
          fixed left-0 top-0 h-screen z-40
          bg-slate-900/40 backdrop-blur-xl border-r border-white/10
          shadow-xl shadow-black/40
          transition-all duration-500
          ${collapsed ? 'w-20' : 'w-64'}
          flex flex-col justify-between
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          {!collapsed && <span className="text-white font-semibold text-lg">LUVIKA Admin</span>}
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-col gap-2 px-1">
          {menu.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                text-slate-300 hover:text-white
                hover:bg-white/10 transition-all duration-300
                ${collapsed ? 'justify-center' : 'justify-start'}
              `}
            >
              <item.icon className="w-5 h-5 text-cyan-300" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Signature en bas */}
        <div className={`px-4 py-3 text-xs text-slate-400 ${collapsed ? 'text-center' : ''}`}>
          {!collapsed ? (
            <>Fait à Kinshasa avec <span className="text-red-500">♥</span> Luvika révèle qui tu-es</>
          ) : (
            <span className="text-red-500">♥</span>
          )}
        </div>
      </aside>

      {/* Bouton flottant collapse - toujours visible */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          fixed top-1/2
          ${collapsed ? 'left-20' : 'left-64'} -translate-y-1/2
          w-8 h-8 flex items-center justify-center
          bg-slate-800/70 border border-white/20
          backdrop-blur-lg rounded-full
          hover:bg-slate-700/80
          shadow-lg shadow-cyan-500/50
          hover:shadow-cyan-400/70
          transition-all duration-300 z-50
        `}
      >
        {collapsed ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronLeft className="w-4 h-4 text-white" />}
      </button>

      {/* Bouton flottant Aide */}
      {showHelp && (
        <div
          className={`
            fixed bottom-6 transition-all duration-500 z-50
            flex items-center bg-slate-800/70 backdrop-blur-lg border border-white/20
            rounded-lg px-4 py-3 shadow-lg shadow-black/50
            ${collapsed ? 'right-6 opacity-70 w-12 justify-center' : 'right-6'}
          `}
        >
          {!collapsed && <span className="text-white mr-3 text-sm">Besoin d'aide ?</span>}
          <button
            onClick={() => setShowHelp(false)}
            className="w-5 h-5 flex items-center justify-center text-white hover:text-red-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Animation background */}
      <style jsx>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </>
  );
}
