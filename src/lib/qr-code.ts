import QRCode from 'qrcode';

export interface QrCodeOptions {
  size?: number;
  darkColor?: string;
  lightColor?: string;
  logoDataUrl?: string;
}

const DEFAULT_QR_SIZE = 500;
const DEFAULT_DARK_COLOR = '#1c1917';
const DEFAULT_LIGHT_COLOR = '#ffffff';

export function createTableMenuUrl(origin: string, restaurantSlug: string, tableNumber: string | number) {
  const url = new URL(`/restaurant/${encodeURIComponent(restaurantSlug)}`, origin);
  url.searchParams.set('table', String(tableNumber));
  return url.toString();
}

export async function generateQrCodeSvg(
  value: string,
  options: QrCodeOptions = {}
): Promise<string> {
  if (!value.trim()) {
    throw new Error('Le contenu du QR code ne peut pas être vide.');
  }

  const size = options.size ?? DEFAULT_QR_SIZE;
  const darkColor = options.darkColor ?? DEFAULT_DARK_COLOR;
  const lightColor = options.lightColor ?? DEFAULT_LIGHT_COLOR;
  if (!Number.isInteger(size) || size < 120 || size > 1200) {
    throw new RangeError('La taille du QR code doit être comprise entre 120 et 1200 pixels.');
  }
  if (!/^#[0-9a-f]{6}$/i.test(darkColor) || !/^#[0-9a-f]{6}$/i.test(lightColor)) {
    throw new Error('Les couleurs du QR code doivent être au format hexadécimal #RRGGBB.');
  }

  let svg = await QRCode.toString(value, {
    type: 'svg',
    width: size,
    margin: 4,
    errorCorrectionLevel: 'H',
    color: {
      dark: `${darkColor}ff`,
      light: `${lightColor}ff`,
    },
  });

  if (options.logoDataUrl) {
    if (!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(options.logoDataUrl)) {
      throw new Error('Le logo doit être une image PNG, JPEG ou WebP intégrée.');
    }
    const dimensions = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    if (!dimensions) {
      throw new Error('Impossible de déterminer les dimensions du QR code pour intégrer le logo.');
    }
    const svgWidth = Number(dimensions[1]);
    const svgHeight = Number(dimensions[2]);
    const logoSize = Math.round(Math.min(svgWidth, svgHeight) * 0.2);
    const inset = Math.round(logoSize * 0.12);
    const x = Math.round((svgWidth - logoSize) / 2);
    const y = Math.round((svgHeight - logoSize) / 2);
    const overlay = [
      `<rect x="${x - inset}" y="${y - inset}" width="${logoSize + inset * 2}" height="${logoSize + inset * 2}" rx="${inset}" fill="${lightColor}"/>`,
      `<image href="${options.logoDataUrl}" x="${x}" y="${y}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`,
    ].join('');
    svg = svg.replace('</svg>', `${overlay}</svg>`);
  }

  return svg;
}

export async function generateQrCodeSvgDataUrl(
  value: string,
  options: QrCodeOptions = {}
): Promise<string> {
  const svg = await generateQrCodeSvg(value, options);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function generateQrCodePngDataUrl(
  value: string,
  options: QrCodeOptions = {}
): Promise<string> {
  const svg = await generateQrCodeSvg(value, options);
  const size = options.size ?? DEFAULT_QR_SIZE;

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Impossible de préparer l’image PNG du QR code.'));
        return;
      }
      context.drawImage(image, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error('Impossible de convertir le QR code SVG en PNG.'));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
