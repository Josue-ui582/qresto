'use client';

import React, { useState, useMemo } from 'react';
import { QrCode } from 'lucide-react';
import { TableData, QrCodesTabProps } from './types';
import { QrCodesHeader } from './QrCodesHeader';
import { QrSearchBar } from './QrSearchBar';
import { QrCodeCard } from './QrCodeCard';
import { QrTentModal } from './QrTentModal';
import { createTableMenuUrl, generateQrCodePngDataUrl, QrCodeOptions } from '@/lib/qr-code';

export const QrCodesTab: React.FC<QrCodesTabProps> = ({
  tables,
  restaurantSlug,
  restaurantName,
  onOpenQr,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [qrOptions, setQrOptions] = useState<QrCodeOptions>({
    size: 500,
    darkColor: '#1c1917',
    lightColor: '#ffffff',
  });
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  // Filtrage par recherche
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const numStr = t.number.toString();
      const nameMatch = t.name ? t.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      return numStr.includes(searchQuery) || nameMatch;
    });
  }, [tables, searchQuery]);

  // Copier le lien unique de la table
  const handleCopyLink = async (table: TableData) => {
    const slug = table.restaurant?.slug || restaurantSlug;
    const url = createTableMenuUrl(window.location.origin, slug, table.number);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(table.id);
      setTimeout(() => setCopiedId(null), 2000);
      setDownloadError(null);
    } catch (error: unknown) {
      console.error('Erreur lors de la copie du lien QR :', error);
      setDownloadError('Impossible de copier le lien de cette table.');
    }
  };

  // Télécharger le QR Code PNG
  const handleDownloadQr = async (table: TableData) => {
    const slug = table.restaurant?.slug || restaurantSlug;
    const targetUrl = createTableMenuUrl(window.location.origin, slug, table.number);
    try {
      const pngDataUrl = await generateQrCodePngDataUrl(targetUrl, qrOptions);
      const link = document.createElement('a');
      link.href = pngDataUrl;
      link.download = `QR_Code_Table_${table.number}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadError(null);
    } catch (error: unknown) {
      console.error('Erreur lors du téléchargement du QR code :', error);
      setDownloadError('Impossible de générer le fichier PNG du QR code.');
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setLogoError(null);
    if (!file) {
      setQrOptions((current) => ({ ...current, logoDataUrl: undefined }));
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2_000_000) {
      setLogoError('Choisissez un logo PNG, JPEG ou WebP de 2 Mo maximum.');
      setQrOptions((current) => ({ ...current, logoDataUrl: undefined }));
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setLogoError('Impossible de lire le fichier du logo.');
        return;
      }
      const logoDataUrl = reader.result;
      setQrOptions((current) => ({ ...current, logoDataUrl }));
    };
    reader.onerror = () => setLogoError('Impossible de lire le fichier du logo.');
    reader.readAsDataURL(file);
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

      <section className="grid grid-cols-1 gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-semibold text-stone-700">
          Taille de l’image
          <select
            value={qrOptions.size}
            onChange={(event) => setQrOptions((current) => ({
              ...current,
              size: Number(event.target.value),
            }))}
            className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
          >
            <option value={300}>300 × 300</option>
            <option value={500}>500 × 500</option>
            <option value={800}>800 × 800</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-stone-700">
          Couleur du code
          <input
            type="color"
            value={qrOptions.darkColor}
            onChange={(event) => setQrOptions((current) => ({
              ...current,
              darkColor: event.target.value,
            }))}
            className="mt-1 block h-10 w-full rounded-lg border border-stone-300 bg-white p-1"
          />
        </label>
        <label className="text-xs font-semibold text-stone-700">
          Couleur du fond
          <input
            type="color"
            value={qrOptions.lightColor}
            onChange={(event) => setQrOptions((current) => ({
              ...current,
              lightColor: event.target.value,
            }))}
            className="mt-1 block h-10 w-full rounded-lg border border-stone-300 bg-white p-1"
          />
        </label>
        <label className="text-xs font-semibold text-stone-700">
          Logo (optionnel, max. 2 Mo)
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleLogoChange}
            className="mt-1 block w-full text-xs"
          />
        </label>
        {(downloadError || logoError) && (
          <p role="alert" className="text-xs font-semibold text-red-700 sm:col-span-2 lg:col-span-4">
            {downloadError || logoError}
          </p>
        )}
      </section>

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
              qrOptions={qrOptions}
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
          <h3 className="text-lg font-bold text-stone-900">
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
        qrOptions={qrOptions}
        onClose={() => setSelectedTable(null)}
        onDownload={handleDownloadQr}
      />
    </div>
  );
};
