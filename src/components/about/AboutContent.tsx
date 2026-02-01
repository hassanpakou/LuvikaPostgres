// src/components/about/AboutContent.tsx ✅ NOUVELLE VERSION COMPLÈTE
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Book, 
  Globe, 
  Lightbulb, 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Users, 
  Target, 
  Star, 
  Rocket 
} from 'lucide-react';

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
  return (
    <div className="min-h-screen py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent mb-6">
            {title}
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-16">
          
          {/* 1. Origine du nom Luvika */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-border rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Book className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{origin_title}</h2>
            </div>
            <div className="prose prose-lg text-gray-300 leading-relaxed">
              {origin_content}
            </div>
          </motion.section>

          {/* 2. Contexte et idée initiale */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-border rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{context_title}</h2>
            </div>
            <div className="prose prose-lg text-gray-300 leading-relaxed">
              {context_content}
            </div>
          </motion.section>

          {/* 3. Problème identifié */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-border rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{problem_title}</h2>
            </div>
            <div className="prose prose-lg text-gray-300 leading-relaxed">
              {problem_content}
            </div>
          </motion.section>

          {/* 4. Transformation stratégique */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-border rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{transformation_title}</h2>
            </div>
            <div className="prose prose-lg text-gray-300 leading-relaxed">
              {transformation_content}
            </div>
          </motion.section>

          {/* 5. Naissance de la solution */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-border rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{solution_title}</h2>
            </div>
            <div className="prose prose-lg text-gray-300 leading-relaxed">
              {solution_content}
            </div>
          </motion.section>

          {/* 6. Structuration des offres */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-border rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{offers_title}</h2>
            </div>
            <div className="prose prose-lg text-gray-300 leading-relaxed">
              {offers_content}
            </div>
          </motion.section>

          {/* 7. Vision et mission */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-border rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{vision_title}</h2>
            </div>
            <div className="prose prose-lg text-gray-300 leading-relaxed">
              {vision_content}
            </div>
          </motion.section>

          {/* 8. Valeur ajoutée */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-border rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{value_title}</h2>
            </div>
            <div className="prose prose-lg text-gray-300 leading-relaxed">
              {value_content}
            </div>
          </motion.section>

          {/* 9. Perspective et ambition */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="glass-border rounded-3xl p-8 md:p-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-purple-500 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{perspective_title}</h2>
            </div>
            <div className="prose prose-lg text-gray-300 leading-relaxed">
              {perspective_content}
            </div>
          </motion.section>

        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-16"
        >
          <div className="glass-border rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Rejoignez l'aventure LUVIKA
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Ensemble, redéfinissons le networking professionnel en Afrique et dans le monde.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full font-medium text-white shadow-lg shadow-blue-500/20"
                >
                  Commencer maintenant
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 border border-cyan-400 text-cyan-400 rounded-full font-medium hover:bg-cyan-400 hover:text-white transition-all"
                >
                  Nous contacter
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
