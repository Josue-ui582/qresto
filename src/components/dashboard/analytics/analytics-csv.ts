import { AnalyticsStats } from './types';

function escapeCsvValue(value: string | number): string {
  const text = String(value);
  const safeText = typeof value === 'string' && /^[\s]*[=+\-@]/.test(text)
    ? `'${text}`
    : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export function serializeAnalyticsCsv(stats: AnalyticsStats): string {
  const rows: Array<Array<string | number>> = [
    ['Section', 'Élément', 'Nombre', 'Montant'],
    ['Synthèse', 'Chiffre d’affaires', '', stats.totalRevenue],
    ['Synthèse', 'Commandes', stats.totalOrders, ''],
    ['Synthèse', 'Panier moyen', '', stats.averageOrderValue],
    ['Synthèse', 'Tables actives', stats.activeTablesCount, ''],
    ...stats.ordersByStatus.map(({ status, count }) => ['Statut', status, count, '']),
    ...stats.ordersByType.map(({ type, count }) => ['Mode de service', type, count, '']),
    ...stats.topItems.map(({ name, quantity, revenue }) => ['Plat', name, quantity, revenue]),
    ...stats.peakHours.map(({ hour, count }) => ['Heure de pointe', `${String(hour).padStart(2, '0')} h`, count, '']),
  ];
  return rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');
}
