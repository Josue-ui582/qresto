'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Icon } from '../common/Icon';

interface QRCodeViewerProps {
  url: string;
  restaurantName: string;
  tableNumber?: string | number;
  tableName?: string;
  logoUrl?: string;
}

export const QRCodeViewer: React.FC<QRCodeViewerProps> = ({
  url,
  restaurantName,
  tableNumber,
  tableName,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: styles.getPropertyValue('--color-ink-900').trim(),
        light: styles.getPropertyValue('--color-paper-white').trim(),
      },
      errorCorrectionLevel: 'H',
    })
      .then((dataUri) => {
        setQrDataUrl(dataUri);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
      });
  }, [url]);

  const handleDownload = () => {
    if (!qrDataUrl || typeof document === 'undefined') return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const safeName = (restaurantName || 'restaurant').toLowerCase().replace(/\s+/g, '-');
    const tableSuffix = tableNumber ? `-table-${tableNumber}` : '-menu';
    a.download = `qresto-${safeName}${tableSuffix}.png`;
    a.click();
  };

  const handleCopyLink = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handlePrint = () => {
    if (typeof window === 'undefined') return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const stylesheetLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
      .map((link) => `<link rel="stylesheet" href="${link.href}">`)
      .join('');
    const printFont = getComputedStyle(document.body).fontFamily;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${restaurantName} ${tableNumber ? `Table ${tableNumber}` : ''}</title>
          ${stylesheetLinks}
          <style>
            body {
              font-family: ${printFont};
              margin: 0;
              padding: 2.5rem;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: var(--color-ink-50);
              color: var(--color-ink-900);
            }
            .card {
              background: var(--color-paper-white);
              border: 0.1875rem solid var(--color-brand-500);
              border-radius: 1.5rem;
              padding: 2.5rem 2rem;
              text-align: center;
              max-width: 23.75rem;
              box-shadow: var(--qr-shadow-soft);
            }
            .brand {
              display: inline-block;
              background: var(--color-brand-100);
              color: var(--color-brand-700);
              font-weight: 700;
              font-size: 0.8125rem;
              padding: 0.375rem 0.875rem;
              border-radius: var(--qr-radius-full);
              margin-bottom: 1rem;
              letter-spacing: 0.0312rem;
            }
            .title {
              font-size: 1.5rem;
              font-weight: 800;
              margin: 0 0 0.375rem 0;
              color: var(--color-ink-900);
            }
            .table-badge {
              font-size: 1.75rem;
              font-weight: 800;
              color: var(--color-brand-600);
              margin: 0.75rem 0 1.25rem 0;
            }
            .qr-wrapper {
              background: var(--color-paper-white);
              padding: 1rem;
              border-radius: 1rem;
              display: inline-block;
              border: 0.125rem dashed var(--color-ink-200);
              margin-bottom: 1.25rem;
            }
            .qr-img {
              width: 13.75rem;
              height: 13.75rem;
              display: block;
            }
            .instructions {
              font-size: 0.875rem;
              color: var(--color-ink-600);
              line-height: 1.5;
              margin: 0 0 1rem 0;
            }
            .footer-tag {
              font-size: 0.6875rem;
              color: var(--color-ink-400);
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.0625rem;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">🍽️ MENU DIGITAL & COMMANDE EN DIRECT</div>
            <h1 class="title">${restaurantName}</h1>
            ${tableNumber ? `<div class="table-badge">TABLE N° ${tableNumber}</div>` : ''}
            <div class="qr-wrapper">
              <img class="qr-img" src="${qrDataUrl}" alt="QR Code" />
            </div>
            <p class="instructions">
              <strong>1.</strong> Pointez l'appareil photo de votre smartphone<br>
              <strong>2.</strong> Découvrez notre menu interactif<br>
              <strong>3.</strong> Commandez directement depuis votre table
            </p>
            <div class="footer-tag">Propulsé par QResto Afrique</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-paper-white rounded-2xl border border-ink-200 shadow-sm p-6 flex flex-col items-center text-center">
      {/* Table & Restaurant Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-3">
        <Icon name="qrcode" className="text-brand-600" />
        <span>{tableNumber ? `Table ${tableNumber} • ${tableName || ''}` : 'Menu Général'}</span>
      </div>

      <h3 className="font-bold text-ink-900 text-lg mb-1">{restaurantName}</h3>
      <p className="text-xs text-ink-500 mb-4 max-w-xs">
        Scannez pour accéder au menu digital et passer commande directement.
      </p>

      {/* QR Display */}
      <div className="p-4 bg-ink-50 border-2 border-dashed border-ink-200 rounded-2xl mb-4 group hover:border-brand-400 transition-colors">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR Code"
            className="w-48 h-48 rounded-lg drop-shadow-sm transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-ink-400 text-xs">
            <Icon name="spinner" className="animate-spin text-2xl" />
          </div>
        )}
      </div>

      {/* Target Link preview */}
      <div className="w-full bg-ink-50 rounded-xl p-2.5 mb-4 text-left border border-ink-200 flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] text-ink-600 truncate flex-1">{url}</span>
        <button
          type="button"
          onClick={handleCopyLink}
          className="text-xs px-2.5 py-1 bg-paper-white hover:bg-ink-100 text-ink-700 border border-ink-200 rounded-md font-medium transition-colors flex items-center gap-1 shrink-0"
        >
          <Icon name={copied ? 'check' : 'copy'} className={copied ? 'text-positive-600' : ''} />
          <span>{copied ? 'Copié !' : 'Copier'}</span>
        </button>
      </div>

      {/* Actions */}
      <div className="w-full grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-ink-900 hover:bg-ink-800 text-paper-white text-xs font-semibold shadow-sm transition-all"
        >
          <Icon name="download" />
          <span>Télécharger PNG</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-paper-white text-xs font-semibold shadow-sm transition-all"
        >
          <Icon name="print" />
          <span>Imprimer Chevalet</span>
        </button>
      </div>
    </div>
  );
};
