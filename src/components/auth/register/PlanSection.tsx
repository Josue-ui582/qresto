import React from 'react';
import { FaIcon } from '@/components/common/Icon';
import { RegisterFormData, UpdateFormFn } from '@/types';

interface Props {
  formData: RegisterFormData;
  updateForm: UpdateFormFn;
}

export const PlanSection: React.FC<Props> = ({ formData, updateForm }) => (
  <div>
    <h3 className="section-title">
      <FaIcon name="fa-solid fa-credit-card" />
      <span>3. Formule d'abonnement au Bénin</span>
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div onClick={() => updateForm('plan', 'STARTER_5000')}
        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
          formData.plan === 'STARTER_5000' ? 'border-brand bg-primary-soft shadow-sm' : 'border-soft hover:border-stone-300 bg-surface-alt'
        }`}>
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-text text-sm">Formule Starter</span>
          <span className="text-sm font-extrabold text-brand">5 000 FCFA/m</span>
        </div>
        <p className="text-xs text-muted">Menu digital, jusqu'à 15 tables QR, commandes en direct.</p>
      </div>
      <div onClick={() => updateForm('plan', 'PRO_8000')}
        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
          formData.plan === 'PRO_8000' ? 'border-brand bg-primary-soft shadow-sm' : 'border-soft hover:border-stone-300 bg-surface-alt'
        }`}>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-text text-sm">Formule Pro Illimitée</span>
            <span className="px-1.5 py-0.5 bg-brand text-text-inverse rounded text-[10px] font-bold">Populaire</span>
          </div>
          <span className="text-sm font-extrabold text-brand">8 000 FCFA/m</span>
        </div>
        <p className="text-xs text-muted">Tables illimitées, 3D interactive, analytics avancés.</p>
      </div>
    </div>
  </div>
);
