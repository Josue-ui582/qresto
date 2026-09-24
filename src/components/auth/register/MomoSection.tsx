import React from 'react';
import { FaIcon } from '@/components/common/Icon';
import { RegisterFormData, UpdateFormFn } from '@/types';

interface Props {
  formData: RegisterFormData;
  updateForm: UpdateFormFn;
}

export const MomoSection: React.FC<Props> = ({ formData, updateForm }) => (
  <div>
    <h3 className="section-title">
      <FaIcon name="fa-solid fa-money-bill-transfer" />
      <span>4. Réception des paiements Mobile Money</span>
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="form-label">Opérateur principal</label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => updateForm('momoProvider', 'MTN')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              formData.momoProvider === 'MTN' ? 'border-yellow-500 bg-yellow-50 text-yellow-800' : 'border-soft text-muted bg-surface-alt'
            }`}>
            MTN MoMo 🟡
          </button>
          <button type="button" onClick={() => updateForm('momoProvider', 'MOOV')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              formData.momoProvider === 'MOOV' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-soft text-muted bg-surface-alt'
            }`}>
            Moov Money 🔵
          </button>
        </div>
      </div>
      <div>
        <label className="form-label">Numéro MoMo pour recevoir les fonds</label>
        <input type="tel" placeholder="Ex: +229 97 00 11 22" value={formData.momoNumber}
          onChange={(e) => updateForm('momoNumber', e.target.value)}
          className="input-field" />
      </div>
    </div>
  </div>
);
