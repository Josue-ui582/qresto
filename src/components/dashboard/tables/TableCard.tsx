'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Users, QrCode, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { TableData } from './types';

interface TableCardProps {
  table: TableData;
  restaurantSlug: string;
  onPreviewQr: (table: TableData) => void;
  onEdit: (table: TableData) => void;
  onDeleteRequest: (id: string) => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  restaurantSlug,
  onPreviewQr,
  onEdit,
  onDeleteRequest,
}) => {
  const slug = table.restaurant?.slug || restaurantSlug;
  const targetPath = `/restaurant/${slug}?table=${table.number}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="bg-paper-white rounded-3xl p-6 border border-ink-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 text-ink-950 font-black text-lg flex items-center justify-center shadow-md shadow-brand-500/20">
              #{table.number}
            </div>
            <div>
              <h3 className="text-base font-bold text-ink-950 leading-tight">
                {table.name || `Table #${table.number}`}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-ink-500 font-medium mt-0.5">
                <Users className="w-3.5 h-3.5 text-ink-400" />
                <span>{table.capacity || 4} places</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => onPreviewQr(table)}
          className="w-full py-3 px-4 rounded-2xl bg-ink-50 hover:bg-brand-50 border border-ink-200/80 hover:border-brand-200 text-ink-800 hover:text-brand-900 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer mb-4 group/btn"
        >
          <QrCode className="w-4 h-4 text-brand-600 group-hover/btn:scale-110 transition-transform" />
          <span>Apercevoir le Chevalet QR</span>
        </button>
      </div>

      <div className="pt-3 border-t border-ink-100 flex items-center justify-between">
        <a
          href={targetPath}
          target="_blank"
          rel="noreferrer"
          className="text-[0.6875rem] font-bold text-ink-400 hover:text-brand-600 flex items-center gap-1 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Tester lien</span>
        </a>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(table)}
            className="p-2 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Modifier"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDeleteRequest(table.id)}
            className="p-2 rounded-xl bg-alert-50 hover:bg-alert-100 text-alert-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
