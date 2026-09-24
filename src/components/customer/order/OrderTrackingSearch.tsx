import { FaIcon } from '@/components/common/Icon';
import React from 'react';

interface OrderTrackingSearchProps {
  searchInput: string;
  setSearchInput: (val: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  onDemoCodeClick: (code: string) => void;
}

export const OrderTrackingSearch: React.FC<OrderTrackingSearchProps> = ({
  searchInput,
  setSearchInput,
  handleSearch,
  onDemoCodeClick,
}) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm mb-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl mx-auto mb-4">
        <FaIcon name="fa-solid fa-route" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
        Suivi de Commande en Direct
      </h1>
      <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-6">
        Saisissez votre code de suivi (ex : <strong>QR-7842</strong> ou <strong>QR-9310</strong>) pour connaître en direct l'état de votre commande.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <FaIcon name="fa-solid fa-ticket" />
          </div>
          <input
            type="text"
            required
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Code de suivi (ex: QR-7842)"
            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm shadow-md transition-all shrink-0 flex items-center justify-center gap-2"
        >
          <FaIcon name="fa-solid fa-magnifying-glass" />
          <span>Rechercher</span>
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-400">
        <span>Codes de démonstration :</span>
        <button
          type="button"
          onClick={() => onDemoCodeClick('QR-7842')}
          className="font-mono font-bold text-amber-600 hover:underline bg-amber-50 px-2 py-0.5 rounded"
        >
          QR-7842 (En préparation)
        </button>
        <button
          type="button"
          onClick={() => onDemoCodeClick('QR-9310')}
          className="font-mono font-bold text-amber-600 hover:underline bg-amber-50 px-2 py-0.5 rounded"
        >
          QR-9310 (Prête !)
        </button>
      </div>
    </div>
  );
};
