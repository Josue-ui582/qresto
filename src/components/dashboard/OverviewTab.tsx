import React, { useMemo } from 'react';
import { FaIcon } from '../common/Icon';
import { Order } from '@/types';

export interface OverviewTabProps {
  restaurantName: string;
  totalRevenue: number;
  totalOrdersCount: number;
  averageOrderValue: number;
  totalClientsCount: number;
  demoModeWithData?: boolean;
  orders?: Order[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  restaurantName,
  totalRevenue,
  totalOrdersCount,
  averageOrderValue,
  totalClientsCount,
  demoModeWithData = false,
  orders = [],
}) => {
  // 1. Calcul dynamique des 7 derniers jours à partir des vraies commandes
  const last7DaysData = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      const formattedLabel = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1, 3);

      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return (
          orderDate.getDate() === d.getDate() &&
          orderDate.getMonth() === d.getMonth() &&
          orderDate.getFullYear() === d.getFullYear()
        );
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      days.push({
        label: formattedLabel,
        revenue: dayRevenue,
        count: dayOrders.length,
      });
    }

    // fallback si mode démo actif et pas de vraies commandes
    if (orders.length === 0 && demoModeWithData) {
      return [
        { label: 'Jeu', revenue: 15000, count: 3 },
        { label: 'Ven', revenue: 28000, count: 5 },
        { label: 'Sam', revenue: 65000, count: 12 },
        { label: 'Dim', revenue: 80000, count: 15 },
        { label: 'Lun', revenue: 35000, count: 6 },
        { label: 'Mar', revenue: 42000, count: 8 },
        { label: 'Mer', revenue: 55000, count: 10 },
      ];
    }

    return days;
  }, [orders, demoModeWithData]);

  // Max revenue sur 7j pour calibrer le graphique SVG
  const max7DaysRev = useMemo(() => {
    const max = Math.max(...last7DaysData.map((d) => d.revenue));
    return max > 0 ? max : 1;
  }, [last7DaysData]);

  // Génération du SVG path fluide pour les 7 jours
  const svgPathD = useMemo(() => {
    if (last7DaysData.every((d) => d.revenue === 0)) {
      return 'M 10,140 L 340,140';
    }

    const width = 340;
    const height = 120; // espace de dessin vertical
    const startX = 10;
    const stepX = width / (last7DaysData.length - 1);

    const points = last7DaysData.map((d, i) => {
      const x = startX + i * stepX;
      const y = 140 - (d.revenue / max7DaysRev) * height;
      return { x, y };
    });

    return points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');
  }, [last7DaysData, max7DaysRev]);

  // 2. Calcul dynamique des commandes par heure (9h à 20h)
  const hourlyData = useMemo(() => {
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    const counts = hours.map((hour) => {
      const count = orders.filter((o) => {
        const h = new Date(o.createdAt).getHours();
        return h === hour;
      }).length;

      return {
        hour: `${hour}h`,
        val: count,
      };
    });

    // calcul de la hauteur relative en %
    const maxVal = Math.max(...counts.map((c) => c.val));

    if (maxVal === 0 && demoModeWithData) {
      const demoVals = [15, 25, 40, 85, 95, 50, 20, 30, 45, 60, 90, 75];
      return hours.map((h, idx) => ({
        hour: `${h}h`,
        percent: demoVals[idx],
        count: Math.round(demoVals[idx] / 10),
      }));
    }

    return counts.map((c) => ({
      hour: c.hour,
      percent: maxVal > 0 ? (c.val / maxVal) * 100 : 0,
      count: c.val,
    }));
  }, [orders, demoModeWithData]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="heading-lg">Bonjour 👋</h1>
        <p className="text-sm text-muted mt-1">
          Voici l'activité de <span className="font-semibold text-text">{restaurantName}</span>.
        </p>
      </div>

      {/* Cartes Métriques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="metric-card flex items-center justify-between hover:shadow-lg transition-all">
          <div>
            <p className="text-xs font-medium text-muted">Chiffre d'affaires</p>
            <h3 className="text-2xl font-black text-text mt-1">{totalRevenue.toLocaleString()} F</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">
            <FaIcon name="fa-solid fa-wallet" />
          </div>
        </div>

        <div className="metric-card flex items-center justify-between hover:shadow-lg transition-all">
          <div>
            <p className="text-xs font-medium text-muted">Commandes</p>
            <h3 className="text-2xl font-black text-text mt-1">{totalOrdersCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0">
            <FaIcon name="fa-solid fa-bag-shopping" />
          </div>
        </div>

        <div className="metric-card flex items-center justify-between hover:shadow-lg transition-all">
          <div>
            <p className="text-xs font-medium text-muted">Panier moyen</p>
            <h3 className="text-2xl font-black text-text mt-1">{averageOrderValue.toLocaleString()} F</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
            <FaIcon name="fa-solid fa-arrow-trend-up" />
          </div>
        </div>

        <div className="metric-card flex items-center justify-between hover:shadow-lg transition-all">
          <div>
            <p className="text-xs font-medium text-muted">Clients</p>
            <h3 className="text-2xl font-black text-text mt-1">{totalClientsCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-lg shrink-0">
            <FaIcon name="fa-solid fa-users" />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique 1 : Ventes sur 7 jours */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-text">Ventes sur 7 jours</h3>
              <p className="text-xs text-muted">Chiffre d'affaires récent</p>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              {last7DaysData.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()} F
            </span>
          </div>

          <div className="relative h-56 w-full flex items-end">
            <div className="h-full flex flex-col justify-between text-[11px] text-stone-400 pr-3 pb-6">
              <span>{max7DaysRev.toLocaleString()} F</span>
              <span>{Math.round(max7DaysRev * 0.75).toLocaleString()} F</span>
              <span>{Math.round(max7DaysRev * 0.5).toLocaleString()} F</span>
              <span>{Math.round(max7DaysRev * 0.25).toLocaleString()} F</span>
              <span>0 F</span>
            </div>

            <div className="flex-1 h-full relative flex flex-col justify-between">
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-200 h-0" />

              <svg
                className="absolute inset-0 w-full h-full pb-6 overflow-visible pointer-events-none"
                viewBox="0 0 350 150"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d={`${svgPathD} L 340,140 L 10,140 Z`}
                  fill="url(#chartGrad)"
                />

                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>

              <div className="flex justify-between text-[11px] text-stone-500 pt-2 border-t border-transparent font-medium">
                {last7DaysData.map((d, i) => (
                  <span key={i}>{d.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Graphique 2 : Commandes par heure */}
        <div className="metric-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-text">Commandes par heure</h3>
              <p className="text-xs text-muted">Heures de pointe aujourd'hui</p>
            </div>
          </div>

          <div className="relative h-56 w-full flex items-end">
            <div className="flex-1 h-full flex flex-col justify-between">
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-200 h-0" />

              <div className="absolute inset-0 pb-6 flex items-end justify-between gap-1">
                {hourlyData.map((b, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip au survol */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-stone-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10">
                      {b.count} cmd
                    </div>

                    <div
                      style={{ height: `${Math.max(b.percent, 4)}%` }}
                      className="w-full max-w-3.5 bg-amber-400/80 group-hover:bg-amber-500 rounded-t-sm transition-all duration-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-[10px] text-stone-400 pt-2 font-medium">
                {hourlyData.map((b) => (
                  <span key={b.hour}>{b.hour}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
