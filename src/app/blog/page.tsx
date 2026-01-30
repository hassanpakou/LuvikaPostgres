// src/app/blog/page.tsx
import { notFound } from 'next/navigation';
import { createClientForPage } from '../../lib/supabase/server';
import BlogPostCard from '../../components/blog/BlogPostCard';
import { getTranslations } from 'next-intl/server';
import type { BlogPost } from '../../types/blog';

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
    // ⚠️ Afficher le message "Aucun article" au lieu d'une 404
  }

  const blogPosts = posts || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Actualités LUVIKA
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Découvrez les dernières fonctionnalités, tutoriels et conseils.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-6"></div>
      </div>

      {blogPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Aucun article publié pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.map((post: BlogPost) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}