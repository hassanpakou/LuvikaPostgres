'use client';

/**
 * EXEMPLE D'UTILISATION - Système de Chargement Global
 * 
 * Ce fichier montre comment utiliser le système de loading dans votre application
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function LoadingExamples() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Exemple 1: Navigation simple
  const handleNavigation = async () => {
    // GlobalLoader s'affiche automatiquement
    router.push('/blog');
  };

  // Exemple 2: Avec délai simulé
  const handleNavigationWithDelay = async () => {
    setIsLoading(true);
    // Simule une opération longue
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    router.push('/dashboard');
  };

  // Exemple 3: Navigation multiples
  const handleMultipleNavigations = () => {
    router.push('/blog');
    setTimeout(() => {
      router.push('/pricing');
    }, 3000);
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Exemples de Chargement</h2>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">1. Navigation Simple</h3>
        <p className="text-gray-600">Le loading s'affiche automatiquement pour 1.5s</p>
        <Button onClick={handleNavigation}>
          Aller au Blog
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">2. Avec Délai</h3>
        <p className="text-gray-600">Simule une opération async avec loading personnalisé</p>
        <Button onClick={handleNavigationWithDelay} disabled={isLoading}>
          {isLoading ? 'Chargement...' : 'Aller au Dashboard'}
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">3. Navigations Multiples</h3>
        <p className="text-gray-600">Plusieurs navigations en séquence</p>
        <Button onClick={handleMultipleNavigations}>
          Blog → Pricing (3s après)
        </Button>
      </div>

      {/* Info texte */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900">ℹ️ Information</h4>
        <ul className="text-sm text-blue-800 mt-2 space-y-1">
          <li>• Le loading global se déclenche automatiquement lors de navigations</li>
          <li>• Durée: 1.5 secondes par défaut</li>
          <li>• Aucune configuration requise</li>
          <li>• Visible sur tous les appareils</li>
        </ul>
      </div>
    </div>
  );
}
