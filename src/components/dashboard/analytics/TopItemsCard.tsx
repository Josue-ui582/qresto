'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Award, UtensilsCrossed } from 'lucide-react';
import { AnalyticsStats } from './types';

interface TopItemsCardProps {
  items?: AnalyticsStats['topItems'];
  formatCurrency: (amount: number) => string;
}

export const TopItemsCard: React.FC<TopItemsCardProps> = ({ items = [], formatCurrency }) => {
  const maxItemQuantity = useMemo(() => {
    if (!items.length) return 1;
    return Math.max(...items.map((i) => i.quantity));
  }, [items]);

  return (
    <div className="lg:col-span-2 bg-paper-white rounded-3xl p-6 sm:p-8 border border-ink-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-brand-500/10 text-brand-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink-950">
                Top 5 des Plats les plus vendus
              </h3>
              <p className="text-xs text-ink-500">
                Articles générant le plus grand volume de commandes.
              </p>
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="space-y-5">
            {items.map((item, index) => {
              const percentage = Math.round((item.quantity / maxItemQuantity) * 100);

              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-ink-100 text-ink-700 font-black text-[0.6875rem] flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-ink-900 text-sm">{item.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-ink-100 text-ink-500 text-[0.625rem] font-bold">
                        {item.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-ink-950 text-sm">
                        {item.quantity} vente(s)
                      </span>
                      <span className="block text-[0.6875rem] text-ink-400 font-medium">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-ink-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-brand-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-ink-400">
            <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold">Aucune donnée de vente enregistrée sur cette période.</p>
          </div>
        )}
      </div>
    </div>
  );
};
