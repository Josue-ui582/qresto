import React from 'react';
import { FaIcon } from '../common/Icon';

interface OverviewTabProps {
  restaurantName: string;
  totalRevenue: number;
  totalOrdersCount: number;
  averageOrderValue: number;
  totalClientsCount: number;
  demoModeWithData: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  restaurantName,
  totalRevenue,
  totalOrdersCount,
  averageOrderValue,
  totalClientsCount,
  demoModeWithData,
}) => {
  const hourlyData = [
    { hour: '9h', val: demoModeWithData ? 15 : 0 },
    { hour: '10h', val: demoModeWithData ? 25 : 0 },
    { hour: '11h', val: demoModeWithData ? 40 : 0 },
    { hour: '12h', val: demoModeWithData ? 85 : 0 },
    { hour: '13h', val: demoModeWithData ? 95 : 0 },
    { hour: '14h', val: demoModeWithData ? 50 : 0 },
    { hour: '15h', val: demoModeWithData ? 20 : 0 },
    { hour: '16h', val: demoModeWithData ? 30 : 0 },
    { hour: '17h', val: demoModeWithData ? 45 : 0 },
    { hour: '18h', val: demoModeWithData ? 60 : 0 },
    { hour: '19h', val: demoModeWithData ? 90 : 0 },
    { hour: '20h', val: demoModeWithData ? 75 : 0 },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="heading-lg">Bonjour 👋</h1>
        <p className="text-sm text-muted mt-1">
          Voici l'activité de <span className="font-semibold text-text">{restaurantName}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="metric-card flex items-center justify-between hover:shadow-lg transition-all">
          <div>
            <p className="text-xs font-medium text-muted">Chiffre d'affaires</p>
            <h3 className="text-2xl font-black text-text mt-1">{totalRevenue.toLocaleString()} F</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-accent-soft text-accent flex items-center justify-center text-lg shrink-0">
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
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-brand flex items-center justify-center text-lg shrink-0">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-text">Ventes sur 7 jours</h3>
          </div>

          <div className="relative h-56 w-full flex items-end">
            <div className="h-full flex flex-col justify-between text-[11px] text-stone-400 pr-3 pb-6">
              <span>4</span>
              <span>3</span>
              <span>2</span>
              <span>1</span>
              <span>0</span>
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
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d={
                    demoModeWithData
                      ? 'M 10,130 C 50,110 80,60 120,70 C 160,80 200,40 240,45 C 280,50 310,20 340,30 L 340,145 L 10,145 Z'
                      : 'M 10,140 L 340,140 L 340,145 L 10,145 Z'
                  }
                  fill="url(#chartGrad)"
                />

                <path
                  d={
                    demoModeWithData
                      ? 'M 10,130 C 50,110 80,60 120,70 C 160,80 200,40 240,45 C 280,50 310,20 340,30'
                      : 'M 10,140 L 340,140'
                  }
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />

                {demoModeWithData && (
                  <>
                    <circle cx="120" cy="70" r="4" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
                    <circle cx="240" cy="45" r="4" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
                    <circle cx="340" cy="30" r="4" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
                  </>
                )}
              </svg>

              <div className="flex justify-between text-[11px] text-stone-400 pt-2 border-t border-transparent">
                <span>Jeu</span>
                <span>Ven</span>
                <span>Sam</span>
                <span>Dim</span>
                <span>Lun</span>
                <span>Mar</span>
                <span>Mer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-text">Commandes par heure</h3>
          </div>

          <div className="relative h-56 w-full flex items-end">
            <div className="h-full flex flex-col justify-between text-[11px] text-stone-400 pr-3 pb-6">
              <span>4</span>
              <span>3</span>
              <span>2</span>
              <span>1</span>
              <span>0</span>
            </div>

            <div className="flex-1 h-full flex flex-col justify-between">
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-100 h-0" />
              <div className="w-full border-b border-stone-200 h-0" />

              <div className="absolute inset-0 pb-6 pl-6 flex items-end justify-between gap-1">
                {hourlyData.map((b, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div
                      style={{ height: `${b.val}%` }}
                      className="w-full max-w-3.5 bg-amber-400/80 group-hover:bg-amber-500 rounded-t-sm transition-all duration-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-[10px] text-stone-400 pt-2">
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
