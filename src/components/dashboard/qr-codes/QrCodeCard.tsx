'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Eye,
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { TableData } from './types';

interface QrCodeCardProps {
  table: TableData;
  restaurantSlug: string;
  origin: string;
  isCopied: boolean;
  onSelect: (table: TableData) => void;
  onDownload: (table: TableData) => void;
  onCopy: (table: TableData) => void;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  table,
  restaurantSlug,
  origin,
  isCopied,
  onSelect,
  onDownload,
  onCopy,
}) => {
  const slug = table.restaurant?.slug || restaurantSlug;
  const targetUrl = `${origin}/restaurant/${slug}?table=${table.number}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    targetUrl
  )}&color=1c1917`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative"
    >
      <div>
        {/* Badge & Nom de table */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 font-black text-base flex items-center justify-center font-display shadow-xs">
              #{table.number}
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-950 font-display">
                {table.name || `Table #${table.number}`}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                <Users className="w-3 h-3 text-stone-400" />
                <span>{table.capacity || 4} places</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone Visuelle du QR Code */}
        <div className="relative group/qr bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-center mb-4 overflow-hidden">
          <img
            src={qrImageUrl}
            alt={`QR Table ${table.number}`}
            className="w-36 h-36 mx-auto rounded-lg shadow-xs group-hover/qr:scale-105 transition-transform duration-300"
          />

          {/* Overlay au survol */}
          <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
            <button
              onClick={() => onSelect(table)}
              className="p-2.5 rounded-xl bg-white text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Aperçu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actions au bas de la carte */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(table)}
            className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Voir Chevalet</span>
          </button>

          <button
            onClick={() => onDownload(table)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            title="Télécharger l'image PNG"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => onCopy(table)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer relative"
            title="Copier le lien direct"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <a
          href={targetUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full text-center block text-[11px] font-bold text-stone-400 hover:text-amber-600 transition-colors pt-1 truncate"
        >
          <span className="inline-flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <span>{`/restaurant/${slug}?table=${table.number}`}</span>
          </span>
        </a>
      </div>
    </motion.div>
  );
};
