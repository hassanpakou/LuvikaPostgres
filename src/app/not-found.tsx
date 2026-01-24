// src/app/not-found.tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-cyan-400 mb-4">404</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page introuvable
        </h1>
        <p className="text-gray-400 mb-8">
          La page que vous cherchez n'existe pas.
        </p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-cyan-600 to-blue-500">
            <Home className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}