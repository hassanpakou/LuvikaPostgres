'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'

const PUBLIC_ROUTES = [
  '/', '/auth', '/about', '/contact', '/pricing', '/download',
  '/privacy', '/terms', '/cookies', '/blog',
  '/fr', '/en', '/ln', '/kg', '/sw', '/pt', '/nl', '/es', '/ar'
]

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // 🔹 Accepte tous les chemins localisés publics : /fr, /en, /fr/about, etc.
      const isPublicPath = 
        PUBLIC_ROUTES.includes(pathname) ||
        /^\/[a-z]{2}(\/[^\/]*)?$/.test(pathname) || // /fr, /fr/anything
        /^\/[a-z]{2}\/about/.test(pathname) ||
        /^\/[a-z]{2}\/contact/.test(pathname) ||
        /^\/[a-z]{2}\/pricing/.test(pathname);

      if (isPublicPath) {
        setChecking(false)
        setIsAuthorized(true)
        return
      }

      // 🔹 Routes protégées : vérifier la session
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // ✅ User connecté
          setIsAuthorized(true)
        } else {
          // ❌ Pas de session
          setIsAuthorized(false)
          // ⚠️ NE PAS rediriger ici — le middleware s'en charge
        }
      } catch (error) {
        console.error('❌ Session check failed:', error)
        setIsAuthorized(false)
      } finally {
        setChecking(false)
      }
    }

    checkAuth()
  }, [pathname])

  // 🔹 Loader pendant la vérification
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
        </div>
      </div>
    )
  }

  // ✅ Autorisé ou public → affiche le contenu
  return <>{children}</>
}