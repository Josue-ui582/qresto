'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UtensilsCrossed, X, AlertTriangle, Loader2, Check } from 'lucide-react';
import { DishData, DishFormData, CategoryOption } from './types';

interface DishFormModalProps {
  isOpen: boolean;
  editingDish: DishData | null;
  formData: DishFormData;
  categoriesList: CategoryOption[];
  onChangeFormData: (updated: DishFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
  formError: string | null;
}

export const DishFormModal: React.FC<DishFormModalProps> = ({
  isOpen,
  editingDish,
  formData,
  categoriesList,
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
          className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-950 font-display">
                  {editingDish ? 'Éditer le plat' : 'Nouveau plat'}
                </h3>
                <p className="text-[11px] text-stone-500">
                  Ajustez les informations présentées au client.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Nom du plat <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => onChangeFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Poulet Yassa, Alloco Poisson, Mojito..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Prix (FCFA) <span className="text-amber-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={50}
                  value={formData.price}
                  onChange={(e) => onChangeFormData({ ...formData, price: e.target.value })}
                  placeholder="Ex: 3500"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Catégorie <span className="text-amber-600">*</span>
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => onChangeFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium cursor-pointer"
                >
                  <option value="" disabled>
                    Sélectionner...
                  </option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                URL de l'image (facultatif)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => onChangeFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Description / Ingrédients
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => onChangeFormData({ ...formData, description: e.target.value })}
                placeholder="Description attrayante ou ingrédients principaux..."
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium resize-none"
              />
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-stone-900">
                  Disponible à la commande
                </span>
                <span className="text-[11px] text-stone-500">
                  Décochez si le plat est temporairement en rupture de stock.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => onChangeFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
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
                    <span>{editingDish ? 'Mettre à jour' : 'Créer le plat'}</span>
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
