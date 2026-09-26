'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Layers, Edit3, Trash2 } from 'lucide-react';
import { CategoryData } from './types';

interface CategoryCardProps {
  category: CategoryData;
  onEdit: (category: CategoryData) => void;
  onDeleteRequest: (id: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDeleteRequest,
}) => {
  const dishCount = category._count?.dishes || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs">
              #{category.order || 0}
            </div>
            <h3 className="text-base font-bold text-stone-950 group-hover:text-amber-700 transition-colors font-display">
              {category.name}
            </h3>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 text-[11px] font-bold shrink-0 flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-600" />
            <span>{dishCount} plat{dishCount > 1 ? 's' : ''}</span>
          </span>
        </div>

        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-6 font-normal min-h-8">
          {category.description || 'Aucune description renseignée pour cette catégorie.'}
        </p>
      </div>

      <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Ordre : {category.order || 0}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Éditer</span>
          </button>

          <button
            onClick={() => onDeleteRequest(category.id)}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
