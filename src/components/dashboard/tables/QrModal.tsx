'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Download } from 'lucide-react';
import { TableData } from './types';

interface QrModalProps {
  table: TableData | null;
  origin: string;
  restaurantName: string;
  restaurantSlug: string;
  onClose: () => void;
  onDownloadQr: (table: TableData) => void;
}

export const QrModal: React.FC<QrModalProps> = ({
  table,
  origin,
  restaurantName,
  restaurantSlug,
  onClose,
  onDownloadQr,
}) => {
  return (
    <AnimatePresence>
      {table && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-stone-200 shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 font-black text-lg mx-auto flex items-center justify-center mb-3">
              Q
            </div>
            <h4 className="text-base font-extrabold text-stone-950 leading-tight">
              {table.restaurant?.name || restaurantName}
            </h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Scannez pour commander sans attente
            </p>

            <div className="my-5 p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `${origin}/restaurant/${table.restaurant?.slug || restaurantSlug}?table=${table.number}`
                )}&color=1c1917`}
                alt={`QR Table ${table.number}`}
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div className="inline-block px-4 py-1.5 rounded-full bg-stone-900 text-white font-black text-xs uppercase tracking-wider mb-2">
              Table #{table.number} {table.name ? `· ${table.name}` : ''}
            </div>

            <div className="text-[10px] text-stone-400 font-medium mb-6">
              Compatible iPhone & Android · 100% sans application
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimer</span>
              </button>

              <button
                type="button"
                onClick={() => onDownloadQr(table)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-stone-600" />
                <span>Image PNG</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
