'use client';

import React, { Suspense, ReactNode } from 'react';
import Loading from './Loading';

interface PageLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component pour afficher un loading pendant le chargement du contenu
 * Utilise React.Suspense pour gérer les états de chargement
 * 
 * @example
 * ```tsx
 * <PageLoader>
 *   <SomeAsyncComponent />
 * </PageLoader>
 * ```
 */
export function PageLoader({ children, fallback }: PageLoaderProps) {
  return (
    <Suspense fallback={fallback || <Loading />}>
      {children}
    </Suspense>
  );
}
