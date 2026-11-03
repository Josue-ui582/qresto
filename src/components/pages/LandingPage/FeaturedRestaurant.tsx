'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, ArrowRight, QrCode, Loader2, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { RestaurantItem } from '@/types';

export const FeaturedRestaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeaturedRestaurants = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/restaurants/featured');
        if (!res.ok) throw new Error('Erreur chargement restaurants');
        const data = await res.json();
        setRestaurants(data.restaurants || []);
      } catch (error) {
        console.error('Erreur chargement restaurants certifiés:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedRestaurants();
  }, []);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-paper-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col items-center gap-5 text-center"
        >
          <div className="max-w-3xl">
            <div className="text-xs uppercase font-extrabold tracking-widest text-brand-700 mb-2">
              Établissements Certifiés
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-ink-950">
              Restaurants digitalisés
            </h2>
            <p className="text-sm sm:text-base text-ink-500 mt-2 font-normal">
              Découvrez comment les meilleurs chefs et gérants modernisent leur service en salle.
            </p>
          </div>

          <Link href="/restaurants">
            <motion.p
              className="px-5 py-2.5 rounded-full border border-ink-200 hover:border-ink-900 text-ink-800 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Voir tous les restaurants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.p>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-ink-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
            <span className="text-xs font-medium">Chargement des établissements...</span>
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {restaurants.map((resto, i) => {
              const image = resto.coverImage || resto.logo;
              const badge = resto.cuisineType || resto.category;
              const status = resto.isOpen ? 'Ouvert' : 'Fermé';
              const neighborhood = resto.city || resto.address;
              const tableCount = resto._count?.tables || 0;

              return (
                <motion.div
                  key={resto.id || resto.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  whileHover={{ y: -6 }}
                  className="bg-surface-warm rounded-3xl overflow-hidden border border-ink-200/90 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="relative h-52 overflow-hidden bg-ink-100">
                      {image ? (
                        <img
                          src={image}
                          alt={resto.name}
                          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-ink-400">
                          <UtensilsCrossed className="w-10 h-10" />
                        </div>
                      )}
                      {badge && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-ink-900/80 backdrop-blur-xs text-paper-white text-[0.625rem] font-bold">
                          {badge}
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-paper-white text-[0.625rem] font-bold flex items-center gap-1 shadow-sm ${
                        resto.isOpen ? 'bg-positive-500' : 'bg-negative-500'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-paper-white" />
                        <span>{status}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-ink-500">{neighborhood}</span>
                        {resto.rating > 0 && resto.reviewCount > 0 && (
                          <div className="flex items-center gap-1 text-xs font-bold text-brand-600">
                            <Star className="w-3.5 h-3.5 fill-brand-400 text-brand-400" />
                            <span>{resto.rating.toFixed(1)}</span>
                            <span className="text-ink-400 font-normal">({resto.reviewCount})</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-ink-950 mb-2 group-hover:text-brand-700 transition-colors">
                        {resto.name}
                      </h3>
                      {resto.description && (
                        <p className="text-xs text-ink-600 leading-relaxed font-normal mb-4 line-clamp-2">
                          {resto.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
                        <QrCode className="w-3.5 h-3.5 text-brand-600" />
                        <span>{tableCount > 0 ? `${tableCount} tables équipées en QR dynamique` : 'Menu QR Code à table'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-ink-200/60 mt-3 flex items-center justify-between">
                    <Link href={`/restaurant/${resto.slug}`} className="text-xs font-bold text-ink-700 group-hover:text-ink-950">
                      Consulter la carte
                    </Link>
                    <Link href={`/restaurant/${resto.slug}`} className="w-8 h-8 rounded-full bg-ink-900 text-paper-white flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-warm rounded-3xl p-8 text-center border border-ink-200 max-w-md mx-auto">
            <UtensilsCrossed className="w-10 h-10 text-ink-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-ink-800">Aucun établissement disponible</p>
            <p className="text-xs text-ink-500 mt-1">
              Les établissements partenaires seront affichés dès leur inscription.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
