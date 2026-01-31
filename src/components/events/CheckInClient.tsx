// src/components/events/CheckInClient.tsx
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Ajouter Input
import { Loader2, QrCode, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckInClient({
  eventId,
  eventTitle,
  token,
  isOrganizer,
  requiresName = false, // Nouvelle prop pour indiquer si le nom est requis
}: {
  eventId: string;
  eventTitle: string;
  token: string | null;
  isOrganizer: boolean;
  requiresName?: boolean; // Optionnel
}) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [inputName, setInputName] = useState(''); // État pour le nom saisi

  useEffect(() => {
    if (!token) {
      setMessage('QR code invalide. Aucun jeton fourni.');
      setStatus('error');
    } else {
      setStatus('idle');
    }
  }, [token]);

  const handleCheckIn = async () => {
    if (!token) {
      setMessage('QR code invalide. Veuillez scanner un QR valide.');
      setStatus('error');
      return;
    }

    // 🔹 Vérifier le nom si requis
    if (requiresName && !inputName.trim()) {
      setMessage('Veuillez entrer votre nom.');
      setStatus('error');
      return;
    }

    setStatus('checking');
    try {
      const res = await fetch(`/api/events/${eventId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name: requiresName ? inputName.trim() : undefined }), // 🔹 Envoyer le nom si requis
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(`✅ Bienvenue, ${data.name || 'participant'} !`);
      } else {
        setStatus('error');
        // 🔹 Gérer les nouveaux messages d'erreur
        setMessage(data.error || 'Erreur lors du check-in.');
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
      setStatus('error');
      setMessage('Erreur réseau. Impossible de joindre le serveur.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
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
          {/* 🔹 Champ de saisie du nom, conditionnel */}
          {requiresName && (
            <div className="mb-4">
              <label htmlFor="check-in-name" className="block text-sm font-medium text-gray-300 mb-2">
                Votre nom complet *
              </label>
              <Input
                id="check-in-name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Entrez votre nom"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          )}
          {status === 'error' && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              <div className="flex items-start gap-2">
                 <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                 <span>{message}</span>
              </div>
            </div>
          )}
          <Button
            onClick={handleCheckIn}
            disabled={status === 'checking' || !token} // Désactiver si checking ou token manquant
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