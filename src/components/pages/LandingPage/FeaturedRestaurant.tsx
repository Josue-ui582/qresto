'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Star, ArrowRight, QrCode } from 'lucide-react';
import { featuredRestaurants } from '@/constants/featuredRestaurants';
import { useNavigation } from '@/context/NavigationContext';
import Link from 'next/link';

export const FeaturedRestaurants: React.FC = () => {
  const { navigateTo } = useNavigation();

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
            <motion.a
              className="px-5 py-2.5 rounded-xl border border-stone-200 hover:border-stone-900 text-stone-800 font-bold text-xs flex items-center gap-2 self-start md:self-auto transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Voir tous les restaurants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.a>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredRestaurants.map((resto, i) => (
            <motion.div
              key={resto.name}
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
                    src={resto.image}
                    alt={resto.name}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                    {resto.badge}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>{resto.status}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-500">{resto.neighborhood}</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{resto.rating}</span>
                      <span className="text-stone-400 font-normal">({resto.reviews})</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-stone-950 mb-2 group-hover:text-amber-700 transition-colors font-display">
                    {resto.name}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal mb-4">
                    {resto.specialty}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                    <QrCode className="w-3.5 h-3.5 text-amber-600" />
                    <span>{resto.tables} tables équipées en QR dynamique</span>
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
          ))}
        </div>
      </div>
    </section>
  );
};
