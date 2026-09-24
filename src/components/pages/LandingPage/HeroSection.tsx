'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCw,
  Utensils,
  Store,
  Clock,
  Flame,
} from 'lucide-react';
import { Dish3DSelection } from '@/types';
import { useNavigation } from '@/context/NavigationContext';
import Link from 'next/link';

interface HeroSectionProps {
  onSelectDish: (dish: Dish3DSelection) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectDish }) => {
  const { navigateTo } = useNavigation();

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
            className="lg:col-span-7 text-left flex flex-col items-start"
          >
            {/* Refined Pill-Free Region Label with Live Pulse Beacon */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-amber-200/80 shadow-xs mb-6 backdrop-blur-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-amber-900 tracking-wide">
                La digitalisation des restaurants au Bénin & en Afrique
              </span>
            </div>

            {/* Title with Playfair Display & High Contrast Typography */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-stone-950 tracking-tight leading-[1.08] mb-6 font-display">
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
              Menus QR dynamiques par table, visualiseur 3D interactif et encaissement Mobile Money instantané sans friction pour les restaurants et leurs clients.
            </p>

            {/* Animated Button Row */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto mb-10">
              <Link href="/restaurants" className="btn-primary w-full sm:w-auto inline-flex items-center justify-center">
                <Utensils className="w-4 h-4" />
                <span>Explorer les restaurants</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link href="/register-restaurant" className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-stone-900 text-white font-bold text-sm shadow-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
                <Store className="w-4 h-4 text-amber-400" />
                <span>Digitaliser mon restaurant</span>
              </Link>

              <Link href="/order-tracking" className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center">
                <Clock className="w-4 h-4 text-stone-500" />
                <span>Suivre commande</span>
              </Link>
            </div>

            {/* Key Trust Stats without AI Slop */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-stone-200/80 w-full max-w-xl">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">0s</div>
                <div className="text-xs text-stone-500 font-medium mt-0.5">Téléchargement requis</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 font-display">+32%</div>
                <div className="text-xs text-stone-500 font-medium mt-0.5">Panier moyen constaté</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">1.5s</div>
                <div className="text-xs text-stone-500 font-medium mt-0.5">Vitesse d’affichage QR</div>
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

              {/* Simulated Screen Content */}
              <div className="bg-[#fbf9f5] rounded-3xl p-4 border border-stone-200/80 overflow-hidden text-left">
                {/* Restaurant Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 font-black text-sm flex items-center justify-center shadow-xs">
                      Q
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 leading-tight">Chez Mama Bénin</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Table 04 · En service</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-bold">
                    QR Direct
                  </span>
                </div>

                {/* Featured interactive dish inside simulator */}
                <div className="mt-3.5 relative bg-white rounded-2xl p-3 border border-stone-200/90 shadow-sm group">
                  <div className="relative h-40 rounded-xl overflow-hidden mb-3 bg-stone-100">
                    <img
                      src="/images/poulet_braise_1790196218496.jpg"
                      alt="Poulet braisé"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>Best-seller</span>
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>3D Dispo</span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-stone-900">Poulet Bicyclette Braisé</h5>
                      <p className="text-[11px] text-stone-500 line-clamp-1">Alloco doré, piment vert maison & oignons</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-amber-600">4 500</div>
                      <div className="text-[9px] text-stone-400 font-bold">FCFA</div>
                    </div>
                  </div>

                  {/* Interactive Action inside phone */}
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectDish({
                          id: 'dish_poulet',
                          name: 'Poulet Bicyclette Braisé Kpédji',
                          price: 4500,
                          description: 'Poulet fermier mariné 24h aux épices royales avec alloco croustillant.',
                          modelType: 'poulet_braise',
                          ingredients: ['Poulet bicyclette', 'Alloco bananes mûres', 'Piment vert maison'],
                          prepTime: '20 min',
                        })
                      }
                      className="flex-1 py-2 rounded-xl bg-amber-100/80 hover:bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3 text-amber-700 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>Tourner en 3D 360°</span>
                    </button>

                          <Link href="/restaurant/chez-mama-benin?table=4" className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] transition-colors inline-flex items-center justify-center">
                            Commander
                          </Link>
                  </div>
                </div>

                {/* Payment Icons Footer in simulator */}
                <div className="mt-3 bg-stone-100/80 rounded-xl p-2 flex items-center justify-between text-[10px] text-stone-600 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>MoMo & Moov acceptés</span>
                  </span>
                  <span className="font-bold text-stone-800">100% Sécurisé</span>
                </div>
              </div>
            </div>

            {/* Floating Animated Badges outside phone */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -left-6 sm:-left-8 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-stone-200/90 text-left flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">Scan Instantané</div>
                <div className="text-[11px] text-stone-500">Table assignée automatiquement</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-stone-200/90 text-left flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">En cuisine en 2s</div>
                <div className="text-[11px] text-emerald-700 font-semibold">0 attente serveur</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};