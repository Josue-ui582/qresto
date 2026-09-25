'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Search,
  Printer,
  Download,
  ExternalLink,
  Copy,
  Check,
  X,
  Users,
  Smartphone,
  Sparkles,
  Eye,
  Layers,
} from 'lucide-react';

export interface TableData {
  id: string;
  number: number;
  capacity?: number;
  name?: string | null;
  restaurantId?: string;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface QrCodesTabProps {
  tables?: TableData[];
  restaurantSlug?: string;
  restaurantName?: string;
  onOpenQr?: (table: TableData) => void;
}

export const QrCodesTab: React.FC<QrCodesTabProps> = ({
  tables = [],
  restaurantSlug = 'chez-mama-benin',
  restaurantName = 'Mon Restaurant',
  onOpenQr,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>('https://qresto.africa');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);


  // Filtrage par recherche
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const numStr = t.number.toString();
      const nameMatch = t.name ? t.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      return numStr.includes(searchQuery) || nameMatch;
    });
  }, [tables, searchQuery]);

  // Copier le lien unique de la table
  const handleCopyLink = (table: TableData) => {
    const slug = table.restaurant?.slug || restaurantSlug;
    const url = `${origin}/restaurant/${slug}?table=${table.number}`;
    navigator.clipboard.writeText(url);
    setCopiedId(table.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Télécharger le QR Code PNG
  const handleDownloadQr = (table: TableData) => {
    const slug = table.restaurant?.slug || restaurantSlug;
    const targetUrl = `${origin}/restaurant/${slug}?table=${table.number}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
      targetUrl
    )}&color=1c1917`;

    const link = document.createElement('a');
    link.href = qrApiUrl;
    link.download = `QR_Code_Table_${table.number}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Déclencher l'impression de toute la page/planche
  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header & Commandes Générales */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Signalétique & QR Codes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            QR Codes des Tables
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">
            Téléchargez ou imprimez les chevalets de table pour permettre aux clients de scanner et passer commande.
          </p>
        </div>

        {/* Actions groupées */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-[#fbf9f5] border border-stone-200/80 text-center min-w-27.5">
            <span className="block text-2xl font-black text-stone-950 font-display">
              {tables.length}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              QR Générés
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrintAll}
            disabled={tables.length === 0}
            className="px-5 py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimer la planche complète</span>
          </motion.button>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer par numéro ou nom de table..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 text-stone-900 placeholder-stone-400 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-stone-500 hidden sm:block">
          {filteredTables.length} résultat(s)
        </div>
      </div>

      {/* Grille des QR Codes */}
      {filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.map((t) => {
            const slug = t.restaurant?.slug || restaurantSlug;
            const targetUrl = `${origin}/restaurant/${slug}?table=${t.number}`;
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
              targetUrl
            )}&color=1c1917`;

            return (
              <motion.div
                key={t.id}
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
                        #{t.number}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-stone-950 font-display">
                          {t.name || `Table #${t.number}`}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                          <Users className="w-3 h-3 text-stone-400" />
                          <span>{t.capacity || 4} places</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zone Visuelle du QR Code */}
                  <div className="relative group/qr bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-center mb-4 overflow-hidden">
                    <img
                      src={qrImageUrl}
                      alt={`QR Table ${t.number}`}
                      className="w-36 h-36 mx-auto rounded-lg shadow-xs group-hover/qr:scale-105 transition-transform duration-300"
                    />

                    {/* Overlay au survol */}
                    <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button
                        onClick={() => {
                          setSelectedTable(t);
                          if (onOpenQr) onOpenQr(t);
                        }}
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
                      onClick={() => {
                        setSelectedTable(t);
                        if (onOpenQr) onOpenQr(t);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400" />
                      <span>Voir Chevalet</span>
                    </button>

                    <button
                      onClick={() => handleDownloadQr(t)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                      title="Télécharger l'image PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleCopyLink(t)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer relative"
                      title="Copier le lien direct"
                    >
                      {copiedId === t.id ? (
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
                      <span>{`/restaurant/${slug}?table=${t.number}`}</span>
                    </span>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* État vide */
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-display">
            {searchQuery ? 'Aucun QR Code trouvé' : 'Aucune table disponible'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 mb-4 leading-relaxed font-normal">
            {searchQuery
              ? `Aucun résultat ne correspond à "${searchQuery}".`
              : 'Vous devez créer des tables dans l’onglet "Tables" pour pouvoir générer leurs QR codes uniques.'}
          </p>
        </div>
      )}

      {/* ================= MODAL CHEVALET DE TABLE ================= */}
      <AnimatePresence>
        {selectedTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs print:p-0 print:bg-white print:static">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 text-center border border-stone-200 shadow-2xl relative print:shadow-none print:border-none print:w-full print:max-w-none"
            >
              {/* Bouton fermeture (masqué à l'impression) */}
              <button
                onClick={() => setSelectedTable(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer print:hidden"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Rendu imprimable Chevalet */}
              <div className="border-2 border-stone-900 p-6 rounded-3xl bg-white shadow-inner my-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 font-black text-xl mx-auto flex items-center justify-center mb-3 font-display">
                  Q
                </div>
                <h3 className="text-xl font-black text-stone-950 font-display leading-tight">
                  {selectedTable.restaurant?.name || restaurantName}
                </h3>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mt-1">
                  Menu Digital & Commande
                </p>

                {/* QR Code */}
                <div className="my-6 p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      `${origin}/restaurant/${selectedTable.restaurant?.slug || restaurantSlug                       }?table=${selectedTable.number}`
                    )}&color=1c1917`}
                    alt={`QR Table ${selectedTable.number}`}
                    className="w-48 h-48 mx-auto rounded-lg"
                  />
                </div>

                <div className="inline-block px-5 py-2 rounded-full bg-stone-950 text-amber-400 font-black text-sm uppercase tracking-wider mb-3">
                  Table #{selectedTable.number} {selectedTable.name ? `· ${selectedTable.name}` : ''}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-stone-600 text-[11px] font-bold">
                  <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ouvrez votre appareil photo & scannez</span>
                </div>
              </div>

              {/* Actions du Modal (masquées à l'impression) */}
              <div className="flex items-center justify-center gap-2 pt-4 mt-2 border-t border-stone-100 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Imprimer ce chevalet</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadQr(selectedTable)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-stone-600" />
                  <span>PNG</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
