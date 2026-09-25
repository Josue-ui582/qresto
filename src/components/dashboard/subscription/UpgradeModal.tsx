'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Loader2, Check } from 'lucide-react';
import { PlanCatalogItem } from './types';

interface UpgradeModalProps {
  selectedPlan: PlanCatalogItem | null;
  billingCycle: 'MONTHLY' | 'YEARLY';
  isSubmitting: boolean;
  formatPrice: (amount: number) => string;
  onClose: () => void;
  onConfirm: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  selectedPlan,
  billingCycle,
  isSubmitting,
  formatPrice,
  onClose,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-950 font-display">
                    Confirmer le changement
                  </h3>
                  <p className="text-[11px] text-stone-500">Mise à niveau instantanée.</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Formule sélectionnée
                </span>
                <div className="text-lg font-bold text-stone-950 font-display">
                  {selectedPlan.name}
                </div>
                <div className="text-sm font-black text-amber-700 mt-1">
                  {formatPrice(
                    billingCycle === 'YEARLY'
                      ? selectedPlan.yearlyPrice
                      : selectedPlan.monthlyPrice
                  )}{' '}
                  <span className="text-xs text-stone-500 font-normal">
                    ({billingCycle === 'YEARLY' ? 'Facturation Annuelle' : 'Facturation Mensuelle'})
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">
                En confirmant, votre établissement basculera immédiatement sur les fonctionnalités de la formule{' '}
                <strong className="text-stone-900">{selectedPlan.name}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activation...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Activer maintenant</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
