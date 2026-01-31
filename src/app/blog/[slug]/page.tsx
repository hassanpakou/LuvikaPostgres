// src/app/blog/[slug]/page.tsx
import { createClient } from '../../../lib/supabase/client';

type BlogPost = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  published_at: string;
  category: string;
  featured_image_url?: string;
  // ... autres champs
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = createClient();

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true) // Ne récupère que les articles publiés
    .single();

  if (error || !post) {
    // Gérer l'erreur 404
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-white">Article non trouvé</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <article>
        {post.featured_image_url && (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-64 object-cover rounded-xl mb-6"
          />
        )}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Par {post.author}</span>
            <span>•</span>
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString('fr-FR')}
            </time>
            <span>•</span>
            <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full text-xs">
              {post.category}
            </span>
          </div>
        </header>
        <div className="prose prose-invert max-w-none">
          {/* Utilisez un parseur Markdown ou dangerouslySetInnerHTML avec prudence */}
          {/* <ReactMarkdown>{post.content}</ReactMarkdown> */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>
    </div>
  );
}