// src/components/blog/BlogEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type BlogPost = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  featured_image_url?: string;
  is_published: boolean;
  published_at?: string;
};

export default function BlogEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'news', // Valeur par défaut
    is_published: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (error) {
          setError(error.message);
        } else if (data) {
          setPost(data as BlogPost);
        }
        setLoading(false);
      };
      fetchPost();
    }
  }, [postId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data.user) {
      setError('Non authentifié');
      setLoading(false);
      return;
    }

    // Vérifiez les droits d'admin ici si nécessaire

    const postData = {
      ...post,
      author_id: data.user.id, // L'auteur est l'utilisateur connecté
      published_at: post.is_published && !post.published_at ? new Date().toISOString() : post.published_at,
    };

    let res;
    if (postId) {
      // Mise à jour
      res = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', postId);
    } else {
      // Insertion
      res = await supabase
        .from('blog_posts')
        .insert([postData]);
    }

    if (res.error) {
      setError(res.error.message);
    } else {
      router.push('/dashboard/blog'); // Redirige vers la liste
    }
    setLoading(false);
  };

  if (loading && postId) return <div>Chargement de l'article...</div>;
  if (error) return <div className="text-red-500">Erreur: {error}</div>;

  return (
    <Card className="glass-border">
      <CardHeader>
        <CardTitle>{postId ? 'Modifier l\'article' : 'Nouvel article'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              name="title"
              value={post.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={post.slug}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="excerpt">Extrait</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={post.excerpt}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Select value={post.category} onValueChange={(v) => handleSelectChange('category', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="news">Actualités</SelectItem>
                <SelectItem value="tutorials">Tutoriels</SelectItem>
                <SelectItem value="features">Fonctionnalités</SelectItem>
                <SelectItem value="security">Sécurité</SelectItem>
                {/* Ajoutez d'autres catégories */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="featured_image_url">URL de l'image</Label>
            <Input
              id="featured_image_url"
              name="featured_image_url"
              type="url"
              value={post.featured_image_url || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="content">Contenu</Label>
            <Textarea
              id="content"
              name="content"
              value={post.content}
              onChange={handleChange}
              rows={10}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              checked={post.is_published}
              onChange={(e) => setPost(prev => ({ ...prev, is_published: e.target.checked }))}
            />
            <Label htmlFor="is_published">Publié</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : (postId ? 'Sauvegarder' : 'Créer')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}