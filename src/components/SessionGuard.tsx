'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'

const PUBLIC_ROUTES = [
  '/auth',
  '/about',
  "/contact",
  "/pricing",
  "/download",
  '/privacy',
  '/terms',
  '/cookies',
  '/blog',
  '/', '/fr', '/en', '/ln', '/kg', '/sw', '/pt', '/nl', '/es', '/ar'
]

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      // 👉 Ne pas protéger les routes publiques
      if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        setChecking(false)
        return
      }

      const supabase = createClient()
  // Dans SessionGuard.tsx
const { data: { user }, error } = await supabase.auth.getUser();
if (error || !user) {
  // Nettoie les cookies
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.trim().split('=')[0];
    if (name.startsWith('sb-')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
  router.replace('/auth/sign-in');
}

      setChecking(false)
    }

    check()
  }, [pathname, router])

  if (checking) {
   return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Chargement du profil...</h3>
          <p className="text-gray-400">Récupération des données depuis la base sécurisée</p>
          <div className="mt-6 max-w-md mx-auto w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse w-1/3"></div>
          </div>
        </div>
      </div>
    );
    
  }

  return <>{children}</>
}