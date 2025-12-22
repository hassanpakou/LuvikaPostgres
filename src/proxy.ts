// src/proxy.ts
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server'; // ✅ Ajoute ça

export default async function proxy(req: NextRequest) { // ✅ typé
  return createMiddleware({
    locales: ['fr', 'ln', 'en'],
    defaultLocale: 'fr',
    localeDetection: true,
  })(req);
}

export const config = {
  matcher: ['/', '/(fr|ln|en)/:path*'],
};