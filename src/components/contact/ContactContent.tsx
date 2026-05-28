// src/components/contact/ContactContent.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, MapPin, Phone, MessageCircle, Send, ChevronRight, CheckCircle, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function ContactContent({
  title,
  subtitle,
  address,
  email,
  phone,
  form_title,
  name,
  name_placeholder,
  message,
  message_placeholder,
  send,
}: {
  title: string;
  subtitle: string;
  address: string;
  email: string;
  phone: string;
  form_title: string;
  name: string;
  name_placeholder: string;
  message: string;
  message_placeholder: string;
  send: string;
}) {
  return (
    <div className="min-h-screen py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-4">
        {/* 🔹 Header compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
         
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-3">
            {title}
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
            {subtitle}
          </p>
          
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🔹 Informations de contact compactes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {[
              { 
                icon: MapPin, 
                title: address, 
                value: 'Kinshasa, RDC', 
                color: 'from-amber-500 to-orange-500',
                gradient: 'bg-gradient-to-r from-amber-500/15 to-orange-500/15'
              },
              { 
                icon: Mail, 
                title: email, 
                value: 'luvika@gmail.com', 
                color: 'from-blue-500 to-cyan-500',
                gradient: 'bg-gradient-to-r from-blue-500/15 to-cyan-500/15'
              },
              { 
                icon: Phone, 
                title: phone, 
                value: '+243 890 17 76 601', 
                color: 'from-emerald-500 to-teal-500',
                gradient: 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                whileHover={{ y: -2 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-sm"
                  style={{ 
                    background: `linear-gradient(135deg, ${item.color.split(' ')[1]}40, ${item.color.split(' ')[3]}20)` 
                  }}
                ></div>
                
                <div className={`
                  glass-border rounded-xl p-4 
                  ${item.gradient} backdrop-blur-sm border border-white/10
                  relative overflow-hidden transition-all duration-300
                  group-hover:border-cyan-400/30
                `}>
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm mb-0.5">{item.title}</h3>
                      <p className="text-[11px] text-gray-300">{item.value}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* 🔹 Section horaires (optionnelle mais utile) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-border rounded-xl p-4 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-purple-500/20"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-white text-sm">Heures d'ouverture</h3>
              </div>
              <div className="space-y-1 text-[11px] text-gray-300">
                <p>Lundi - Vendredi: 8h - 18h</p>
                <p>Samedi: 9h - 14h</p>
                <p>Dimanche: Fermé</p>
              </div>
            </motion.div>
          </motion.div>

          {/* 🔹 Formulaire compact et élégant */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-border rounded-2xl p-5 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-300 px-3 py-1.5 rounded-full border border-cyan-500/20 mb-3">
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="font-medium text-xs">{form_title}</span>
              </div>
              <h2 className="text-xl font-bold text-white">Parlez-nous de votre projet</h2>
              <p className="text-gray-400 text-sm mt-1">Nous répondons sous 24h en moyenne</p>
            </div>
            
            <form className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-gray-300 text-sm">{name}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={name_placeholder}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-300 text-sm">{email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-gray-300 text-sm">{message}</Label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder={message_placeholder}
                    className="pl-10 pt-3 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 resize-none"
                  />
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-500/20 transition-all duration-300 group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {send}
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              </AnimatePresence>
              
              {/* 🔹 Badges de confiance */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-white/10 mt-4">
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] py-0.5 px-2">
                  <CheckCircle className="w-3 h-3 mr-0.5 inline" />
                  Réponse sous 24h
                </Badge>
                <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 text-[10px] py-0.5 px-2">
                  <Lock className="w-3 h-3 mr-0.5 inline" />
                  Données sécurisées
                </Badge>
                <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[10px] py-0.5 px-2">
                  <Star className="w-3 h-3 mr-0.5 inline" />
                  Support prioritaire
                </Badge>
              </div>
            </form>
          </motion.div>
        </div>

        {/* 🔹 Section CTA finale compacte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <div className="glass-border rounded-2xl p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-400/20 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold text-white mb-1">Préférez-vous discuter directement ?</h3>
                <p className="text-gray-300 text-sm">
                  Appelez-nous au <span className="font-medium text-cyan-300">+243 890 17 76 601</span><br />
                  ou écrivez à <span className="font-medium text-cyan-300">luvika@gmail.com</span>
                </p>
              </div>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200"
                onClick={() => window.location.href = 'tel:+2438901776601'}
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                Appeler maintenant
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 🔹 Footer compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 pt-6 border-t border-white/10 text-[11px] text-gray-500"
        >
          <p>LUVIKA • Une identité numérique pour l'Afrique et le monde • © {new Date().getFullYear()}</p>
          <p className="mt-1 flex items-center justify-center gap-1.5">
            <span>Fait avec ❤️ à Kinshasa</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// 🔹 Icônes manquantes
import { User, Lock, Clock, Star } from 'lucide-react';