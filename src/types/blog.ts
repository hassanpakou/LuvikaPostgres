export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author: string;
  category: string;
  published_at: string;
  locale: string;
  is_published: boolean;
};