import { Icon } from '@/components/common/Icon';
import { PaymentMethod } from '@/types';
import React from 'react';

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  desc: string;
  color: string;
}

const PAYMENT_METHODS: PaymentOption[] = [
  {
    id: 'MTN_MOMO',
    label: 'MTN MoMo',
    desc: 'Paiement mobile instantané',
    color: 'text-caution-600 bg-caution-50',
  },
  {
    id: 'MOOV_MONEY',
    label: 'Moov Money',
    desc: 'Paiement mobile rapide',
    color: 'text-info-600 bg-info-50',
  },
  {
    id: 'CASH_ON_DELIVERY',
    label: 'Espèces',
    desc: 'À la livraison ou à table',
    color: 'text-ink-700 bg-ink-100',
  },
];

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  setPaymentMethod,
}) => (
  <div className="pt-2">
    <label className="form-label form-label-spaced">
      3. Mode de paiement
    </label>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {PAYMENT_METHODS.map((pm) => (
        <div
          key={pm.id}
          onClick={() => setPaymentMethod(pm.id)}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            paymentMethod === pm.id
              ? 'border-brand bg-primary-soft shadow-sm'
              : 'border-soft hover:border-ink-300 bg-surface-alt'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${pm.color}`}>
              {pm.label}
            </span>
            {paymentMethod === pm.id && (
              <Icon name="circle-check" className="text-brand-500 text-sm" />
            )}
          </div>
          <p className="text-[0.6875rem] text-ink-500 mt-1">{pm.desc}</p>
        </div>
      ))}
    </div>
  </div>
);
