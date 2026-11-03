'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, X, AlertTriangle, Loader2, Check } from 'lucide-react';
import { TableData, TableFormData } from './types';

interface TableFormModalProps {
  isOpen: boolean;
  editingTable: TableData | null;
  formData: TableFormData;
  formError: string | null;
  isSubmitting: boolean;
  onFormChange: (data: TableFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TableFormModal: React.FC<TableFormModalProps> = ({
  isOpen,
  editingTable,
  formData,
  formError,
  isSubmitting,
  onFormChange,
  onClose,
  onSubmit,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-paper-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-ink-200 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-brand-500/10 text-brand-700 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink-950">
                    {editingTable ? 'Éditer la table' : 'Nouvelle table'}
                  </h3>
                  <p className="text-[0.6875rem] text-ink-500">
                    Définissez le numéro et la capacité d'accueil.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-ink-100 hover:bg-ink-200 text-ink-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-alert-50 border border-alert-200 text-alert-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-alert-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">
                    Numéro de table <span className="text-brand-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.number}
                    onChange={(e) => onFormChange({ ...formData, number: e.target.value })}
                    placeholder="Ex: 1"
                    className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-xs sm:text-sm text-ink-900 focus:outline-none focus:border-brand-500 focus:bg-paper-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">
                    Capacité (Couverts)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => onFormChange({ ...formData, capacity: e.target.value })}
                    placeholder="Ex: 4"
                    className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-xs sm:text-sm text-ink-900 focus:outline-none focus:border-brand-500 focus:bg-paper-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1.5">
                  Nom / Emplacement (facultatif)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                  placeholder="Ex: Terrasse, Saloon VIP, Table 4 B"
                  className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-xs sm:text-sm text-ink-900 focus:outline-none focus:border-brand-500 focus:bg-paper-white transition-all font-medium"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-ink-950 hover:bg-ink-800 text-paper-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-brand-400" />
                      <span>{editingTable ? 'Mettre à jour' : 'Créer la table'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
