'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, X } from 'lucide-react';
import { Dish3DSelection } from '@/types';
import { useNavigation } from '@/context/NavigationContext';
import { Dish3DViewer } from '@/components/3d/Dish3DViewer';
import Link from 'next/link';

interface Dish3DModalProps {
  dish: Dish3DSelection | null;
  onClose: () => void;
}

export const Dish3DModal: React.FC<Dish3DModalProps> = ({ dish, onClose }) => {
  const { navigateTo } = useNavigation();

  return (
    <AnimatePresence>
      {dish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-paper-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-ink-200 text-left overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-ink-100 hover:bg-ink-200 text-ink-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-900 text-xs font-bold flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-brand-700 animate-spin" />
                <span>Visualiseur 3D Interactif</span>
              </span>
              <span className="text-xs text-ink-400 font-medium">Glissez la souris ou touchez pour pivoter</span>
            </div>

            <h3 className="text-2xl font-black text-ink-900 mb-1">{dish.name}</h3>
            <p className="text-xs text-ink-500 mb-4">{dish.description}</p>

            {/* Canvas 3D Viewer inside modal */}
            <div className="relative rounded-2xl overflow-hidden border border-ink-200 bg-ink-950 mb-6">
              <Dish3DViewer modelType={dish.modelType} dishName={dish.name} />
            </div>

            {/* Bottom modal actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-ink-100">
              <div>
                <div className="text-xl font-black text-ink-900">
                  {dish.price.toLocaleString('fr-FR')} {dish.currency}
                </div>
                {dish.prepTime && (
                  <div className="text-[0.6875rem] text-ink-400">Temps de préparation : {dish.prepTime}</div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-ink-200 text-ink-700 font-bold text-xs hover:bg-ink-50 transition-colors"
                >
                  Fermer
                </button>

                <Link href={`/restaurant/${dish.restaurantSlug}`}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onClose()}
                    className="px-6 py-2.5 rounded-xl bg-linear-to-r from-brand-600 to-highlight-500 text-paper-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all cursor-pointer"
                  >
                    Commander ce plat
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
