// src/components/profile/ProfileActions.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Mail, Phone, MapPin, MessageCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

type Profile = {
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  full_name?: string;
  username?: string;
  company?: string | null;
  job_title?: string | null;
  website?: string | null;
};

export default function ProfileActions({ profile }: { profile: Profile }) {
  const getWhatsAppLink = (phone: string, name: string) => {
    const clean = phone.replace(/\D/g, '');
    return `https://wa.me/${clean}?text=Bonjour%20${encodeURIComponent(name)},%20je%20vous%20contacte%20via%20LUVIKA.`;
  };

  const downloadVCard = () => {
    const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name}
ORG:${profile.company || ''}
TITLE:${profile.job_title || ''}
TEL;TYPE=WORK,VOICE:${profile.phone || ''}
TEL;TYPE=CELL,VOICE:${profile.whatsapp || ''}
EMAIL:${profile.email || ''}
ADR;TYPE=WORK:;;${profile.address || ''};;;;
URL:${profile.website || ''}
NOTE:Contact via LUVIKA — luvika.me/${profile.username}
END:VCARD`.trim().replace(/\n/g, '\r\n');

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.username}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profile.email && (
          <a href={`mailto:${profile.email}`} className="block">
            <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5">
              <Mail className="mr-2 h-4 w-4" /> {profile.email}
            </Button>
          </a>
        )}
        {profile.phone && (
          <a href={`tel:${profile.phone}`} className="block">
            <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5">
              <Phone className="mr-2 h-4 w-4" /> Appeler
            </Button>
          </a>
        )}
        {profile.whatsapp && (
          <a 
            href={getWhatsAppLink(profile.whatsapp, profile.full_name || '')} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5">
              <MessageCircle className="mr-2 h-4 w-4 text-green-400" /> WhatsApp
            </Button>
          </a>
        )}
        {profile.address && (
          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(profile.address)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5">
              <MapPin className="mr-2 h-4 w-4" /> Localiser
            </Button>
          </a>
        )}
      </div>

      <Button
        className="mt-6 w-full bg-gradient-to-r from-blue-600 to-cyan-500"
        onClick={downloadVCard}
      >
        <Download className="mr-2 h-4 w-4" /> Sauvegarder le contact (.vcf)
      </Button>
      {/* 🔹 Backlink minimal — légal & discret */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1 }}
  className="fixed bottom-4 right-4 z-20"
>
  <a
    href="/"
    className="text-xs text-gray-500 hover:text-cyan-300 transition-colors flex items-center gap-1"
    aria-label="Retour à l'accueil LUVIKA"
  >
    <span>luvika.dev</span>
    <ExternalLink className="w-3 h-3" />
  </a>
</motion.div>
    </>
  );
}