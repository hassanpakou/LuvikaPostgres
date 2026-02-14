// src/components/blog/BlogEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectTrigger, SelectContent, 
  SelectItem, SelectValue 
} from '@/components/ui/select';
import { 
  Card, CardContent, CardFooter, 
  CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  FileText, Tag, Image, Calendar, 
  Eye, EyeOff, Loader2, AlertCircle, 
  Sparkle, Save, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

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
  author_id?: string;
};

export default function BlogEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'news',
    is_published: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
          if (data.featured_image_url) {
            setPreviewImage(data.featured_image_url);
          }
        }
        setLoading(false);
      };
      fetchPost();
    }
  }, [postId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!postId && post.title && !post.slug) {
      const slug = post.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setPost(prev => ({ ...prev, slug }));
    }
  }, [post.title, postId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
    
    // Update image preview when URL changes
    if (name === 'featured_image_url' && value) {
      setPreviewImage(value);
    }
  };

  const handleSelectChange = (value: string) => {
    setPost(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError('Vous devez être connecté pour publier un article');
      setLoading(false);
      return;
    }

    const postData = {
      ...post,
      author_id: userData.user.id,
      published_at: post.is_published && !post.published_at 
        ? new Date().toISOString() 
        : post.published_at,
    };

    try {
      let res;
      if (postId) {
        res = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', postId);
      } else {
        res = await supabase
          .from('blog_posts')
          .insert([postData]);
      }

      if (res.error) throw res.error;
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/blog');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (loading && postId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glass-border border-amber-500/30 bg-amber-900/20">
        <CardContent className="py-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <p className="text-amber-200 font-medium">Erreur: {error}</p>
          <Button 
            variant="outline" 
            className="mt-4 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
            onClick={() => router.back()}
          >
            ← Retour
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="glass-border border border-white/15 bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
        {/* Header avec gradient */}
        <CardHeader className="border-b border-white/10 bg-gradient-to-r from-cyan-900/30 to-blue-900/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                {postId ? 'Modifier l\'article' : 'Nouvel article'}
              </CardTitle>
              <CardDescription className="text-cyan-200/80 mt-1">
                {postId 
                  ? 'Mettez à jour votre contenu existant' 
                  : 'Créez un nouvel article pour le blog LUVIKA'}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10">
            <Badge className={`${
              post.is_published 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {post.is_published ? (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Publié
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 mr-1" />
                  Brouillon
                </>
              )}
            </Badge>
            
            {post.published_at && (
              <div className="flex items-center gap-1.5 text-sm text-gray-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Publié le {new Date(post.published_at).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 text-sm text-gray-300 ml-auto">
              <Sparkle className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              <span>Édition en temps réel</span>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            {/* Titre et Slug */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-gray-300">
                <FileText className="w-4 h-4 text-cyan-400" />
                Titre de l'article
              </Label>
              <Input
                id="title"
                name="title"
                value={post.title}
                onChange={handleChange}
                placeholder="Entrez un titre accrocheur..."
                className="bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="flex items-center gap-2 text-gray-300">
                <Tag className="w-4 h-4 text-cyan-400" />
                URL (slug)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  luvika.me/blog/
                </span>
                <Input
                  id="slug"
                  name="slug"
                  value={post.slug}
                  onChange={handleChange}
                  placeholder="votre-article-ici"
                  className="pl-32 bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                ⚡ Généré automatiquement depuis le titre (modifiable)
              </p>
            </div>

            {/* Extrait et Catégorie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="excerpt" className="flex items-center gap-2 text-gray-300">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Extrait (description courte)
                </Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={post.excerpt}
                  onChange={handleChange}
                  placeholder="Résumé de l'article en une phrase..."
                  className="min-h-[80px] bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30"
                  required
                />
                <p className="text-[11px] text-gray-500">
                  ⚡ Apparaît dans les listes et les résultats de recherche
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2 text-gray-300">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  Catégorie
                </Label>
                <Select value={post.category} onValueChange={handleSelectChange}>
                  <SelectTrigger className="bg-white/5 border-white/15 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10">
                    <SelectItem value="news">Actualités</SelectItem>
                    <SelectItem value="tutorials">Tutoriels</SelectItem>
                    <SelectItem value="features">Fonctionnalités</SelectItem>
                    <SelectItem value="security">Sécurité</SelectItem>
                    <SelectItem value="updates">Mises à jour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image et Contenu */}
            <div className="space-y-2">
              <Label htmlFor="featured_image_url" className="flex items-center gap-2 text-gray-300">
                <Image className="w-4 h-4 text-cyan-400" />
                URL de l'image à la une
              </Label>
              <Input
                id="featured_image_url"
                name="featured_image_url"
                type="url"
                value={post.featured_image_url || ''}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30"
              />
              
              {previewImage && (
                <div className="mt-3 border border-white/10 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 px-3 py-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-cyan-300">Aperçu de l'image</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        setPreviewImage(null);
                        setPost(prev => ({ ...prev, featured_image_url: '' }));
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                  <div className="p-4 bg-black/30">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full max-h-48 object-contain rounded-lg border border-white/5"
                      onError={() => setPreviewImage(null)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center gap-2 text-gray-300">
                <FileText className="w-4 h-4 text-cyan-400" />
                Contenu complet (Markdown supporté)
              </Label>
              <Textarea
                id="content"
                name="content"
                value={post.content}
                onChange={handleChange}
                placeholder="Écrivez votre article ici... (Markdown supporté)"
                rows={15}
                className="font-mono bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30"
                required
              />
              <p className="text-[11px] text-gray-500">
                💡 Conseil: Utilisez Markdown pour formater votre texte (# Titres, **gras**, *italique*, etc.)
              </p>
            </div>

            {/* Statut de publication */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  post.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}></div>
                <div>
                  <Label htmlFor="is_published" className="font-medium text-white">
                    {post.is_published ? ' Publié' : ' Brouillon'}
                  </Label>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {post.is_published 
                      ? 'Cet article sera visible publiquement' 
                      : 'Cet article est enregistré mais pas visible'}
                  </p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  checked={post.is_published}
                  onChange={(e) => setPost(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </CardContent>

          <CardFooter className="border-t border-white/10 bg-white/3 p-6">
            <AnimatePresence mode="wait" initial={false}>
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 text-emerald-400 bg-emerald-500/15 px-4 py-2.5 rounded-xl border border-emerald-500/30 font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Article enregistré avec succès ! Redirection...</span>
                </motion.div>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      {postId ? 'Mettre à jour' : 'Publier'} l'article
                    </>
                  )}
                </Button>
              )}
            </AnimatePresence>
            
            <Button
              type="button"
              variant="outline"
              className="ml-3 border-white/20 text-gray-300 hover:bg-white/10"
              onClick={() => router.back()}
            >
              ← Annuler
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Signature */}
      <div className="mt-6 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
        <Sparkle className="w-3 h-3 text-cyan-400 animate-pulse" />
        <span>Éditeur LUVIKA • Fait avec ❤️ à Kinshasa</span>
      </div>
    </motion.div>
  );
}