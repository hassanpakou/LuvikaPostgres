'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Handle route changes
    const handleStart = () => setIsLoading(true);
    const handleStop = () => setIsLoading(false);

    // Listen for route changes
    const handleRouteChange = () => {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 1500);
      return () => clearTimeout(timer);
    };

    // For next/navigation transitions
    if (typeof window !== 'undefined') {
      // Create a custom event listener for route changes
      const originalPush = router.push.bind(router);
      const originalPrefetch = router.prefetch ? router.prefetch.bind(router) : undefined;

      router.push = function(...args: Parameters<typeof router.push>) {
        setIsLoading(true);
        const result = (originalPush as any)(...args);
        setTimeout(() => setIsLoading(false), 1500);
        return result;
      };

      if (originalPrefetch) {
        router.prefetch = function(...args: Parameters<NonNullable<typeof router.prefetch>>) {
          return (originalPrefetch as any)(...args);
        };
      }
    }

    return () => {
      handleStop();
    };
  }, [router]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-md">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        {/* Logo */}
        <div className="relative">
          <div className="relative bg-linear-to-br from-blue-500 to-purple-600 rounded-full p-4 shadow-2xl">
            <Image
              src="/lo.jpeg"
              alt="Luvika"
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-3 border-transparent border-b-cyan-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    </div>
  );
}
