// src/components/admin/AdminSidebar.tsx (remplacez votre fichier actuel)
'use client';

import Link from 'next/link';
import { 
  LayoutDashboard, FileText, Users, CreditCard, 
  ChevronLeft, ChevronRight, X, Sparkle 
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAdminLayout } from '@/src/contexts/AdminLayoutContext';

const menu = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Demandes Upgrade', icon: FileText, href: '/admin/upgrade-requests' },
  { name: 'Utilisateurs', icon: Users, href: '/admin/users' },
  { name: 'Abonnements', icon: CreditCard, href: '/admin/subscriptions' },
];

export function AdminSidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useAdminLayout();
  const [showHelp, setShowHelp] = useState(true);
  const [floatingElements, setFloatingElements] = useState<Array<{id: number, x: number, y: number, size: number}>>([]);

  useEffect(() => {
    const elements = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
    }));
    setFloatingElements(elements);
  }, []);

  // Synchronise l'état collapsed avec le contexte
  const collapsed = isSidebarCollapsed;

  return (
    <>
      {/* Fond animé */}
      <div className="fixed left-0 top-0 h-screen w-screen overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 animate-gradient-x"></div>
        {floatingElements.map((el) => (
          <div
            key={el.id}
            className="absolute rounded-full bg-cyan-500/10 animate-float"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.size}px`,
              height: `${el.size}px`,
              animationDelay: `${el.id * 2}s`,
              animationDuration: `${15 + el.id * 3}s`,
            }}
          />
        ))}
      </div>

      <aside
        className={`
          fixed left-0 top-0 h-screen z-40
          bg-slate-900/40 backdrop-blur-xl border-r border-white/10
          shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${collapsed ? 'w-20' : 'w-64'}
          flex flex-col justify-between overflow-hidden
        `}
      >
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <Sparkle className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">LUVIKA</span>
            </div>
          )}
        </div>

        <nav className="mt-6 flex flex-col gap-1 px-2">
          {menu.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group relative flex items-center gap-3 px-4 py-3 rounded-xl
                text-slate-300 transition-all duration-300
                before:absolute before:inset-0 before:rounded-xl 
                before:bg-gradient-to-r before:from-cyan-500/10 before:to-blue-500/10
                before:opacity-0 before:scale-95
                hover:before:opacity-100 hover:before:scale-100
                hover:text-white
                ${collapsed ? 'justify-center w-12 mx-auto' : 'justify-start pl-4'}
                overflow-hidden
              `}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className="relative z-10">
                <item.icon 
                  className={`w-5 h-5 transition-all duration-300 ${
                    collapsed ? 'mx-auto' : ''
                  }`}
                  style={{ 
                    transform: 'translateZ(0)',
                    filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.3))'
                  }} 
                />
              </div>
              
              {!collapsed && (
                <span className="relative z-10 font-medium transition-all duration-300">
                  {item.name}
                </span>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}
        </nav>

        <div className={`px-4 py-3 text-xs text-slate-400 transition-all duration-500 ${collapsed ? 'text-center opacity-70' : 'opacity-100'}`}>
          {!collapsed ? (
            <>Fait à Kinshasa avec <span className="text-red-500">♥</span></>
          ) : (
            <span className="text-red-500">♥</span>
          )}
        </div>
      </aside>

      {/* Bouton collapse qui utilise le contexte */}
      <button
        onClick={toggleSidebar}
        className={`
          fixed top-1/2 z-50 w-9 h-9 flex items-center justify-center
          bg-slate-800/80 border border-white/20 backdrop-blur-xl rounded-full
          shadow-lg shadow-cyan-500/20 transition-all duration-500
          hover:shadow-cyan-400/40 hover:bg-slate-700/90 hover:scale-110
          ${collapsed ? 'left-20' : 'left-64'} -translate-y-1/2
        `}
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5 text-cyan-300 drop-shadow-sm" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-cyan-300 drop-shadow-sm" />
        )}
      </button>

      {showHelp && (
        <div
          className={`
            fixed bottom-6 z-50 flex items-center bg-slate-800/80 backdrop-blur-xl 
            border border-white/20 rounded-xl px-4 py-3 shadow-lg shadow-black/30
            transition-all duration-500 hover:shadow-cyan-500/20
            ${collapsed ? 'right-6 w-12 justify-center' : 'right-6'}
          `}
        >
          {!collapsed && <span className="text-slate-200 mr-3 text-sm font-medium">Besoin d'aide ?</span>}
          <button
            aria-label="Fermer l'aide"

            onClick={() => setShowHelp(false)}
            className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 20s ease infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(180deg); } }
        .animate-float { animation: float 15s ease-in-out infinite; opacity: 0.4; }
        .backdrop-blur-xl { backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); }
      `}</style>
    </>
  );
}