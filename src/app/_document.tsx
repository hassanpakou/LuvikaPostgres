// src/app/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head />
      <body>
        <Main />
        <NextScript />
        {/* ✅ Nettoie les attributs parasites avant hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('[data-np-intersection-state]').forEach(el => {
                  el.removeAttribute('data-np-intersection-state');
                });
              });
            `,
          }}
        />
      </body>
    </Html>
  );
}