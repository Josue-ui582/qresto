'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, ArrowRight, QrCode, Loader2, UtensilsCrossed } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import Link from 'next/link';
import { RestaurantItem } from '@/types';

export const FeaturedRestaurants: React.FC = () => {
  const { navigateTo } = useNavigation();
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
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <div className="text-xs uppercase font-extrabold tracking-widest text-amber-700 mb-2">
              Établissements Certifiés
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
              Restaurants digitalisés à Cotonou
            </h2>
            <p className="text-sm sm:text-base text-stone-500 mt-2 font-normal">
              Découvrez comment les meilleurs chefs et gérants modernisent leur service en salle.
            </p>
          </div>

          <Link href="/restaurants">
            <motion.p
              className="px-5 py-2.5 rounded-xl border border-stone-200 hover:border-stone-900 text-stone-800 font-bold text-xs flex items-center gap-2 self-start md:self-auto transition-colors cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Voir tous les restaurants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.p>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
            <span className="text-xs font-medium">Chargement des établissements...</span>
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {restaurants.map((resto, i) => {
              const image = resto.coverImage || resto.logo || '/images/resto_ambiance_1790196207320.jpg';
              const badge = resto.cuisineType || resto.category || 'Certifié QResto';
              const status = resto.isOpen ? 'Ouvert' : 'Fermé';
              const neighborhood = resto.city || resto.address || 'Cotonou';
              const tableCount = resto._count?.tables || 0;

              return (
                <motion.div
                  key={resto.id || resto.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  whileHover={{ y: -6 }}
                  className="bg-[#fbf9f5] rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="relative h-52 overflow-hidden bg-stone-100">
                      <img
                        src={image}
                        alt={resto.name}
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                        {badge}
                      </div>
                      <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-white text-[10px] font-bold flex items-center gap-1 shadow-sm ${
                        resto.isOpen ? 'bg-emerald-500' : 'bg-red-500'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>{status}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-stone-500">{neighborhood}</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{resto.rating ? resto.rating.toFixed(1) : '4.8'}</span>
                          <span className="text-stone-400 font-normal">({resto.reviewCount || 0})</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-stone-950 mb-2 group-hover:text-amber-700 transition-colors font-display">
                        {resto.name}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed font-normal mb-4 line-clamp-2">
                        {resto.description || 'Découvrez notre menu digital complet et nos spécialités culinaires.'}
                      </p>

                      <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                        <QrCode className="w-3.5 h-3.5 text-amber-600" />
                        <span>{tableCount > 0 ? `${tableCount} tables équipées en QR dynamique` : 'Menu QR Code à table'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-stone-200/60 mt-3 flex items-center justify-between">
                    <Link href={`/restaurant/${resto.slug}`} className="text-xs font-bold text-stone-700 group-hover:text-stone-950">
                      Consulter la carte
                    </Link>
                    <Link href={`/restaurant/${resto.slug}`} className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#fbf9f5] rounded-3xl p-8 text-center border border-stone-200 max-w-md mx-auto">
            <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-stone-800">Aucun établissement disponible</p>
            <p className="text-xs text-stone-500 mt-1">
              Les établissements partenaires seront affichés dès leur inscription.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
