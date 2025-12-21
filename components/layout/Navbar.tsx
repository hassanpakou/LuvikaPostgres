// src/components/layout/Navbar.tsx
// Navbar simple, responsive, avec CTA

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react'; // on installera lucide-react après

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            LUVIKA
          </span>
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="hover:text-blue-300 transition">Accueil</Link>
          <Link href="/#features" className="hover:text-blue-300 transition">Fonctionnalités</Link>
          <Link href="/#pricing" className="hover:text-blue-300 transition">Tarifs</Link>
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/auth/sign-in">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Connexion
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400">
              S’inscrire
            </Button>
          </Link>
        </div>

        {/* Menu Mobile (hamburger) */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu (slide down) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-sm border-t border-white/10">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link href="/" className="hover:text-blue-300" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
            <Link href="/#features" className="hover:text-blue-300" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</Link>
            <Link href="/#pricing" className="hover:text-blue-300" onClick={() => setMobileMenuOpen(false)}>Tarifs</Link>
            <div className="flex flex-col space-y-2 pt-4">
              <Link href="/auth/sign-in" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">Connexion</Button>
              </Link>
              <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500">S’inscrire</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}