// src/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '../../../src/lib/supabase/client';
import { SiFacebook, SiInstagram, SiSnapchat, SiTelegram, SiTiktok, SiWhatsapp } from 'react-icons/si';

type FooterProps = {
  product: string;
  features: string;
  pricing: string;
  download: string;
  company: string;
  about: string;
  contact: string;
  blog: string;
  legal: string;
  privacy: string;
  terms: string;
  cookies: string;
  tagline: string;
  copyright: string;
};

export default function Footer({
  product,
  features,
  pricing,
  download,
  company,
  about,
  contact,
  blog,
  legal,
  privacy,
  terms,
  cookies,
  tagline,
  copyright,
}: FooterProps) {

  const links = [
    {
      title: product,
      items: [
        { label: features, href: '/#features' },
        { label: pricing, href: '/pricing' },
        { label: download, href: '/download' },
        { label: 'Documentation', href: '/documentation' },
      ],
    },
    {
      title: company,
      items: [
        { label: about, href: '/about' },
        { label: contact, href: '/contact' },
        { label: blog, href: '/blog' },
      ],
    },
    {
      title: legal,
      items: [
        { label: privacy, href: '/privacy' },
        { label: terms, href: '/terms' },
        { label: cookies, href: '/cookies' },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="glass-border backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Link href="/" className="inline-flex items-center space-x-2 group">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-blue-200">
                LUVIKA
              </span>
            </Link>
            <p className="mt-3 text-gray-400 max-w-md mx-auto">
              {tagline}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto mb-16">
            {links.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-gray-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                      >
                        <span className="w-1 h-1 rounded-full bg-cyan-400/50 mr-2 mt-1.5" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} LUVIKA. {copyright}
              </p>

              <div className="flex space-x-4 mt-4 md:mt-0">
                {[
                  { Icon: SiSnapchat, href: 'https://www.snapchat.com/add/nes.pha', label: 'Snapchat' },
                  { Icon: SiTelegram, href: 'https://t.me/nes_pha', label: 'Telegram' },
                  { Icon: SiFacebook, href: 'https://www.facebook.com/nes.pha', label: 'Facebook' },
                  { Icon: SiTiktok, href: 'https://www.tiktok.com/@h_asa5an', label: 'Tiktok' },
                  { Icon: SiWhatsapp, href: 'https://wa.me/243890177601', label: 'Whatsapp' },
                  { Icon: SiInstagram, href: 'https://www.instagram.com/nes.pha', label: 'Instagram' },
                  { Icon: Github, href: 'https://github.com/hassanpakou', label: 'GitHub' },
                  { Icon: Twitter, href: 'https://twitter.com/luvika', label: 'Twitter' },
                  { Icon: Linkedin, href: 'https://linkedin.com/in/nestor-phaku-137b53217', label: 'LinkedIn' },
                ].map(({ Icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -3, scale: 1.1 }}
                    className="text-gray-400 hover:text-cyan-300 transition-colors"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center text-gray-500 text-sm gap-2">
              <MapPin className="w-4 h-4" />
              <span>Kinshasa, RDC</span>
              <span className="mx-2">•</span>
              <Mail className="w-4 h-4" />
              <span><a href="mailto:luvika@gmail.com">phakunestor@gmail.com</a></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}