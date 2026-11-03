'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  EyeOff,
  Eye,
  Tag,
  Edit3,
  Trash2,
} from 'lucide-react';
import { DishData } from './types';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

interface DishCardProps {
  dish: DishData;
  onToggleAvailability: (dish: DishData) => void;
  onEdit: (dish: DishData) => void;
  onDeleteRequest: (id: string) => void;
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  onToggleAvailability,
  onEdit,
  onDeleteRequest,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`bg-paper-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${dish.isAvailable ? 'border-ink-200/90' : 'border-ink-200 bg-ink-50/50'
        }`}
    >
      <div>
        {/* Visuel principal / Placeholder */}
        <div className="relative h-44 bg-ink-100 w-full overflow-hidden">
          <ImageWithFallback
            src={dish.image || dish.imageUrl}
            alt={dish.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${!dish.isAvailable ? 'grayscale opacity-75' : ''}`}
            placeholderClassName="flex h-full w-full flex-col items-center justify-center bg-ink-100 text-ink-300"
          />

          {/* Badge de Disponibilité */}
          <div className="absolute top-3 right-3">
            <button
              onClick={() => onToggleAvailability(dish)}
              className={`px-3 py-1.5 rounded-full text-[0.625rem] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-all ${dish.isAvailable
                  ? 'bg-positive-500/90 text-paper-white hover:bg-positive-600'
                  : 'bg-ink-900/80 text-brand-400 hover:bg-ink-900'
                }`}
            >
              {dish.isAvailable ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Disponible</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 text-brand-400" />
                  <span>Épuisé</span>
                </>
              )}
            </button>
          </div>

          {/* Badge Catégorie */}
          {dish.category && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 rounded-xl bg-ink-950/80 text-ink-200 text-[0.625rem] font-bold backdrop-blur-md flex items-center gap-1">
                <Tag className="w-3 h-3 text-brand-400" />
                <span>{dish.category.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Détails du plat */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base font-bold text-ink-950 group-hover:text-brand-700 transition-colors line-clamp-1">
              {dish.name}
            </h3>
            <span className="text-sm font-black text-brand-700 shrink-0">
              {dish.price.toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          <p className="text-xs text-ink-500 line-clamp-2 leading-relaxed font-normal min-h-8">
            {dish.description || 'Aucune description saisie pour ce plat.'}
          </p>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-ink-100 mt-2">
        <button
          onClick={() => onToggleAvailability(dish)}
          className="text-ink-500 hover:text-ink-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          {dish.isAvailable ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-ink-400" />
              <span>Masquer</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-brand-600" />
              <span>Réactiver</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(dish)}
            className="p-2 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Éditer</span>
          </button>

          <button
            onClick={() => onDeleteRequest(dish.id)}
            className="p-2 rounded-xl bg-alert-50 hover:bg-alert-100 text-alert-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
