// src/components/admin/UpgradeRequestActions.tsx
'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2,
  ArrowRight,
  Building2,
} from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '../../../components/ui/alert-dialog';
import { useToast } from '../../../components/ui/use-toast';

// 🔹 Props rendues partiellement optionnelles
type Props = {
  id: string;
  currentPlan?: 'basic' | 'premium'; // ✅ optionnel
  targetPlan?: 'entreprise';        // ✅ optionnel
};

export function UpgradeRequestActions({
  id,
  currentPlan,
  targetPlan = 'entreprise',
}: Props) {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 🔹 Valeurs par défaut pour l'affichage
  const displayCurrentPlan = currentPlan || 'basic';
  const displayTargetPlan = targetPlan || 'entreprise';

  const approve = async () => {
    setLoading('approve');

    try {
      // ✅ CORRECT : utilise "/approved" pour le paramètre [action]
      const res = await fetch(`/api/admin/upgrade-requests/${id}/approved`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes || null }),
      });

      if (!res.ok) throw new Error();

      toast({
        title: 'Abonnement approuvé',
        description: `Le plan a été mis à jour vers "${displayTargetPlan}".`,
      });

      window.location.reload();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible d’approuver la demande.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
      setConfirmOpen(false);
    }
  };

  const reject = async () => {
    setLoading('reject');

    try {
      // ✅ CORRECT : utilise "/rejected" pour le paramètre [action]
      const res = await fetch(`/api/admin/upgrade-requests/${id}/rejected`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error();

      toast({
        title: 'Demande rejetée',
        description: 'La demande a été rejetée avec succès.',
      });

      window.location.reload();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter la demande.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* Card principale */}
      <div className="w-full max-w-lg space-y-4 rounded-xl border border-white/10 bg-gradient-to-b from-black/50 to-black/70 p-5 backdrop-blur-sm">
        
        {/* Plan */}
        <div className="flex items-center justify-between rounded-lg bg-black/30 p-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Building2 className="h-4 w-4" />
            Changement de plan
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 border-blue-700/50">
              {displayCurrentPlan}
            </Badge>
            <ArrowRight className="h-4 w-4 text-gray-500" />
            <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
              {displayTargetPlan}
            </Badge>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="flex items-center gap-1 text-xs font-medium text-gray-400">
            <MessageSquare className="h-3 w-3" />
            Note interne (optionnelle)
          </label>
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Commentaire admin, justification, condition…"
            className="resize-none bg-black/30 border-white/10 focus:border-cyan-500/50"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={reject}
            disabled={loading !== null}
            className="border-red-800/50 hover:bg-red-900/50"
          >
            {loading === 'reject' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <XCircle className="mr-1 h-4 w-4" />
                Rejeter
              </>
            )}
          </Button>

          <Button
            size="sm"
            className="bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600 shadow-md"
            onClick={() => setConfirmOpen(true)}
            disabled={loading !== null}
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            Approuver
          </Button>
        </div>
      </div>

      {/* Modal confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-gradient-to-b from-gray-900 to-black border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Confirmer l’activation du plan entreprise
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground">
                Cette action :
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-gray-400">
                  <li>active un abonnement entreprise</li>
                  <li>met à jour le profil utilisateur</li>
                  <li>autorise la création d’une entreprise</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 border-gray-700">
              Annuler
            </AlertDialogCancel>
            <Button
              onClick={approve}
              disabled={loading === 'approve'}
              className="bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600"
            >
              {loading === 'approve' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Confirmer'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}