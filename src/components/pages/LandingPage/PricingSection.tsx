'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';

const STARTER_FEATURES = [
  'Jusqu’à 5 tables QR',
  'Menu digital complet',
  'Support standard par email',
  'Pas de commission cachée',
];

const PRO_FEATURES = [
  'Tables illimitées avec QR dynamique',
  'Intégration Mobile Money (MTN & Moov)',
  'Visualiseur 3D interactif des plats',
  'Dashboard gérant avec KPIs en direct',
  'Impression chevalets haute définition',
];

const BUSINESS_FEATURES = [
  'Multi-restaurants & succursales',
  'Export comptable & analytics avancés',
  'Modélisation 3D sur-mesure de vos plats',
  'Accompagnement et support VIP 7j/7',
];

export const PricingSection: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#fbf9f5]">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="text-xs uppercase font-extrabold tracking-widest text-amber-700 mb-2">
            Tarification Transparente
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
            Un investissement rentabilisé dès le 1er jour
          </h2>
          <p className="text-sm sm:text-base text-stone-500 mt-2 font-normal">
            Commencez gratuitement, puis choisissez la formule adaptée à votre rythme sans engagement.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="mt-6 inline-flex items-center p-1 bg-stone-200/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-stone-950 shadow-sm'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Paiement Mensuel
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              <span>Annuel</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500 text-stone-950 font-black">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-stretch">
          {/* Plan 1: Starter */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Starter</span>
              <div className="mt-3 mb-6">
                <span className="text-4xl font-black text-stone-950 font-display">0</span>
                <span className="text-sm font-bold text-stone-500 ml-1">FCFA / mois</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-6 font-normal">
                Idéal pour tester la digitalisation de votre carte sur quelques tables.
              </p>
              <div className="space-y-3 border-t border-stone-100 pt-6">
                {STARTER_FEATURES.map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-xs text-stone-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <a href="/register-restaurant" className="mt-8 w-full py-3 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-900 font-bold text-xs transition-colors inline-flex items-center justify-center">
              Démarrer gratuitement
            </a>
          </motion.div>

          {/* Plan 2: Pro (Highlight) */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-stone-950 text-white rounded-3xl p-8 border-2 border-amber-500 shadow-2xl relative flex flex-col justify-between"
          >
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-md">
              Recommandé
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pro Restaurant</span>
              <div className="mt-3 mb-6">
                <span className="text-4xl font-black text-white font-display">
                  {billingCycle === 'monthly' ? '5 000' : '4 000'}
                </span>
                <span className="text-sm font-bold text-stone-400 ml-1">FCFA / mois</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed mb-6 font-normal">
                Pour les restaurants en activité voulant maximiser le chiffre d’affaires et la rotation des tables.
              </p>
              <div className="space-y-3 border-t border-stone-800 pt-6">
                {PRO_FEATURES.map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-xs text-stone-200">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <a href="/register-restaurant" className="mt-8 w-full py-3.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-xs shadow-lg hover:shadow-amber-500/30 transition-all inline-flex items-center justify-center">
              Choisir la formule Pro
            </a>
          </motion.div>

          {/* Plan 3: Business */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Business & Chaînes</span>
              <div className="mt-3 mb-6">
                <span className="text-4xl font-black text-stone-950 font-display">
                  {billingCycle === 'monthly' ? '8 000' : '6 500'}
                </span>
                <span className="text-sm font-bold text-stone-500 ml-1">FCFA / mois</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-6 font-normal">
                Pour les hôtels, maquis réputés et enseignes multi-établissements.
              </p>
              <div className="space-y-3 border-t border-stone-100 pt-6">
                {BUSINESS_FEATURES.map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-xs text-stone-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <a href="/register-restaurant" className="mt-8 w-full py-3 rounded-xl border border-stone-300 hover:border-stone-900 text-stone-900 font-bold text-xs transition-colors inline-flex items-center justify-center">
              Contacter pour Business
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
