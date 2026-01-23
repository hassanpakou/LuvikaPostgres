// src/components/profile/PortfolioSection.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ExternalLink, Github, Eye } from 'lucide-react';
import Image from 'next/image';

type PortfolioItem = {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  demo_url?: string;
  repo_url?: string;
  tags: string[];
};

export default function PortfolioSection({ items }: { items: PortfolioItem[] }) {
  if (!items.length) return null;

  return (
    <Card className="glass-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="text-cyan-400" /> Projets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} className="border border-white/10 rounded-xl overflow-hidden hover:bg-white/5 transition-colors">
              {item.image_url ? (
                <div className="h-32 overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    width={400}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-cyan-400" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-white">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
                )}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  {item.demo_url && (
                    <a
                      href={item.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      <Eye className="w-3 h-3" /> Live
                    </a>
                  )}
                  {item.repo_url && (
                    <a
                      href={item.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
                    >
                      <Github className="w-3 h-3" /> Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}