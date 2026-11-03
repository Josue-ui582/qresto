'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Printer, Download } from 'lucide-react';
import { TableData } from './types';
import { QRCodeImage } from '@/components/common/QRCodeImage';
import { createTableMenuUrl, QrCodeOptions } from '@/lib/qr-code';

interface QrTentModalProps {
  selectedTable: TableData | null;
  restaurantName: string;
  restaurantSlug: string;
  origin: string;
  qrOptions: QrCodeOptions;
  onClose: () => void;
  onDownload: (table: TableData) => void;
}

export const QrTentModal: React.FC<QrTentModalProps> = ({
  selectedTable,
  restaurantName,
  restaurantSlug,
  origin,
  qrOptions,
  onClose,
  onDownload,
}) => {
  if (!selectedTable) return null;

  const slug = selectedTable.restaurant?.slug || restaurantSlug;
  const targetUrl = createTableMenuUrl(origin, slug, selectedTable.number);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-xs print:p-0 print:bg-paper-white print:static">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-paper-white rounded-3xl max-w-sm w-full p-6 sm:p-8 text-center border border-ink-200 shadow-2xl relative print:shadow-none print:border-none print:w-full print:max-w-none"
        >
          {/* Bouton fermeture (masqué à l'impression) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ink-100 hover:bg-ink-200 text-ink-500 flex items-center justify-center transition-colors cursor-pointer print:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Rendu imprimable Chevalet */}
          <div className="border-2 border-ink-900 p-6 rounded-3xl bg-paper-white shadow-inner my-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 text-ink-950 font-black text-xl mx-auto flex items-center justify-center mb-3">
              Q
            </div>
            <h3 className="text-xl font-black text-ink-950 leading-tight">
              {selectedTable.restaurant?.name || restaurantName}
            </h3>
            <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider mt-1">
              Menu Digital & Commande
            </p>

            {/* QR Code */}
            <div className="my-6 p-4 bg-ink-50 rounded-2xl border border-ink-200 inline-block shadow-sm">
              <QRCodeImage
                value={targetUrl}
                alt={`QR Table ${selectedTable.number}`}
                className="w-48 h-48 mx-auto rounded-lg"
                options={qrOptions}
              />
            </div>

            <div className="inline-block px-5 py-2 rounded-full bg-ink-950 text-brand-400 font-black text-sm uppercase tracking-wider mb-3">
              Table #{selectedTable.number} {selectedTable.name ? `· ${selectedTable.name}` : ''}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-ink-600 text-[0.6875rem] font-bold">
              <Smartphone className="w-3.5 h-3.5 text-brand-600" />
              <span>Ouvrez votre appareil photo & scannez</span>
            </div>
          </div>

          {/* Actions du Modal (masquées à l'impression) */}
          <div className="flex items-center justify-center gap-2 pt-4 mt-2 border-t border-ink-100 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-ink-950 hover:bg-ink-800 text-paper-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-brand-400" />
              <span>Imprimer ce chevalet</span>
            </button>

            <button
              type="button"
              onClick={() => onDownload(selectedTable)}
              className="px-4 py-2.5 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-ink-600" />
              <span>PNG</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
