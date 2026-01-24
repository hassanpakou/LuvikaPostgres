'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'

const PUBLIC_ROUTES = [
  '/auth',
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
      const { data: { session } } = await supabase.auth.getSession()

      // 👉 Session expirée ou inexistante
      if (!session) {
        await supabase.auth.signOut()
        router.replace('/auth/sign-in')
        return
      }

      setChecking(false)
    }

    check()
  }, [pathname, router])

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
        Chargement...
      </div>
    )
  }

  return <>{children}</>
}