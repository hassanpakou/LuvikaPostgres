// src/app/e/[qrCodeId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, MapPin } from 'lucide-react';

export default function EventCheckinPage({
  params,
}: {
  params: Promise<{ qrCodeId: string }>;
}) {
  const router = useRouter();
  const { qrCodeId } = use(params); // ✅ use() pour Promise en client
  const [event, setEvent] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(`/api/events/public/${qrCodeId}`);
      if (!res.ok) {
        notFound();
        return;
      }
      const data = await res.json();
      setEvent(data);
    };
    fetchEvent();
  }, [qrCodeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${qrCodeId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 3000);
      } else {
        const { error } = await res.json();
        alert(error);
      }
    } catch (err) {
      alert('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  if (!event) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900/20 to-emerald-900/10 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">✅ Présence enregistrée !</h1>
          <p className="text-gray-300">Merci d’être venu(e) à <span className="font-medium">{event.name}</span>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900/20 to-blue-900/10 flex items-center justify-center p-4">
      <Card className="glass-border bg-white/5 border-white/10 w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-white">{event.name}</CardTitle>
          {event.location && (
            <div className="flex items-center justify-center gap-1 text-sm text-cyan-300 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {event.location}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Votre nom *</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white"
                placeholder="Ex: Phaku Nestor"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Email (optionnel)</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="nestor@example.com"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              {submitting ? 'Enregistrement...' : '✅ Enregistrer ma présence'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// 🔹 Hook utilitaire pour Promise params (si vous n'avez pas use() — Next.js 13.4+)
function use<T>(promise: Promise<T>): T {
  if (typeof (promise as any).status === 'string') {
    if ((promise as any).status === 'fulfilled') return (promise as any).value;
    if ((promise as any).status === 'rejected') throw (promise as any).reason;
    throw (promise as any);
  }
  // fallback simple
  throw promise;
}