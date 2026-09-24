import { FaIcon } from '@/components/common/Icon';
import { OrderType } from '@/types';
import React from 'react';

interface OrderTypeOption {
  id: OrderType;
  label: string;
  icon: string;
}

const ORDER_TYPES: OrderTypeOption[] = [
  { id: 'DINE_IN', label: 'Sur place (Table)', icon: 'fa-solid fa-utensils' },
  { id: 'DELIVERY', label: 'Livraison', icon: 'fa-solid fa-motorcycle' },
  { id: 'PICKUP', label: 'À emporter', icon: 'fa-solid fa-bag-shopping' },
];

interface OrderTypeSelectorProps {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: string;
  setTableNumber: (val: string) => void;
}

export const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
  orderType,
  setOrderType,
  tableNumber,
  setTableNumber,
}) => (
  <div className="space-y-4">
    <div>
      <label className="form-label" style={{ marginBottom: '0.75rem' }}>
        1. Mode de consommation
      </label>
      <div className="grid grid-cols-3 gap-2.5">
        {ORDER_TYPES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setOrderType(mode.id)}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              orderType === mode.id
                ? 'border-brand bg-primary-soft text-brand font-bold shadow-sm'
                : 'border-soft hover:border-stone-300 text-muted bg-surface-alt'
            }`}
          >
            <FaIcon
              name={mode.icon}
              className={`text-base ${orderType === mode.id ? 'text-amber-600' : 'text-stone-400'}`}
            />
            <span className="text-xs">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>

    {orderType === 'DINE_IN' && (
      <div className="bg-primary-soft p-4 rounded-2xl border border-brand/20">
        <label className="block text-xs font-bold text-brand mb-1">
          Numéro de table en salle *
        </label>
        <input
          type="text"
          required
          placeholder="Ex: 4, Table VIP, Pergola 2..."
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="input-field bg-white"
        />
      </div>
    )}
  </div>
);
