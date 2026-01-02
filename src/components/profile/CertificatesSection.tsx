// src/components/profile/CertificatesSection.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, ExternalLink } from 'lucide-react';

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  date_issued: string;
  credential_url?: string;
  thumbnail_url?: string;
};

const issuerColors: Record<string, string> = {
  'MAKEATHON Orange': 'from-orange-500 to-red-500',
  'Google': 'from-blue-500 to-cyan-500',
  'Meta': 'from-blue-500 to-indigo-500',
  'Coursera': 'from-green-500 to-emerald-500',
};

export default function CertificatesSection({ items }: { items: Certificate[] }) {
  if (!items.length) return null;

  return (
    <Card className="glass-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="text-yellow-400" /> Certifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map(cert => {
            const color = issuerColors[cert.issuer] || 'from-gray-500 to-gray-400';
            return (
              <div key={cert.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{cert.title}</h3>
                  <p className="text-gray-400 text-sm">{cert.issuer}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(cert.date_issued).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}
                  </p>
                </div>
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-center text-gray-400 hover:text-cyan-400"
                    aria-label="Voir certification"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}