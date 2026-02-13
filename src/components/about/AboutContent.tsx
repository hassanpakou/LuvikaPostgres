// src/components/about/AboutContent.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Book, Globe, Lightbulb, AlertTriangle, RefreshCw, Wifi, 
  Users, Target, Star, Rocket, Sparkle, ChevronRight, 
  CheckCircle, Zap, HeartHandshake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AboutContent({
  title,
  subtitle,
  origin_title,
  origin_content,
  context_title,
  context_content,
  problem_title,
  problem_content,
  transformation_title,
  transformation_content,
  solution_title,
  solution_content,
  offers_title,
  offers_content,
  vision_title,
  vision_content,
  value_title,
  value_content,
  perspective_title,
  perspective_content,
}: {
  title: string;
  subtitle: string;
  origin_title: string;
  origin_content: string;
  context_title: string;
  context_content: string;
  problem_title: string;
  problem_content: string;
  transformation_title: string;
  transformation_content: string;
  solution_title: string;
  solution_content: string;
  offers_title: string;
  offers_content: string;
  vision_title: string;
  vision_content: string;
  value_title: string;
  value_content: string;
  perspective_title: string;
  perspective_content: string;
}) {
  // 🔹 Sections avec icônes compactes et couleurs cohérentes
  const sections = [
    { 
      title: origin_title, 
      content: origin_content, 
      icon: Book, 
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1 
    },
    { 
      title: context_title, 
      content: context_content, 
      icon: Lightbulb, 
      color: 'from-green-500 to-emerald-500',
      delay: 0.15 
    },
    { 
      title: problem_title, 
      content: problem_content, 
      icon: AlertTriangle, 
      color: 'from-orange-500 to-red-500',
      delay: 0.2 
    },
    { 
      title: transformation_title, 
      content: transformation_content, 
      icon: RefreshCw, 
      color: 'from-purple-500 to-pink-500',
      delay: 0.25 
    },
    { 
      title: solution_title, 
      content: solution_content, 
      icon: Wifi, 
      color: 'from-teal-500 to-emerald-500',
      delay: 0.3 
    },
    { 
      title: offers_title, 
      content: offers_content, 
      icon: Users, 
      color: 'from-indigo-500 to-blue-500',
      delay: 0.35 
    },
    { 
      title: vision_title, 
      content: vision_content, 
      icon: Target, 
      color: 'from-cyan-500 to-blue-500',
      delay: 0.4 
    },
    { 
      title: value_title, 
      content: value_content, 
      icon: Star, 
      color: 'from-yellow-500 to-orange-500',
      delay: 0.45 
    },
    { 
      title: perspective_title, 
      content: perspective_content, 
      icon: Rocket, 
      color: 'from-red-500 to-purple-500',
      delay: 0.5 
    },
  ];

  return (
    <div className="min-h-screen py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-4">
        {/* 🔹 Header compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20 mb-4">
            <Sparkle className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span className="text-cyan-300 font-medium text-sm">Notre histoire</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent mb-3">
            {title}
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
            {subtitle}
          </p>
          
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        {/* 🔹 Sections compactes avec design moderne */}
        <div className="space-y-5">
          {sections.map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: section.delay, duration: 0.5 }}
              whileHover={{ y: -2 }}
              className="group relative"
            >
              {/* 🔹 Effet de survol subtil */}
              <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm"
                style={{ 
                  background: `linear-gradient(135deg, ${section.color.split(' ')[1]}40, ${section.color.split(' ')[3]}20)` 
                }}
              ></div>
              
              <div className={`
                glass-border rounded-2xl p-5 md:p-6 
                bg-white/5 backdrop-blur-sm border border-white/10
                relative overflow-hidden transition-all duration-300
                group-hover:border-cyan-400/30
              `}>
                {/* 🔹 Décoration intérieure */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-start gap-3 mb-3">
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${section.color}`}>
                    <section.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white flex-1">
                    {section.title}
                  </h2>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed">
                  {section.content}
                </p>
                
                {/* 🔹 Ligne de progression subtile */}
                <motion.div
                  className="mt-3 h-0.5 bg-white/5 rounded-full overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ delay: section.delay + 0.2, duration: 0.6 }}
                >
                  <div className={`h-full bg-gradient-to-r ${section.color}`}></div>
                </motion.div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* 🔹 Section Valeurs ajoutées compacte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-border rounded-2xl p-5 md:p-6 mt-8 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-purple-500/20"
        >
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 mb-3 mx-auto">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Ce qui nous rend unique</h2>
            <p className="text-gray-300 text-sm mt-1">Des valeurs au cœur de notre mission</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: HeartHandshake, title: 'Impact Social', desc: '1% de nos revenus soutient l\'éducation numérique en Afrique' },
              { icon: CheckCircle, title: 'Transparence', desc: 'Pas de données vendues, respect total de votre vie privée' },
              { icon: Globe, title: 'Inclusion', desc: 'Accessibilité dans 9 langues et adaptation culturelle locale' }
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.1 }}
                className="glass-border rounded-xl p-4 bg-white/5 border border-white/10"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <value.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">{value.title}</h3>
                    <p className="text-[11px] text-gray-400 leading-snug">{value.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 🔹 Call to Action compact et élégant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10"
        >
          <div className="glass-border rounded-2xl p-6 md:p-8 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-400/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-center md:text-left max-w-2xl mx-auto md:mx-0">
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30 mb-3">
                  <Star className="w-3 h-3" />
                  <span className="font-medium text-xs">Rejoignez l'aventure</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  Ensemble, redéfinissons le networking
                </h2>
                <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto md:mx-0">
                  Rejoignez des milliers de professionnels qui transforment leur présence numérique avec LUVIKA
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-end">
                <Link href="/dashboard">
                  <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-sm hover:shadow-md">
                    Commencer gratuitement
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                    Parler à un expert
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* 🔹 Statistiques sociales compactes */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap justify-center gap-6 text-center">
              {[
                { value: '50K+', label: 'Utilisateurs', icon: Users },
                { value: '25+', label: 'Pays', icon: Globe },
                { value: '98%', label: 'Satisfaction', icon: Star }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 + i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                    <stat.icon className="w-3 h-3 text-cyan-400" />
                    <span>{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 🔹 Footer compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center mt-8 pt-6 border-t border-white/10 text-[11px] text-gray-500"
        >
          <p>
            LUVIKA • Une identité numérique pour l'Afrique et le monde • © {new Date().getFullYear()}
          </p>
          <p className="mt-1 flex items-center justify-center gap-1.5">
            <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Fait avec ❤️ à Kinshasa</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}