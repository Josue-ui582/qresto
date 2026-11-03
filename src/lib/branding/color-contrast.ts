function parseHexColor(color: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(color);
  if (!match) return null;
  return [
    Number.parseInt(match[1].slice(0, 2), 16),
    Number.parseInt(match[1].slice(2, 4), 16),
    Number.parseInt(match[1].slice(4, 6), 16),
  ];
}

function relativeLuminance(color: [number, number, number]): number {
  const linear = color.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function getAccessibleForeground(background: string): '#000000' | '#ffffff' | null {
  const parsedBackground = parseHexColor(background);
  if (!parsedBackground) return null;

  const backgroundLuminance = relativeLuminance(parsedBackground);
  const blackContrast = (backgroundLuminance + 0.05) / 0.05;
  const whiteContrast = 1.05 / (backgroundLuminance + 0.05);
  const foreground = blackContrast >= whiteContrast ? '#000000' : '#ffffff';
  return Math.max(blackContrast, whiteContrast) >= 4.5 ? foreground : null;
}
