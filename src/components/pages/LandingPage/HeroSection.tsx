'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  QrCode,
  Sparkles,
  ArrowRight,
  RotateCw,
  Utensils,
  Store,
  Clock,
  Flame,
} from 'lucide-react';
import { Dish3DSelection, DishModelType } from '@/types';
import Link from 'next/link';

interface HeroDish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  prepTime: string;
  model3DType: string | null;
  isPopular: boolean;
  restaurant: {
    name: string;
    slug: string;
    currency: string;
    tables: Array<{ number: string }>;
  };
}

interface HeroSectionProps {
  onSelectDish: (dish: Dish3DSelection) => void;
}

const dishModelTypes: readonly string[] = [
  'poulet_braise',
  'poisson_grille',
  'igname_pile',
  'burger',
  'alloco',
  'cocktail',
];

function isDishModelType(value: string | null): value is DishModelType {
  return value !== null && dishModelTypes.includes(value);
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectDish }) => {
  const [dish, setDish] = useState<HeroDish | null>(null);
  const selectedModelType = dish && isDishModelType(dish.model3DType)
    ? dish.model3DType
    : null;

  useEffect(() => {
    const fetchFeaturedDish = async () => {
      try {
        const response = await fetch('/api/dishes/showcase');
        if (!response.ok) throw new Error('Impossible de charger le plat à la une.');
        const data: { dishes?: HeroDish[] } = await response.json();
        setDish(data.dishes?.[0] ?? null);
      } catch (error) {
        console.error('Erreur chargement du plat à la une:', error);
      }
    };

    void fetchFeaturedDish();
  }, []);

  return (
    <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle radial warmth background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-linear-to-b from-amber-200/40 via-orange-100/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Value Proposition & Action Triggers */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-center text-center"
          >
            {/* Refined Pill-Free Region Label with Live Pulse Beacon */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-amber-200/80 shadow-xs mb-6 backdrop-blur-xs">
              {/*  */}
              <span className="text-xs font-bold text-amber-800 tracking-wide">
                La digitalisation des restaurants au Bénin & en Afrique
              </span>
            </div>

            {/* Title with Playfair Display & High Contrast Typography */}
            <h1 className="text-4xl sm:text-4xl xl:text-7xl font-black text-stone-900 tracking-tight leading-[1.08] mb-6">
              L’art culinaire d’Afrique,{' '}
              <span className="relative inline-block text-amber-600 italic">
                sublimé
                <svg
                  className="absolute -bottom-2 left-0 w-full text-amber-400/40 -z-10 h-3"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path d="M0,10 Q50,0 100,10" fill="none" stroke="currentColor" strokeWidth="8" />
                </svg>
              </span>{' '}
              par le digital.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl text-stone-600 leading-relaxed mb-8 max-w-2xl font-normal">
              Menus QR par table, commandes sans compte client et visualisation 3D des plats compatibles pour les restaurants et leurs clients.
            </p>

            {/* Animated Button Row */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto mb-10">
              <Link href="/restaurants" className="btn-primary w-full sm:w-auto !rounded-full !px-5 !py-3 inline-flex items-center justify-center">
                <Utensils className="w-4 h-4" />
                <span>Explorer</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link href="/register-restaurant" className="w-full sm:w-auto px-5 py-3 rounded-full bg-stone-900 text-white font-semibold text-sm shadow-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
                <Store className="w-4 h-4 text-amber-400" />
                <span>Digitaliser mon resto</span>
              </Link>

              <Link href="/order-tracking" className="btn-secondary w-full sm:w-auto !rounded-full !px-5 !py-3 inline-flex items-center justify-center">
                <Clock className="w-4 h-4 text-stone-500" />
                <span>Suivre commande</span>
              </Link>
            </div>

            {/* Key Trust Stats without AI Slop */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-200/80 w-full max-w-xl text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-stone-950">0s</div>
                <div className="text-xs text-stone-500 font-medium mt-0.5">Téléchargement requis</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600">0</div>
                <div className="text-xs text-stone-500 font-medium mt-0.5">Compte client requis</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-stone-950">QR</div>
                <div className="text-xs text-stone-500 font-medium mt-0.5">Menu accessible sur mobile</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Live Interactive Dual Showcase (Interactive Phone & 3D Dish Live Demo) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient decoration ring */}
            <div className="absolute inset-0 bg-linear-to-tr from-amber-400/20 to-orange-500/10 rounded-[3rem] blur-2xl -z-10 transform rotate-2" />

            {/* Interactive Phone Mockup Card */}
            <div className="relative mx-auto max-w-85 sm:max-w-90 bg-white rounded-[2.5rem] p-4 shadow-2xl border-4 border-stone-900/90 shadow-amber-900/15">
              {/* Speaker pill notch */}
              <div className="w-24 h-4 bg-stone-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-stone-700/50" />
              </div>

              {/* Aperçu du menu issu des plats disponibles en base */}
              <div className="bg-[#fbf9f5] rounded-3xl p-4 border border-stone-200/80 overflow-hidden text-left">
                {/* Restaurant Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 font-black text-sm flex items-center justify-center shadow-xs">
                      Q
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 leading-tight">
                        {dish?.restaurant.name || 'Restaurants partenaires'}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{dish?.restaurant.tables[0]
                          ? `Table ${dish.restaurant.tables[0].number}`
                          : 'Menu disponible'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-bold">
                    QR Direct
                  </span>
                </div>

                {dish ? (
                  <div className="mt-3.5 relative bg-white rounded-2xl p-3 border border-stone-200/90 shadow-sm group">
                    <div className="relative h-40 rounded-xl overflow-hidden mb-3 bg-stone-100">
                      {dish.image ? (
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-stone-400">
                          <Utensils className="w-8 h-8" />
                        </div>
                      )}
                      {dish.isPopular && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>Populaire</span>
                        </div>
                      )}
                      {selectedModelType && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3" />
                          <span>3D</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-stone-900">{dish.name}</h5>
                        {dish.description && (
                          <p className="text-[11px] text-stone-500 line-clamp-1">{dish.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-amber-600">{dish.price.toLocaleString('fr-FR')}</div>
                        <div className="text-[9px] text-stone-400 font-bold">{dish.restaurant.currency}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                      {selectedModelType && (
                        <button
                          type="button"
                          onClick={() =>
                            onSelectDish({
                              id: dish.id,
                              name: dish.name,
                              price: dish.price,
                              currency: dish.restaurant.currency,
                              image: dish.image || '',
                              description: dish.description || '',
                              modelType: selectedModelType,
                              ingredients: [],
                              prepTime: dish.prepTime,
                              restaurantSlug: dish.restaurant.slug,
                            })
                          }
                          className="flex-1 py-2 rounded-xl bg-amber-100/80 hover:bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3 text-amber-700 animate-spin" style={{ animationDuration: '6s' }} />
                          <span>Tourner en 3D 360°</span>
                        </button>
                      )}

                      <Link href={`/restaurant/${dish.restaurant.slug}`} className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] transition-colors inline-flex items-center justify-center">
                        Commander
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3.5 rounded-2xl bg-white p-6 text-center text-xs text-stone-500">
                    Les plats disponibles des restaurants partenaires s’afficheront ici.
                  </div>
                )}

                <div className="mt-3 bg-stone-100/80 rounded-xl p-2 flex items-center justify-between text-[10px] text-stone-600 font-medium">
                  <span className="flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-amber-600" />
                    <span>Commande sans compte client</span>
                  </span>
                  <span className="font-bold text-stone-800">Menu numérique</span>
                </div>
              </div>
            </div>

          
          </motion.div>
        </div>
      </div>
    </section>
  );
};