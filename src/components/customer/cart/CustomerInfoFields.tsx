import { OrderType } from '@/types';
import { WHATSAPP_PHONE_COUNTRIES } from '@/lib/orders/whatsapp-phone';
import React from 'react';

interface CustomerInfoFieldsProps {
  orderType: OrderType;
  customerName: string;
  setCustomerName: (val: string) => void;
  customerPhone: string;
  setCustomerPhone: (val: string) => void;
  phoneCallingCode: string;
  setPhoneCallingCode: (val: string) => void;
  whatsappConsent: boolean;
  setWhatsappConsent: (val: boolean) => void;
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
  phoneCallingCode,
  setPhoneCallingCode,
  whatsappConsent,
  setWhatsappConsent,
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
          Numéro WhatsApp *
        </label>
        <div className="flex gap-2">
          <select
            aria-label="Pays du numéro WhatsApp"
            value={phoneCallingCode}
            onChange={(e) => setPhoneCallingCode(e.target.value)}
            className="input-field w-auto shrink-0"
          >
            {WHATSAPP_PHONE_COUNTRIES.map(({ name, callingCode }) => (
              <option key={callingCode} value={callingCode}>
                {name} ({callingCode})
              </option>
            ))}
          </select>
          <input
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="Ex: 97 00 11 22"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="input-field min-w-0 flex-1"
          />
        </div>
        <p className="mt-1 text-[0.6875rem] text-ink-500">
          Votre code de suivi sera envoyé sur ce numéro WhatsApp.
        </p>
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

    <label className="flex items-start gap-2 text-xs text-ink-600">
      <input
        type="checkbox"
        required
        checked={whatsappConsent}
        onChange={(e) => setWhatsappConsent(e.target.checked)}
        className="mt-0.5"
      />
      <span>J’accepte de recevoir sur WhatsApp les messages liés à cette commande.</span>
    </label>
  </div>
);
