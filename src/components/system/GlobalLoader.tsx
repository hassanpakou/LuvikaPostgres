'use client';

import React, { useEffect, useState } from 'react';
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
      const originalPush = router.push;
      const originalPrefetch = router.prefetch;

      router.push = function(...args: any[]) {
        setIsLoading(true);
        const result = originalPush.apply(this, args);
        setTimeout(() => setIsLoading(false), 1500);
        return result;
      };

      router.prefetch = function(...args: any[]) {
        return originalPrefetch.apply(this, args);
      };
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
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
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
