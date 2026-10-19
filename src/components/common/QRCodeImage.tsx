'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { QrCodeOptions, generateQrCodeSvgDataUrl } from '@/lib/qr-code';

interface QRCodeImageProps {
  value: string;
  alt: string;
  className: string;
  options?: QrCodeOptions;
}

export const QRCodeImage: React.FC<QRCodeImageProps> = ({
  value,
  alt,
  className,
  options,
}) => {
  const [generation, setGeneration] = useState<{
    key: string;
    imageUrl?: string;
    hasError?: boolean;
  } | null>(null);
  const size = options?.size;
  const darkColor = options?.darkColor;
  const lightColor = options?.lightColor;
  const logoDataUrl = options?.logoDataUrl;
  const generationKey = JSON.stringify([value, size, darkColor, lightColor, logoDataUrl]);

  useEffect(() => {
    let active = true;

    void generateQrCodeSvgDataUrl(value, { size, darkColor, lightColor, logoDataUrl })
      .then((dataUrl) => {
        if (active) setGeneration({ key: generationKey, imageUrl: dataUrl });
      })
      .catch((error: unknown) => {
        console.error('Erreur lors de la génération du QR code :', error);
        if (active) setGeneration({ key: generationKey, hasError: true });
      });

    return () => {
      active = false;
    };
  }, [value, size, darkColor, lightColor, logoDataUrl, generationKey]);

  const currentGeneration = generation?.key === generationKey ? generation : null;
  if (currentGeneration?.hasError) {
    return <span role="alert" className="text-xs font-semibold text-red-700">QR code indisponible</span>;
  }
  if (!currentGeneration?.imageUrl) {
    return <span className={className} aria-hidden="true" />;
  }
  return (
    <Image
      src={currentGeneration.imageUrl}
      alt={alt}
      width={size ?? 500}
      height={size ?? 500}
      unoptimized
      className={className}
    />
  );
};
