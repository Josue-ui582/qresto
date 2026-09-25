'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Image as ImageIcon,
  CheckCircle2,
  EyeOff,
  Eye,
  Tag,
  Edit3,
  Trash2,
} from 'lucide-react';
import { DishData } from './types';

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
      className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
        dish.isAvailable ? 'border-stone-200/90' : 'border-stone-200 bg-stone-50/50'
      }`}
    >
      <div>
        {/* Visuel principal / Placeholder */}
        <div className="relative h-44 bg-stone-100 w-full overflow-hidden">
          {dish.imageUrl ? (
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                !dish.isAvailable ? 'grayscale opacity-75' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Pas d'image
              </span>
            </div>
          )}

          {/* Badge de Disponibilité */}
          <div className="absolute top-3 right-3">
            <button
              onClick={() => onToggleAvailability(dish)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-all ${
                dish.isAvailable
                  ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                  : 'bg-stone-900/80 text-amber-400 hover:bg-stone-900'
              }`}
            >
              {dish.isAvailable ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Disponible</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 text-amber-400" />
                  <span>Épuisé</span>
                </>
              )}
            </button>
          </div>

          {/* Badge Catégorie */}
          {dish.category && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 rounded-xl bg-stone-950/80 text-stone-200 text-[10px] font-bold backdrop-blur-md flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" />
                <span>{dish.category.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Détails du plat */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base font-bold text-stone-950 font-display group-hover:text-amber-700 transition-colors line-clamp-1">
              {dish.name}
            </h3>
            <span className="text-sm font-black text-amber-700 font-display shrink-0">
              {dish.price.toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-normal min-h-8">
            {dish.description || 'Aucune description saisie pour ce plat.'}
          </p>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
        <button
          onClick={() => onToggleAvailability(dish)}
          className="text-stone-500 hover:text-stone-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          {dish.isAvailable ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-stone-400" />
              <span>Masquer</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>Réactiver</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(dish)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Éditer</span>
          </button>

          <button
            onClick={() => onDeleteRequest(dish.id)}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
