// src/app/(main)/[locale]/layout.tsx
import type { ReactNode } from 'react';

export default function LocaleSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Le provider est géré par src/app/[locale]/layout.tsx
  return children as React.ReactElement;
}
