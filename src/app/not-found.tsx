'use client' // ✅ AJOUTEZ CETTE LIGNE

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900/10 to-indigo-900/5 p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-cyan-400 mb-4 animate-bounce">404</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page non trouvée
        </h1>
        <p className="text-gray-300 mb-8">
          La page que vous cherchez n'existe pas ou a été supprimée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Retour */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          {/* Accueil */}
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          ℹ️ Si vous pensez que c'est une erreur,
          <br />
          <Link href="/" className="text-cyan-400 hover:text-cyan-300">
            contactez le support
          </Link>
        </p>
      </div>
    </div>
  );
}