'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderPlus, X, AlertTriangle, Loader2, Check } from 'lucide-react';
import { CategoryData, CategoryFormData } from './types';

interface CategoryFormModalProps {
  isOpen: boolean;
  editingCategory: CategoryData | null;
  formData: CategoryFormData;
  onChangeFormData: (updated: CategoryFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
  formError: string | null;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  editingCategory,
  formData,
  onChangeFormData,
  onSubmit,
  onClose,
  isSubmitting,
  formError,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-950 font-display">
                  {editingCategory ? 'Éditer la catégorie' : 'Nouvelle catégorie'}
                </h3>
                <p className="text-[11px] text-stone-500">
                  Renseignez les détails ci-dessous.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nom de la catégorie <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => onChangeFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Entrées froides, Desserts, Grillades..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Description (facultatif)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => onChangeFormData({ ...formData, description: e.target.value })}
                placeholder="Brève explication affichée sur la carte..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Ordre d'affichage
              </label>
              <input
                type="number"
                min={0}
                value={formData.sortOrder}
                onChange={(e) =>
                  onChangeFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>{editingCategory ? 'Mettre à jour' : 'Créer'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
