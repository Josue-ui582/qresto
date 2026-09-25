'use client';

import React from 'react';
import { Receipt, Download } from 'lucide-react';
import { InvoiceData } from './types';

interface InvoicesTableProps {
  invoices?: InvoiceData[];
  formatPrice: (amount: number) => string;
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices, formatPrice }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-950 font-display">
            Historique des Factures
          </h3>
          <p className="text-xs text-stone-500">
            Téléchargez vos reçus et justificatifs de paiement.
          </p>
        </div>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-bold">
                <th className="pb-3 font-bold">Description</th>
                <th className="pb-3 font-bold">Date</th>
                <th className="pb-3 font-bold">Montant</th>
                <th className="pb-3 font-bold">Statut</th>
                <th className="pb-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-stone-900">
                    {invoice.description}
                  </td>
                  <td className="py-3.5 text-stone-500">
                    {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3.5 font-black text-stone-950">
                    {formatPrice(invoice.amount)}
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      ● Payée
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                      title="Télécharger le reçu"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-stone-400 text-xs">
          Aucune facture enregistrée pour le moment.
        </div>
      )}
    </div>
  );
};
