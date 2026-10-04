'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Store, Utensils } from 'lucide-react';
import Link from 'next/link';

export const FinalCTA: React.FC = () => {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#18181b] px-6 py-14 text-center text-white sm:px-12 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-2xl">
        <motion.h2
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  className="text-3xl sm:text-4xl font-bold !text-white mb-3 tracking-tight leading-tight"
>
  Prêt à transformer l’expérience de votre restaurant ?
</motion.h2>


        <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-7 max-w-md mx-auto font-normal">
          Rejoignez les dizaines d’établissements qui modernisent la restauration en Afrique avec QResto.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/register-restaurant">
            <motion.p
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-full bg-amber-500 text-stone-950 font-semibold text-sm hover:bg-amber-400 transition-all flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Digitaliser mon restaurant</span>
            </motion.p>
          </Link>

          <Link href="/restaurants">
            <motion.p
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-full bg-transparent hover:bg-white/10 border border-white/20 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Voir les restaurants partenaires</span>
            </motion.p>
          </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
