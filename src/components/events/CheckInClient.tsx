'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, QrCode, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckInClient({
  eventId,
  eventTitle,
  token,
  isOrganizer
}: {
  eventId: string;
  eventTitle: string;
  token: string | null;
  isOrganizer: boolean;
}) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleCheckIn = async () => {
    if (!token) {
      setMessage('QR code invalide. Veuillez scanner un QR valide.');
      setStatus('error');
      return;
    }

    setStatus('checking');
    try {
      const res = await fetch(`/api/events/${eventId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }), // ✅ envoie le token
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(`✅ Bienvenue, ${data.name || 'participant'} !`);
      } else {
        setStatus('error');
        setMessage(data.error || 'Erreur lors du check-in.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Erreur réseau.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Présence enregistrée !</h1>
          <p className="text-gray-300">{message}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="glass-border w-full max-w-md">
        <CardHeader className="text-center">
          <QrCode className="w-12 h-12 mx-auto text-cyan-400 mb-3" />
          <CardTitle className="text-white">{eventTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'error' && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {message}
            </div>
          )}

          <Button
            onClick={handleCheckIn}
            disabled={status === 'checking'}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
          >
            {status === 'checking' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              'Enregistrer ma présence'
            )}
          </Button>

          {!token && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              ❗ Ce QR code n’est pas valide. Assurez-vous de scanner le bon lien.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}