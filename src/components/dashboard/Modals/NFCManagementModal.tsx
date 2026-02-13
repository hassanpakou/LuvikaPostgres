// src/components/dashboard/modals/NFCManagementModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Lock, AlertTriangle, RotateCcw, Flag, QrCode, 
  Check, EyeOff, RefreshCcw, Loader2, Key, ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { NFCCard } from '@/src/types/nfc';

type NFC_Card = {
  id: string;
  card_id: string;
  matricule: string | null;
  status: 'active' | 'lost' | 'blocked' | 'inactive';
  created_at: string;
};

type Action = 'block' | 'lost' | 'reset' | 'report' | 'reactivate' | 'modify_qr';

const ACTION_CONFIG = {
  block: {
    icon: Lock,
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    label: 'Bloquer carte',
    description: 'Bloque totalement l\'usage de la carte',
    requiresMatricule: true,
    requiresReason: false,
    confirmText: 'Confirmer le blocage définitif',
    successMessage: 'Carte bloquée définitivement'
  },
  lost: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    label: 'Déclarer perdue',
    description: 'Carte perdue par le propriétaire',
    requiresMatricule: true,
    requiresReason: true,
    confirmText: 'Confirmer la perte',
    successMessage: 'Carte déclarée perdue'
  },
  reset: {
    icon: RotateCcw,
    color: 'text-purple-400',
    bg: 'bg-purple-500/15',
    label: 'Réinitialiser',
    description: 'Supprime lien + QR + profil',
    requiresMatricule: true,
    requiresReason: false,
    confirmText: 'Confirmer la réinitialisation',
    successMessage: 'Carte réinitialisée avec nouveau QR'
  },
  report: {
    icon: Flag,
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    label: 'Signaler',
    description: 'Signale un problème (abus, vol…)',
    requiresMatricule: false,
    requiresReason: true,
    confirmText: 'Envoyer le signalement',
    successMessage: 'Signalement enregistré'
  },
  reactivate: {
    icon: RefreshCcw,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    label: 'Réactiver',
    description: 'Réactive une carte bloquée ou perdue',
    requiresMatricule: true,
    requiresReason: false,
    confirmText: 'Confirmer la réactivation',
    successMessage: 'Carte réactivée'
  },
  modify_qr: {
    icon: QrCode,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    label: 'Modifier QR',
    description: 'Génère un nouveau QR unique',
    requiresMatricule: true,
    requiresReason: false,
    confirmText: 'Générer nouveau QR',
    successMessage: 'Nouveau QR généré'
  }
};

export default function NFCManagementModal({
  isOpen,
  onClose,
  card, // ✅ Type partagé
  onActionComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  card: NFCCard | null; // ✅ Compatible avec useState
  onActionComplete: () => void;
}) {
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [matriculeInput, setMatriculeInput] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [maskedMatricule, setMaskedMatricule] = useState('');

  // 🔹 Masquer le matricule (afficher uniquement les 3 derniers caractères)
  useEffect(() => {
    if (card?.matricule) {
      const visibleChars = 3;
      const masked = '*'.repeat(Math.max(0, card.matricule.length - visibleChars)) + 
                     card.matricule.slice(-visibleChars);
      setMaskedMatricule(masked);
    }
  }, [card]);

  const handleActionSelect = (action: Action) => {
    setSelectedAction(action);
    setMatriculeInput('');
    setReason('');
    setShowConfirmation(false);
  };

  const handleConfirmAction = async () => {
    if (!card || !selectedAction) return;
    
    // 🔹 Validation matricule si requis
    const config = ACTION_CONFIG[selectedAction];
    if (config.requiresMatricule && matriculeInput.trim().toUpperCase() !== card.matricule) {
      toast.error('❌ Matricule incorrect', {
        description: 'Vérifiez le numéro sur votre carte physique'
      });
      return;
    }

    // 🔹 Validation raison si requise
    if (config.requiresReason && !reason.trim()) {
      toast.warning('⚠️ Raison requise', {
        description: 'Veuillez indiquer le motif de cette action'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/nfc/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          matricule: matriculeInput.trim().toUpperCase(),
          action: selectedAction,
          reason: reason.trim() || null
        }),
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Erreur action');
      
      toast.success('✅ ' + config.successMessage, {
        duration: 5000,
      });
      
      if (result.newQrUrl) {
        toast.info('🆕 Nouveau QR généré', {
          description: `URL: ${result.newQrUrl}`,
          duration: 8000,
        });
      }
      
      onActionComplete();
      onClose();
    } catch (error: any) {
      console.error('Action error:', error);
      toast.error('❌ Échec de l\'action', {
        description: error.message || 'Veuillez réessayer',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !card) return null;

  const isCardActive = card.status === 'active';
  const availableActions: Action[] = isCardActive 
    ? ['block', 'lost', 'reset', 'report', 'modify_qr']
    : ['reactivate', 'report'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* 🔘 Bouton fermeture */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-gray-300 hover:text-white transition-all duration-300"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col h-full">
            {/* 🔹 Header */}
            <div className="sticky top-0 z-40 bg-gradient-to-b from-gray-900/95 to-transparent backdrop-blur-sm border-b border-white/10 py-5 px-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/15 rounded-2xl">
                  <Key className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                    Gestion de la carte NFC
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="bg-white/10 border-white/20">
                      <span className="font-mono text-sm">{card.card_id}</span>
                    </Badge>
                    <Badge className={
                      card.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      card.status === 'lost' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      card.status === 'blocked' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 
                      'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }>
                      {card.status === 'active' && <Check className="w-3 h-3 mr-1" />}
                      {card.status === 'lost' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {card.status === 'blocked' && <Lock className="w-3 h-3 mr-1" />}
                      {card.status}
                    </Badge>
                    {card.matricule && (
                      <div className="flex items-center gap-1.5 text-sm text-blue-300/80">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-mono">{maskedMatricule}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 🔹 Contenu scrollable */}
            <div className="flex-grow overflow-y-auto overscroll-contain py-6 px-4 sm:px-6 md:px-8">
              {!selectedAction ? (
                // 🔹 Sélection de l'action
                <div className="space-y-4">
                  <p className="text-gray-400 text-center mb-6">
                    Sélectionnez une action à effectuer sur cette carte. 
                    <span className="block mt-1 font-medium text-amber-400">
                      {isCardActive ? '⚠️ Actions irréversibles pour les cartes actives' : '✅ Carte actuellement désactivée'}
                    </span>
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableActions.map((action) => {
                      const config = ACTION_CONFIG[action];
                      const Icon = config.icon;
                      
                      return (
                        <button
                          key={action}
                          onClick={() => handleActionSelect(action)}
                          className={`p-5 rounded-2xl border transition-all ${
                            isCardActive 
                              ? 'border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5' 
                              : 'border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                          } text-left group`}
                        >
                          <div className={`w-12 h-12 rounded-xl ${config.bg} ${config.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                            {config.label}
                            {config.requiresMatricule && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-blue-500/30 text-blue-300">
                                Matricule requis
                              </Badge>
                            )}
                          </h3>
                          <p className="text-gray-400 text-sm">{config.description}</p>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-bold">Sécurité renforcée :</span> Les actions sensibles (bloquer, déclarer perdue, réinitialiser) 
                        nécessitent la saisie du <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">matricule</span> visible sur votre carte physique. 
                        Cela garantit que seul le propriétaire légitime peut effectuer ces actions.
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                // 🔹 Formulaire de confirmation
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-2xl ${ACTION_CONFIG[selectedAction].bg} ${ACTION_CONFIG[selectedAction].color} flex items-center justify-center mx-auto mb-4`}>
                      {(() => {
                        const Icon = ACTION_CONFIG[selectedAction].icon;
                        return <Icon className="w-8 h-8" />;
                      })()}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {ACTION_CONFIG[selectedAction].label}
                    </h3>
                    <p className="text-gray-400">
                      {ACTION_CONFIG[selectedAction].description}
                    </p>
                  </div>

                  {/* 🔹 Saisie matricule si requis */}
                  {ACTION_CONFIG[selectedAction].requiresMatricule && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                        <Key className="w-4 h-4" />
                        Matricule de la carte (visible sur la carte physique)
                      </label>
                      <Input
                        value={matriculeInput}
                        onChange={(e) => setMatriculeInput(e.target.value)}
                        placeholder="Ex: NFC-AB123-XYZ"
                        className="font-mono bg-white/5 border-white/15 focus:border-blue-500/50"
                        maxLength={20}
                      />
                      <p className="text-xs text-blue-300/80">
                        Format: Lettres majuscules et chiffres uniquement • Exemple: {card.matricule?.slice(0, 8)}...
                      </p>
                    </div>
                  )}

                  {/* 🔹 Raison si requise */}
                  {ACTION_CONFIG[selectedAction].requiresReason && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Motif de l'action
                      </label>
                      <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={selectedAction === 'lost' 
                          ? 'Où et quand avez-vous perdu la carte ?' 
                          : 'Décrivez le problème ou l\'abus observé'}
                        className="min-h-[100px] bg-white/5 border-white/15 focus:border-amber-500/50"
                        maxLength={500}
                      />
                      <p className="text-right text-xs text-gray-500">{reason.length}/500</p>
                    </div>
                  )}

                  {/* 🔹 Confirmation */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedAction(null)}
                        className="border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        ← Retour aux actions
                      </Button>
                      <Button
                        onClick={() => setShowConfirmation(true)}
                        disabled={isSubmitting || 
                          (ACTION_CONFIG[selectedAction].requiresMatricule && !matriculeInput.trim()) ||
                          (ACTION_CONFIG[selectedAction].requiresReason && !reason.trim())}
                        className={`${
                          selectedAction === 'block' || selectedAction === 'lost' 
                            ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600' 
                            : selectedAction === 'reactivate'
                            ? 'bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600'
                            : 'bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-500 hover:to-cyan-600'
                        } text-white`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            {ACTION_CONFIG[selectedAction].confirmText}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 🔹 Footer */}
            <div className="sticky bottom-0 z-40 bg-gradient-to-t from-gray-900/95 to-transparent backdrop-blur-sm border-t border-white/10 py-4 px-6">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <span>Toutes les actions sont journalisées et sécurisées</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 🔹 Modal de confirmation finale */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[101] flex items-center justify-center p-4"
              onClick={() => setShowConfirmation(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md glass-border backdrop-blur-xl rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-amber-900/10 p-6"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-3 bg-amber-500/20 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Confirmation finale
                    </h3>
                    <p className="text-amber-200 mb-4">
                      Êtes-vous absolument certain de vouloir{' '}
                      <span className="font-bold">{ACTION_CONFIG[selectedAction!].label.toLowerCase()}</span> 
                      {' '}cette carte NFC ?
                      <br />
                      <span className="text-sm mt-2 block">
                        {selectedAction === 'block' && '⚠️ Cette action est irréversible. La carte sera définitivement inutilisable.'}
                        {selectedAction === 'lost' && '⚠️ Cette déclaration est définitive. Vous ne pourrez plus utiliser cette carte.'}
                        {selectedAction === 'reset' && '🔄 Toutes les données liées à cette carte seront supprimées. Un nouveau QR sera généré.'}
                        {selectedAction === 'reactivate' && '✅ La carte retrouvera son statut actif et pourra être utilisée normalement.'}
                      </span>
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowConfirmation(false)}
                        className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleConfirmAction}
                        disabled={isSubmitting}
                        className={`flex-1 ${
                          selectedAction === 'block' || selectedAction === 'lost'
                            ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600'
                            : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600'
                        } text-white`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Confirmation...
                          </>
                        ) : (
                          'Confirmer définitivement'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}