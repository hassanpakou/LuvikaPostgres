// src/app/auth/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900/5 to-indigo-900/10">
      <div className="relative z-10 flex-1">{children}</div>
    </div>
  );
}