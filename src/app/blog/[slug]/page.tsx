// src/app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { createClientForPage } from '../../../lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClientForPage();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) return {};
  const t = await getTranslations('blog');

  return {
    title: `${post.title} | ${t('title')}`,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = await createClientForPage();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8"
      >
        ← Retour au blog
      </Link>

      <article className="prose prose-invert max-w-none">
        <header className="mb-8">
          <div className="text-cyan-400 mb-2">{post.category}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" /> {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />{' '}
              {new Date(post.published_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </header>

        <div
          className="text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}