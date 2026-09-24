'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { FaIcon } from '../common/Icon';

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
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1c1917', // stone-900
        light: '#ffffff',
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

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${restaurantName} ${tableNumber ? `Table ${tableNumber}` : ''}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #fafaf9;
              color: #1c1917;
            }
            .card {
              background: #ffffff;
              border: 3px solid #f59e0b;
              border-radius: 24px;
              padding: 40px 32px;
              text-align: center;
              max-width: 380px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            }
            .brand {
              display: inline-block;
              background: #fef3c7;
              color: #b45309;
              font-weight: 700;
              font-size: 13px;
              padding: 6px 14px;
              border-radius: 9999px;
              margin-bottom: 16px;
              letter-spacing: 0.5px;
            }
            .title {
              font-size: 24px;
              font-weight: 800;
              margin: 0 0 6px 0;
              color: #1c1917;
            }
            .table-badge {
              font-size: 28px;
              font-weight: 800;
              color: #d97706;
              margin: 12px 0 20px 0;
            }
            .qr-wrapper {
              background: white;
              padding: 16px;
              border-radius: 16px;
              display: inline-block;
              border: 2px dashed #e7e5e4;
              margin-bottom: 20px;
            }
            .qr-img {
              width: 220px;
              height: 220px;
              display: block;
            }
            .instructions {
              font-size: 14px;
              color: #57534e;
              line-height: 1.5;
              margin: 0 0 16px 0;
            }
            .footer-tag {
              font-size: 11px;
              color: #a8a29e;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
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
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col items-center text-center">
      {/* Table & Restaurant Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3">
        <FaIcon name="fa-solid fa-qrcode" className="text-amber-600" />
        <span>{tableNumber ? `Table ${tableNumber} • ${tableName || ''}` : 'Menu Général'}</span>
      </div>

      <h3 className="font-bold text-stone-900 text-lg mb-1">{restaurantName}</h3>
      <p className="text-xs text-stone-500 mb-4 max-w-xs">
        Scannez pour accéder au menu digital et passer commande directement.
      </p>

      {/* QR Display */}
      <div className="p-4 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl mb-4 group hover:border-amber-400 transition-colors">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="QR Code"
            className="w-48 h-48 rounded-lg drop-shadow-sm transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-stone-400 text-xs">
            <FaIcon name="fa-solid fa-spinner" className="animate-spin text-2xl" />
          </div>
        )}
      </div>

      {/* Target Link preview */}
      <div className="w-full bg-stone-50 rounded-xl p-2.5 mb-4 text-left border border-stone-200 flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-stone-600 truncate flex-1">{url}</span>
        <button
          type="button"
          onClick={handleCopyLink}
          className="text-xs px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-md font-medium transition-colors flex items-center gap-1 shrink-0"
        >
          <FaIcon name={copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'} className={copied ? 'text-emerald-600' : ''} />
          <span>{copied ? 'Copié !' : 'Copier'}</span>
        </button>
      </div>

      {/* Actions */}
      <div className="w-full grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <FaIcon name="fa-solid fa-download" />
          <span>Télécharger PNG</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <FaIcon name="fa-solid fa-print" />
          <span>Imprimer Chevalet</span>
        </button>
      </div>
    </div>
  );
};
