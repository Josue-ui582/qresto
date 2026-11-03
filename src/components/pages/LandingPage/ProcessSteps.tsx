'use client';

import React from 'react';
import { motion } from 'motion/react';
import { QrCode, RotateCw, Utensils, ShieldCheck } from 'lucide-react';

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Scan à table',
    desc: 'Le client pointe son smartphone sur le QR code fixé à sa table. Le menu s’ouvre sans installer aucune application.',
    icon: QrCode,
  },
  {
    step: '02',
    title: 'Visualisation 3D',
    desc: 'Il découvre vos plats avec photos haute résolution et inspecte les spécialités sous tous les angles en 3D 360°.',
    icon: RotateCw,
  },
  {
    step: '03',
    title: 'Commande immédiate',
    desc: 'Le client valide son panier et le restaurant reçoit la commande dans son tableau de bord.',
    icon: Utensils,
  },
  {
    step: '04',
    title: 'Service au restaurant',
    desc: 'Le client et le restaurant conviennent directement des modalités de règlement.',
    icon: ShieldCheck,
  },
];

export const ProcessSteps: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-paper-white border-y border-ink-200/80">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto mb-14"
        >
          <div className="text-xs uppercase font-extrabold tracking-widest text-brand-700 mb-2">
            Expérience Sans Friction
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-ink-950">
            Comment ça marche pour vos clients ?
          </h2>
          <p className="text-sm sm:text-base text-ink-500 mt-3 font-normal">
            De l’installation à table jusqu’au régal, tout se fait en 4 étapes simples et agréables.
          </p>
        </motion.div>

        {/* 4 Process Cards with motion hover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((item, index) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="bg-paper-white rounded-2xl p-5 border border-ink-200/90 text-left relative flex flex-col justify-between transition-shadow hover:shadow-xl hover:shadow-ink-200/50"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-ink-900 text-paper-white flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-ink-300">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-ink-900 mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-ink-600 leading-relaxed font-normal">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
