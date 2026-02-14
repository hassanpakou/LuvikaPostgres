// src/components/blog/BlogPostCard.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowRight, Image as ImageIcon } from 'lucide-react';
import type { BlogPost } from '../../types/blog';
import { Badge } from '@/components/ui/badge';

const CATEGORY_COLORS = {
  news: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  tutorials: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  features: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  security: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  updates: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

export default function BlogPostCard({ post }: { post: BlogPost }) {
  const categoryColor = CATEGORY_COLORS[post.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.news;
  const hasImage = post.featured_image_url && post.featured_image_url.trim() !== '';

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", damping: 15, stiffness: 150 }}
      className="group relative bg-gradient-to-br from-white/3 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer"
    >
      {/* Featured image */}
      {hasImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('h-0', 'py-4');
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Category badge */}
          <Badge className={`absolute top-3 left-3 ${categoryColor} font-medium`}>
            <Tag className="w-3 h-3 mr-1" />
            {post.category}
          </Badge>
        </div>
      )}

      <div className={`p-6 ${!hasImage ? 'pt-4' : ''}`}>
        {!hasImage && (
          <div className="flex items-center gap-2 mb-3">
            <Badge className={`${categoryColor} font-medium`}>
              <Tag className="w-3 h-3 mr-1" />
              {post.category}
            </Badge>
          </div>
        )}
        
        <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-300 transition-colors">
          {post.title}
        </h2>
        
        <p className="text-gray-300 mb-4 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <time dateTime={post.published_at}>
              {post.published_at 
                ? new Date(post.published_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : 'Brouillon'}
            </time>
          </div>
          
          <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <span>Lire l'article</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
      
      {/* Overlay pour le lien */}
      <Link 
        href={`/blog/${post.slug}`} 
        className="absolute inset-0 z-10"
        aria-label={`Lire l'article: ${post.title}`}
      />
      
      {/* Décoration intérieure au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </motion.article>
  );
}