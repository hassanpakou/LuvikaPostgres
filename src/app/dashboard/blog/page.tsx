// src/app/dashboard/blog/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  published_at: string;
  is_published: boolean;
};

export default function BlogAdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();
      if (!user) return router.push('/auth/sign-in');

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) return;
      setPosts(data || []);
      setLoading(false);
    };

    fetchPosts();
  }, [router]);

  const deletePost = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    const supabase = createClient();
    await supabase.from('blog_posts').delete().eq('id', id);
    setPosts(posts.filter(p => p.id !== id));
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestion du blog</h1>
        <Button asChild>
          <Link href="/dashboard/blog/new">
            <Plus className="w-4 h-4 mr-2" /> Nouvel article
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map(post => (
          <Card key={post.id} className="p-4 glass-border">
            <h3 className="font-semibold text-white mb-2">{post.title}</h3>
            <div className="text-sm text-gray-400 mb-3">
              {post.category} •{' '}
              {new Date(post.published_at).toLocaleDateString('fr-FR')}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <Eye className="w-3 h-3 mr-1" /> Voir
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/blog/edit/${post.id}`}>
                  <Edit className="w-3 h-3 mr-1" /> Modifier
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deletePost(post.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}