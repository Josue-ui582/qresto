import { describe, expect, it } from 'vitest';
import { createTableMenuUrl, generateQrCodeSvg } from './qr-code';

describe('local QR code generation', () => {
  it('targets the restaurant menu with the actual table number', () => {
    const target = new URL(createTableMenuUrl('https://qresto.example', 'restaurant-a', 'VIP-3'));

    expect(target.pathname).toBe('/restaurant/restaurant-a');
    expect(target.searchParams.get('table')).toBe('VIP-3');
  });

  it('generates a configurable SVG and embeds an optional inline logo', async () => {
    const svg = await generateQrCodeSvg('https://qresto.example/restaurant/a?table=12', {
      size: 320,
      darkColor: '#123456',
      lightColor: '#ffffff',
      logoDataUrl: 'data:image/png;base64,aGVsbG8=',
    });

    expect(svg).toContain('width="320"');
    expect(svg).toContain('#123456');
    expect(svg).toContain('data:image/png;base64,aGVsbG8=');
    expect(svg).toContain('<rect x="17" y="17" width="11" height="11"');
  });

  it('rejects unsupported image sizes and colors', async () => {
    await expect(generateQrCodeSvg('menu', { size: 80 })).rejects.toThrow(
      'La taille du QR code doit être comprise entre 120 et 1200 pixels.'
    );
    await expect(generateQrCodeSvg('menu', { darkColor: 'not-a-color' })).rejects.toThrow(
      'Les couleurs du QR code doivent être au format hexadécimal #RRGGBB.'
    );
  });
});
