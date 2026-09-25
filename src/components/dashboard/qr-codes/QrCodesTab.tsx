'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { QrCode } from 'lucide-react';
import { TableData, QrCodesTabProps } from './types';
import { QrCodesHeader } from './QrCodesHeader';
import { QrSearchBar } from './QrSearchBar';
import { QrCodeCard } from './QrCodeCard';
import { QrTentModal } from './QrTentModal';

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

  // Sélectionner une table pour ouvrir le chevalet
  const handleSelectTable = (table: TableData) => {
    setSelectedTable(table);
    if (onOpenQr) onOpenQr(table);
  };

  // Déclencher l'impression de toute la page
  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <QrCodesHeader
        totalTables={tables.length}
        onPrintAll={handlePrintAll}
      />

      <QrSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={filteredTables.length}
      />

      {/* Grille des QR Codes */}
      {filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.map((table) => (
            <QrCodeCard
              key={table.id}
              table={table}
              restaurantSlug={restaurantSlug}
              origin={origin}
              isCopied={copiedId === table.id}
              onSelect={handleSelectTable}
              onDownload={handleDownloadQr}
              onCopy={handleCopyLink}
            />
          ))}
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

      {/* Modal Chevalet de Table */}
      <QrTentModal
        selectedTable={selectedTable}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
        origin={origin}
        onClose={() => setSelectedTable(null)}
        onDownload={handleDownloadQr}
      />
    </div>
  );
};
