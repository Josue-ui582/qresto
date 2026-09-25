'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { QrCode, Smartphone, Printer, Loader2, Store } from 'lucide-react';
import Link from 'next/link';

interface RestaurantOption {
  id: string;
  name: string;
  slug: string;
  _count?: {
    tables: number;
  };
}

export const QRSimulator: React.FC = () => {
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [selectedResto, setSelectedResto] = useState<RestaurantOption | null>(null);
  const [customRestoName, setCustomRestoName] = useState<string>('');
  const [demoTable, setDemoTable] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [origin, setOrigin] = useState<string>('https://qresto.africa');

  useEffect(() => {
    // Détecter le domaine actuel (ex: http://localhost:3000 ou https://qresto.africa)
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/restaurants/featured');
        if (res.ok) {
          const data = await res.json();
          const list: RestaurantOption[] = data.restaurants || [];
          setRestaurants(list);
          if (list.length > 0) {
            setSelectedResto(list[0]);
            setCustomRestoName(list[0].name);
          }
        }
      } catch (err) {
        console.error('Erreur chargement restaurants simulateur QR:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Changement de restaurant sélectionné
  const handleSelectRestaurant = (restoId: string) => {
    const found = restaurants.find((r) => r.id === restoId);
    if (found) {
      setSelectedResto(found);
      setCustomRestoName(found.name);
      setDemoTable(1); // Réinitialiser à la table 1
    }
  };

  // Génération dynamique des boutons de tables selon le nombre de tables en BDD
  const totalTables = selectedResto?._count?.tables || 8;
  const tableOptions = Array.from(
    { length: Math.min(Math.max(totalTables, 4), 12) },
    (_, i) => i + 1
  );

  // Construction des liens réels
  const currentSlug = selectedResto?.slug || 'chez-nino';
  const targetRelativePath = `/restaurant/${currentSlug}?table=${demoTable}`;
  const fullQrTargetUrl = `${origin}${targetRelativePath}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    fullQrTargetUrl
  )}&color=1c1917`;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-900 text-white relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Colonne Gauche: Contrôles Interactifs */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-4">
              <QrCode className="w-3.5 h-3.5" />
              <span>Simulateur en direct avec données réelles</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4 font-display">
              Personnalisez vos QR codes de tables en quelques clics
            </h2>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl font-normal">
              Chaque table dispose de son propre QR code sécurisé. Le client scanne, le numéro de table est automatiquement injecté et la commande part directement au bon endroit.
            </p>

            {/* Formulaire de contrôle */}
            <div className="bg-stone-800/80 backdrop-blur-md rounded-3xl p-6 border border-stone-700/80 space-y-5 max-w-xl">
              {isLoading ? (
                <div className="py-8 flex flex-col items-center justify-center text-stone-400">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500 mb-2" />
                  <span className="text-xs">Chargement des établissements...</span>
                </div>
              ) : (
                <>
                  {/* Sélecteur d'Établissement réel */}
                  {restaurants.length > 0 && (
                    <div>
                      <label className="flex text-xs font-bold text-stone-300 mb-2 items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sélectionner un établissement</span>
                      </label>
                      <select
                        value={selectedResto?.id || ''}
                        onChange={(e) => handleSelectRestaurant(e.target.value)}
                        className="w-full px-4 py-2.5 bg-stone-900 text-white rounded-xl border border-stone-700 focus:border-amber-500 text-sm font-medium outline-none cursor-pointer"
                      >
                        {restaurants.map((resto) => (
                          <option key={resto.id} value={resto.id}>
                            {resto.name} ({resto._count?.tables || 0} tables)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Nom personnalisé sur la carte chevalet */}
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-2">
                      Nom affiché sur le chevalet
                    </label>
                    <input
                      type="text"
                      value={customRestoName}
                      onChange={(e) => setCustomRestoName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-stone-900 text-white rounded-xl border border-stone-700 focus:border-amber-500 text-sm outline-none font-medium"
                      placeholder="Nom de votre restaurant"
                    />
                  </div>

                  {/* Choix du Numéro de Table */}
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-2">
                      Numéro de table :{' '}
                      <span className="text-amber-400 font-extrabold text-sm">
                        Table #{demoTable}
                      </span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {tableOptions.map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setDemoTable(num)}
                          className={`w-10 h-10 rounded-xl font-black text-xs transition-all cursor-pointer ${
                            demoTable === num
                              ? 'bg-amber-500 text-stone-950 scale-105 shadow-md shadow-amber-500/30'
                              : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-700'
                          }`}
                        >
                          #{num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      href={targetRelativePath}
                      className="px-5 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-xs shadow-lg hover:shadow-amber-500/30 transition-all inline-flex items-center gap-2 justify-center"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Tester le scan de la Table #{demoTable}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimer simulation</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Colonne Droite: Aperçu Carte Chevalet QR Code */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              key={`${selectedResto?.id}-${demoTable}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 text-stone-900 shadow-2xl border-4 border-amber-500/40 text-center relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 font-black text-lg mx-auto flex items-center justify-center mb-3">
                Q
              </div>
              <h4 className="text-base font-extrabold text-stone-950 leading-tight">
                {customRestoName || 'Mon Restaurant'}
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Scannez pour commander sans attente
              </p>

              {/* QR Code Réel Généré */}
              <div className="my-5 p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 inline-block shadow-inner">
                <img
                  src={qrImageUrl}
                  alt={`QR Code Table ${demoTable}`}
                  className="w-40 h-40 mx-auto rounded-lg"
                />
              </div>

              {/* Badge Table */}
              <div className="inline-block px-4 py-1.5 rounded-full bg-stone-900 text-white font-black text-xs uppercase tracking-wider mb-2">
                Table #{demoTable}
              </div>

              <div className="text-[10px] text-stone-400 font-medium">
                Compatible iPhone & Android · 100% sans application
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
