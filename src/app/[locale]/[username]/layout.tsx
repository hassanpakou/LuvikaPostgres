// src/app/[locale]/[username]/layout.tsx
import { Inter } from 'next/font/google';
import '../../globals.css'; // ✅ CSS global (glassmorphism, etc.)

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Profil · LUVIKA',
  description: 'Carte de visite digitale NFC & QR',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-black overflow-x-hidden`}>
        {children}
        {/* 🔹 Pas de Navbar, pas de Footer */}
      </body>
    </html>
  );
}