'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Store, Utensils } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import Link from 'next/link';

export const FinalCTA: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-tr from-stone-950 via-stone-900 to-amber-950 text-white relative overflow-hidden text-center">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl font-black mb-6 font-display tracking-tight leading-tight"
        >
          Prêt à transformer l’expérience de votre restaurant ?
        </motion.h2>

        <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto font-normal">
          Rejoignez les dizaines d’établissements qui modernisent la restauration en Afrique avec QResto.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/register-restaurant">
            <motion.a
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-amber-500 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Créer mon restaurant gratuitement</span>
            </motion.a>
          </Link>

          <Link href="/restaurants">
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all flex items-center gap-2"
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Voir les restaurants partenaires</span>
            </motion.a>
          </Link>
        </div>
      </div>
    </section>
  );
};
