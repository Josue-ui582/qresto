'use client';

import React from 'react';
import { motion } from 'motion/react';
import { DollarSign, ShoppingBag, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import { AnalyticsStats } from './types';

interface KpiGridProps {
  stats: AnalyticsStats | null;
  formatCurrency: (amount: number) => string;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ stats, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Chiffre d'affaires */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Chiffre d'Affaires
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
          {formatCurrency(stats?.totalRevenue || 0)}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Commandes encaissées</span>
        </div>
      </motion.div>

      {/* Total Commandes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Total Commandes
          </span>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
          {stats?.totalOrders || 0}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400 mt-2">
          <span>Sur la période sélectionnée</span>
        </div>
      </motion.div>

      {/* Panier Moyen */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Panier Moyen
          </span>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
          {formatCurrency(stats?.averageOrderValue || 0)}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400 mt-2">
          <span>Dépense moy. par client</span>
        </div>
      </motion.div>

      {/* Tables Actives */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Tables Actives
          </span>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
          {stats?.activeTablesCount || 0}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400 mt-2">
          <span>Tables ayant commandé</span>
        </div>
      </motion.div>
    </div>
  );
};
