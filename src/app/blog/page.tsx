// src/app/blog/page.tsx
// ⚠️ PAS DE 'use client' - C'est un Server Component
import { notFound } from 'next/navigation';
import { createClientForPage } from '../../lib/supabase/server';
import BlogPostCard from '../../components/blog/BlogPostCard';
import { getTranslations } from 'next-intl/server';
import type { BlogPost } from '../../types/blog';
import { 
  BookOpen, Sparkle, ChevronRight, 
  AlertCircle, Search, FileText, RefreshCw 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedSection, AnimatedGridItem } from '../../components/blog/BlogAnimations';
// 🔹 AJOUTÉ: Import du composant sécurisé pour le bouton
import { ReloadButton } from '../../components/blog/ReloadButton';

export async function generateMetadata() {
  const t = await getTranslations('blog');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function BlogPage() {
  const supabase = await createClientForPage();
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  console.log('📝 Blog posts query:', { 
    postsCount: posts?.length, 
    error: error?.message,
    posts: posts?.slice(0, 1)
  });

  if (error) {
    console.error('❌ Erreur Supabase blog_posts:', error);
  }

  const blogPosts = posts || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900/5 to-indigo-900/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔹 Hero section premium - avec composant d'animation */}
        <AnimatedSection delay={0.1} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-4 py-2 rounded-full border border-cyan-500/20 mb-6">
            <Sparkle className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="text-cyan-300 font-medium text-sm">Actualités & Insights</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200 mb-4">
            Actualités LUVIKA
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Découvrez les dernières fonctionnalités, tutoriels et conseils pour maximiser votre présence numérique.
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
          
          {/* 🔹 Statistiques */}
          <div className="mt-10 flex flex-wrap justify-center gap-8">
            <AnimatedSection delay={0.2} className="text-center">
              <div className="text-3xl font-bold text-white">{blogPosts.length}</div>
              <div className="text-gray-400 text-sm">Articles</div>
            </AnimatedSection>
            <AnimatedSection delay={0.3} className="text-center">
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-gray-400 text-sm">Satisfaction</div>
            </AnimatedSection>
            <AnimatedSection delay={0.4} className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-gray-400 text-sm">Lecteurs</div>
            </AnimatedSection>
          </div>
        </AnimatedSection>

        {/* 🔹 Filtres et recherche */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30"
            />
          </div>
        </div>

        {/* 🔹 Section articles */}
        {blogPosts.length === 0 ? (
          <AnimatedSection delay={0.5} className="max-w-3xl mx-auto text-center py-16">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <FileText className="relative w-16 h-16 text-gray-600 mx-auto" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Aucun article publié</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Notre équipe rédige activement de nouveaux contenus. 
              Revenez bientôt pour découvrir nos derniers articles et mises à jour !
            </p>
            
            {/* 🔹 CORRECTION CRITIQUE: Utilisation du composant Client sécurisé */}
            <ReloadButton />
            
            <div className="mt-12 pt-8 border-t border-white/10 text-[11px] text-gray-500">
              <p className="flex items-center justify-center gap-1.5">
                <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>Contenu en préparation • Nouveaux articles à venir prochainement</span>
              </p>
            </div>
          </AnimatedSection>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {blogPosts.map((post: BlogPost, index: number) => (
              <AnimatedGridItem key={post.id} index={index}>
                <BlogPostCard post={post} />
              </AnimatedGridItem>
            ))}
          </div>
        )}

        {/* 🔹 Section CTA finale */}
        {blogPosts.length > 0 && (
          <AnimatedSection delay={0.6} className="text-center mt-16 max-w-3xl mx-auto">
            <div className="glass-border rounded-2xl p-8 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-400/20">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="text-center md:text-left max-w-xl mx-auto md:mx-0">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    Ne manquez aucun article !
                  </h3>
                  <p className="text-gray-300 text-sm md:text-base">
                    Inscrivez-vous à notre newsletter pour recevoir les derniers articles directement dans votre boîte de réception.
                  </p>
                </div>
                
                {/* 🔹 Bouton CTA sans onClick (navigation ou formulaire à ajouter plus tard) */}
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium shadow-lg shadow-cyan-500/20"
                  asChild
                >
                  <a href="/newsletter">
                    <span className="flex items-center gap-2">
                      S'abonner à la newsletter
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </a>
                </Button>
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}