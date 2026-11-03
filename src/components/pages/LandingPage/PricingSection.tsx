'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { PLAN_CURRENCY, PLANS_CATALOG } from '@/lib/subscription/catalog';

export const PricingSection: React.FC = () => {
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
          <h2 className="text-3xl sm:text-4xl font-black text-stone-950">
            Un investissement rentabilisé dès le 1er jour
          </h2>
          <p className="text-sm sm:text-base text-stone-500 mt-2 font-normal">
            Profitez d’un essai de 14 jours, puis choisissez la formule adaptée à votre établissement.
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
              Tarif mensuel
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
          {PLANS_CATALOG.map((plan) => {
            const highlighted = Boolean(plan.popular);
            const price = billingCycle === 'monthly'
              ? plan.monthlyPrice
              : Math.round(plan.yearlyPrice / 12);

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                className={`rounded-3xl p-8 border shadow-sm flex flex-col justify-between relative ${
                  highlighted
                    ? 'bg-stone-950 text-white border-2 border-amber-500 shadow-2xl'
                    : 'bg-white text-stone-950 border-stone-200'
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-stone-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                    Recommandé
                  </div>
                )}
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${highlighted ? 'text-amber-400' : 'text-stone-500'}`}>
                    {plan.name}
                  </span>
                  <div className="mt-3 mb-6">
                    <span className="text-4xl font-black">
                      {new Intl.NumberFormat('fr-FR').format(price)}
                    </span>
                    <span className={`text-sm font-bold ml-1 ${highlighted ? 'text-stone-400' : 'text-stone-500'}`}>
                      {PLAN_CURRENCY} / mois
                    </span>
                    {billingCycle === 'yearly' && (
                      <p className={`mt-1 text-[11px] ${highlighted ? 'text-stone-400' : 'text-stone-500'}`}>
                        Prix annuel indicatif : {new Intl.NumberFormat('fr-FR').format(plan.yearlyPrice)} {PLAN_CURRENCY}
                      </p>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed mb-6 font-normal ${highlighted ? 'text-stone-300' : 'text-stone-600'}`}>
                    {plan.description}
                  </p>
                  <div className={`space-y-3 border-t pt-6 ${highlighted ? 'border-stone-800' : 'border-stone-100'}`}>
                    {plan.features.map((feature) => (
                      <div key={feature} className={`flex items-center gap-2.5 text-xs ${highlighted ? 'text-stone-200' : 'text-stone-700'}`}>
                        <Check className={`w-4 h-4 shrink-0 ${highlighted ? 'text-amber-400' : 'text-emerald-600'}`} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <a
                  href="/register-restaurant"
                  className={`mt-8 w-full py-3 rounded-xl font-bold text-xs transition-colors inline-flex items-center justify-center ${
                    highlighted
                      ? 'bg-linear-to-r from-amber-500 to-orange-500 text-stone-950'
                      : 'border border-stone-300 hover:border-stone-900 text-stone-900'
                  }`}
                >
                  Choisir la formule {plan.name}
                </a>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-stone-500">
          Tarifs indicatifs à confirmer. Le changement de formule n’entraîne pas de paiement automatique.
        </p>
      </div>
    </section>
  );
};
