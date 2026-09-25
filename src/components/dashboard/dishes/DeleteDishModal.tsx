'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface DeleteDishModalProps {
  deletingId: string | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isDeleting: boolean;
}

export const DeleteDishModal: React.FC<DeleteDishModalProps> = ({
  deletingId,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!deletingId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-stone-200 shadow-2xl"
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-950 font-display mb-1">
            Supprimer ce plat ?
          </h3>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            Le plat sera définitivement retiré du menu interactif de vos clients.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={() => onConfirm(deletingId)}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>Supprimer</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
