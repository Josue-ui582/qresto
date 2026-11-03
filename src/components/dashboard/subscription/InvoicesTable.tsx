'use client';

import React from 'react';
import { Receipt, Download } from 'lucide-react';
import { InvoiceData } from './types';

interface InvoicesTableProps {
  invoices?: InvoiceData[];
  formatPrice: (amount: number, currency?: string) => string;
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices, formatPrice }) => {
  return (
    <div className="bg-paper-white rounded-3xl p-6 sm:p-8 border border-ink-200/80 shadow-xs">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-2xl bg-ink-100 text-ink-700 flex items-center justify-center">
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-ink-950">
            Historique de facturation
          </h3>
          <p className="text-xs text-ink-500">
            Aucun paiement ni reçu automatique n’est généré tant que l’encaissement n’est pas intégré.
          </p>
        </div>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ink-200 text-ink-400 uppercase tracking-wider font-bold">
                <th className="pb-3 font-bold">Description</th>
                <th className="pb-3 font-bold">Date</th>
                <th className="pb-3 font-bold">Montant</th>
                <th className="pb-3 font-bold">Statut</th>
                <th className="pb-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-ink-50/80 transition-colors">
                  <td className="py-3.5 font-bold text-ink-900">
                    {invoice.description}
                  </td>
                  <td className="py-3.5 text-ink-500">
                    {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3.5 font-black text-ink-950">
                    {formatPrice(invoice.amount, invoice.currency)}
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.625rem] font-bold border ${
                      invoice.status === 'PAID'
                        ? 'bg-positive-50 text-positive-700 border-positive-200'
                        : invoice.status === 'PENDING'
                          ? 'bg-brand-50 text-brand-700 border-brand-200'
                          : 'bg-alert-50 text-alert-700 border-alert-200'
                    }`}>
                      {invoice.status === 'PAID' ? '● À vérifier' : invoice.status === 'PENDING' ? '● En attente' : '● Échouée'}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-xl bg-ink-100 hover:bg-ink-200 text-ink-700 transition-colors cursor-pointer"
                      title="Imprimer le récapitulatif"
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
        <div className="py-8 text-center text-ink-400 text-xs">
          Aucune facture enregistrée pour le moment.
        </div>
      )}
    </div>
  );
};
