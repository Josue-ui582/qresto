import { describe, expect, it } from 'vitest';
import { serializeAnalyticsCsv } from './analytics-csv';

describe('serializeAnalyticsCsv', () => {
  it('exports aggregate sections and escapes spreadsheet formulas and delimiters', () => {
    const csv = serializeAnalyticsCsv({
      totalRevenue: 12_500,
      totalOrders: 4,
      averageOrderValue: 3_125,
      activeTablesCount: 2,
      ordersByStatus: [{ status: 'NEW', count: 2 }],
      ordersByType: [{ type: 'DINE_IN', count: 3 }],
      topItems: [{
        id: 'dish-1',
        name: '=HYPERLINK("https://example.test")',
        category: 'Plats',
        quantity: 3,
        revenue: 9_000,
      }],
      peakHours: [{ hour: 12, count: 2 }],
    });

    expect(csv).toContain('"Synthèse","Chiffre d’affaires","","12500"');
    expect(csv).toContain('"Statut","NEW","2",""');
    expect(csv).toContain('"Mode de service","DINE_IN","3",""');
    expect(csv).toContain(`"'=HYPERLINK(""https://example.test"")","3","9000"`);
    expect(csv).toContain('"Heure de pointe","12 h","2",""');
  });
});
