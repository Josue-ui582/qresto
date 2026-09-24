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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 text-left overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-amber-700 animate-spin" />
                <span>Visualiseur 3D Interactif</span>
              </span>
              <span className="text-xs text-stone-400 font-medium">Glissez la souris ou touchez pour pivoter</span>
            </div>

            <h3 className="text-2xl font-black text-stone-900 font-display mb-1">{dish.name}</h3>
            <p className="text-xs text-stone-500 mb-4">{dish.description}</p>

            {/* Canvas 3D Viewer inside modal */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 mb-6">
              <Dish3DViewer modelType={dish.modelType} dishName={dish.name} />
            </div>

            {/* Bottom modal actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100">
              <div>
                <div className="text-xl font-black text-stone-900 font-display">
                  {dish.price.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-[11px] text-stone-400">Préparé à la minute · Ingrédients frais</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
                >
                  Fermer
                </button>

                <Link href={`/restaurant/chez-mama-benin?table=4`}> 
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onClose()}
                    className="px-6 py-2.5 rounded-xl bg-linear-to-r from-amber-600 to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all cursor-pointer"
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
