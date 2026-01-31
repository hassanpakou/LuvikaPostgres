// src/app/dashboard/blog/edit/[id]/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import BlogEditor from '../../../../../components/blog/BlogEditor';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set({ name, value, ...options }); },
        remove(name, options) { cookieStore.delete({ name, ...options }); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/auth/sign-in');
  }

  // Optionnel : Vérifiez que l'utilisateur est bien l'auteur ou admin
  // const { data: post, error } = await supabase.from('blog_posts').select('author_id').eq('id', id).single();
  // if (error || !post || (post.author_id !== user.id && user.user_metadata?.role !== 'admin')) {
  //   redirect('/dashboard/blog'); // Ou une page 404
  // }

  return (
    <div className="p-8">
      <BlogEditor postId={id} />
    </div>
  );
}