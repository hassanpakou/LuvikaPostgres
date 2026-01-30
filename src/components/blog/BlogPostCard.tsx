// src/components/blog/BlogPostCard.tsx
'use client';

import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';
import type { BlogPost } from '../../types/blog';

export default function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all">
      <div className="p-6">
        <div className="flex items-center gap-3 text-sm text-cyan-400 mb-3">
          <Tag className="w-4 h-4" />
          <span>{post.category}</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
          {post.title}
        </h2>
        <p className="text-gray-300 mb-4">{post.excerpt}</p>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Par {post.author}</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString('fr-FR')}
            </time>
          </div>
        </div>
      </div>
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10" />
    </article>
  );
}