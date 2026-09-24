'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, Smartphone, Printer } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import Link from 'next/link';

const TABLE_OPTIONS = [1, 2, 4, 8, 12, 16];

export const QRSimulator: React.FC = () => {
  const {  } = useNavigation();

  const [demoTable, setDemoTable] = useState<number>(4);
  const [demoRestoName, setDemoRestoName] = useState<string>('Chez Mama Bénin');
  // Reserved for a future "brand color" picker on the QR card preview.
  const [demoColor, setDemoColor] = useState<string>('#d97706'); // Amber 600

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-900 text-white relative overflow-hidden">
      {/* Subtle decorative grid background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Interactive QR Controls */}
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-4">
              <QrCode className="w-3.5 h-3.5" />
              <span>Simulateur en direct</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4 font-display">
              Personnalisez vos QR codes de tables en quelques clics
            </h2>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl font-normal">
              Chaque table dispose de son propre QR code sécurisé. Le client scanne, le numéro de table est automatiquement injecté et la commande part directement au bon endroit.
            </p>

            {/* Live Playground Controls */}
            <div className="bg-stone-800/80 backdrop-blur-md rounded-3xl p-6 border border-stone-700/80 space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-2">
                  Nom de votre restaurant
                </label>
                <input
                  type="text"
                  value={demoRestoName}
                  onChange={(e) => setDemoRestoName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-900 text-white rounded-xl border border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-2">
                  Numéro de table : <span className="text-amber-400 font-extrabold text-sm">Table #{demoTable}</span>
                </label>
                <div className="flex items-center gap-2">
                  {TABLE_OPTIONS.map((num) => (
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

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href={`/restaurant/chez-mama-benin?table=${demoTable}`} className="px-5 py-3 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-xs shadow-lg hover:shadow-amber-500/30 transition-all inline-flex items-center gap-2 justify-center">
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
            </div>
          </div>

          {/* Right Column: High-Res Chevalet QR Card Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              key={demoTable}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 text-stone-900 shadow-2xl border-4 border-amber-500/40 text-center relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 font-black text-lg mx-auto flex items-center justify-center mb-3">
                Q
              </div>
              <h4 className="text-base font-extrabold text-stone-950 leading-tight">
                {demoRestoName || 'Mon Restaurant'}
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">Scannez pour commander sans attente</p>

              {/* QR Code Container */}
              <div className="my-5 p-4 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 inline-block shadow-inner">
                {/* Generated QR representation */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `https://qresto.africa/#menu-chez-mama-benin?table=${demoTable}`
                  )}&color=1c1917`}
                  alt="QR Code Table"
                  className="w-40 h-40 mx-auto rounded-lg"
                />
              </div>

              {/* Table Badge */}
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
