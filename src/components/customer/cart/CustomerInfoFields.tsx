import { OrderType } from '@/types';
import React from 'react';

interface CustomerInfoFieldsProps {
  orderType: OrderType;
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  customerAddress: string;
  setCustomerAddress: (val: string) => void;
  customerNotes: string;
  setCustomerNotes: (val: string) => void;
}

export const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({
  orderType,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  customerNotes,
  setCustomerNotes,
}) => (
  <div className="space-y-4 pt-2">
    <label className="form-label">
      2. Vos coordonnées (Sans inscription)
    </label>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="form-label">Nom & Prénom *</label>
        <input
          type="text"
          required
          placeholder="Ex: Kofi Mensah"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="input-field"
        />
      </div>

      <div>
        <label className="form-label">
          Téléphone béninois *
        </label>
        <input
          type="tel"
          required
          placeholder="Ex: +229 97 00 11 22"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="input-field"
        />
      </div>
    </div>

    {orderType === 'DELIVERY' && (
      <div>
        <label className="form-label">
          Adresse précise de livraison à Cotonou / Bénin *
        </label>
        <input
          type="text"
          required
          placeholder="Quartier, Rue, Repère (Ex: Haie Vive, Rue 340 face pharmacie)"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          className="input-field"
        />
      </div>
    )}

    <div>
      <label className="form-label">
        Instructions pour la cuisine / livreur (Optionnel)
      </label>
      <textarea
        rows={2}
        placeholder="Ex: Piment à part, bien doré, sauce chaude..."
        value={customerNotes}
        onChange={(e) => setCustomerNotes(e.target.value)}
        className="input-field"
      />
    </div>
  </div>
);
